# 🎵 OpenMusic API

OpenMusic API is a RESTful API for managing albums, songs, playlists, and user authentication.

## 🚀 Features
- Authentication (JWT)
- Album & Song CRUD
- User Playlists
- Playlist Collaboration
- Album Likes

## 🛠️ Tech Stack
Node.js, Express.js, PostgreSQL

## 🔐 Create env
```bash
HOST=localhost
PORT=5000

PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432

ACCESS_TOKEN_KEY=your_access_token_key
REFRESH_TOKEN_KEY=your_refresh_token_key
ACCESS_TOKEN_AGE=1800
```

## ▶️ Run
```bash
npm install
npm run migrate up
npm run start
```

## 📌 Main Endpoints
### Albums
- POST /albums
- GET /albums/{id}
- PUT /albums/{id}
- DELETE /albums/{id}

### Songs
- POST /songs
- GET /songs
- GET /songs/{id}

### Playlists
- POST /playlists
- GET /playlists
- POST /playlists/{id}/songs
- GET /playlists/{id}/songs
