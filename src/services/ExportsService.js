const amqp = require('amqplib');

class ExportsService {
  constructor() {
    this.queueName = 'export:playlists';
  }

  async sendMessage(playlistId, targetEmail) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      const channel = await connection.createChannel();
      await channel.assertQueue(this.queueName, {
        durable: true,
      });

      const message = JSON.stringify({
        playlistId,
        targetEmail,
      });

      channel.sendToQueue(this.queueName, Buffer.from(message));

      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error sending message to queue:', error);
      throw error;
    }
  }
}

module.exports = ExportsService;
