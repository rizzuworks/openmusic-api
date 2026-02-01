require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function getPlaylistData(playlistId) {
  try {
    const playlistQuery = await pool.query(
      'SELECT id, name FROM playlists WHERE id = $1',
      [playlistId],
    );

    if (playlistQuery.rowCount === 0) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistQuery.rows[0];

    const songsQuery = await pool.query(
      `
      SELECT s.id, s.title, s.performer 
      FROM songs s
      INNER JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
      `,
      [playlistId],
    );

    return {
      playlist: {
        id: playlist.id,
        name: playlist.name,
        songs: songsQuery.rows,
      },
    };
  } catch (error) {
    console.error('Error getting playlist data:', error);
    throw error;
  }
}

async function sendEmail(targetEmail, playlistData) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: 'Terlampir hasil ekspor playlist Anda',
      attachments: [
        {
          filename: 'playlist.json',
          content: JSON.stringify(playlistData, null, 2),
          contentType: 'application/json',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function main() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    const queueName = 'export:playlists';
    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(`Consumer waiting for messages in queue: ${queueName}`);

    channel.consume(
      queueName,
      async (message) => {
        try {
          const { playlistId, targetEmail } = JSON.parse(message.content.toString());
          console.log(`Processing export for playlist: ${playlistId}, target: ${targetEmail}`);

          const playlistData = await getPlaylistData(playlistId);

          await sendEmail(targetEmail, playlistData);

          console.log(`Export successful for playlist: ${playlistId}`);
          channel.ack(message);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      },
    );
  } catch (error) {
    console.error('Fatal error in consumer:', error);
    process.exit(1);
  }
}

main();
