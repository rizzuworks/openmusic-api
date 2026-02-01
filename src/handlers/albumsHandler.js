const multer = require('multer');
const AlbumsService = require('../services/AlbumsService');
const StorageService = require('../services/StorageService');
const cacheService = require('../services/CacheService');
const { albumSchema } = require('../validators/albumValidator');
const ClientError = require('../exceptions/ClientError');

const service = new AlbumsService();
const storageService = new StorageService();

cacheService.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

const addAlbumHandler = async (req, res, next) => {
  try {
    const { error, value } = albumSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const albumId = await service.addAlbum(value);
    return res.status(201).json({
      status: 'success',
      data: { albumId },
    });
  } catch (err) {
    return next(err);
  }
};

const getAlbumsHandler = async (req, res, next) => {
  try {
    const albums = await service.getAlbums();
    return res.json({
      status: 'success',
      data: { albums },
    });
  } catch (err) {
    return next(err);
  }
};

const getAlbumByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const album = await service.getAlbumById(id);
    if (!album) throw new ClientError('Album not found', 404);

    const songs = await service.getSongsByAlbumId(id);
    return res.json({
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

const editAlbumByIdHandler = async (req, res, next) => {
  try {
    const { error, value } = albumSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { id } = req.params;
    const ok = await service.editAlbumById(id, value);
    if (!ok) throw new ClientError('Album not found', 404);

    return res.json({
      status: 'success',
      message: 'Album updated',
    });
  } catch (err) {
    return next(err);
  }
};

const deleteAlbumByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ok = await service.deleteAlbumById(id);
    if (!ok) throw new ClientError('Album not found', 404);

    return res.json({
      status: 'success',
      message: 'Album deleted',
    });
  } catch (err) {
    return next(err);
  }
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 512000,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('File harus berupa gambar');
      error.statusCode = 400;
      return cb(error, false);
    }
    return cb(null, true);
  },
}).single('cover');

const uploadAlbumCoverHandler = (req, res, next) => {
  upload(req, res, async (err) => {
    try {
      if (err && err.code === 'LIMIT_FILE_SIZE') {
        return next(new ClientError('Ukuran file terlalu besar. Maksimal 512KB', 413));
      }

      if (err instanceof multer.MulterError) {
        return next(new ClientError(err.message, 400));
      }

      if (err) {
        return next(new ClientError(err.message, err.statusCode || 400));
      }

      if (!req.file) {
        return next(new ClientError('Cover wajib diunggah', 400));
      }

      const { id } = req.params;

      const album = await service.getAlbumById(id);
      if (!album) {
        return next(new ClientError('Album tidak ditemukan', 404));
      }

      if (album.coverUrl) {
        await storageService.deleteFile(album.coverUrl);
      }

      const coverUrl = await storageService.uploadFile(req.file, id);

      await service.updateAlbumCover(id, coverUrl);

      return res.status(201).json({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
    } catch (error) {
      return next(error);
    }
  });
};

const likeAlbumHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const album = await service.getAlbumById(id);
    if (!album) throw new ClientError('Album tidak ditemukan', 404);

    await service.likeAlbum(id, userId);

    await cacheService.delete(`album:${id}:likes`);

    return res.status(201).json({
      status: 'success',
      message: 'Album berhasil disukai',
    });
  } catch (error) {
    if (error.message === 'Album already liked') {
      return next(new ClientError('Anda sudah menyukai album ini', 400));
    }
    return next(error);
  }
};

const unlikeAlbumHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const album = await service.getAlbumById(id);
    if (!album) throw new ClientError('Album tidak ditemukan', 404);

    const ok = await service.unlikeAlbum(id, userId);
    if (!ok) throw new ClientError('Album belum disukai', 404);

    await cacheService.delete(`album:${id}:likes`);

    return res.status(200).json({
      status: 'success',
      message: 'Album berhasil batal disukai',
    });
  } catch (error) {
    return next(error);
  }
};

const getAlbumLikesHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `album:${id}:likes`;

    const cachedLikes = await cacheService.get(cacheKey);
    if (cachedLikes !== null) {
      return res.status(200)
        .set('X-Data-Source', 'cache')
        .json({
          status: 'success',
          data: {
            likes: cachedLikes,
          },
        });
    }

    const album = await service.getAlbumById(id);
    if (!album) throw new ClientError('Album tidak ditemukan', 404);

    const likes = await service.getAlbumLikesCount(id);

    await cacheService.set(cacheKey, likes, 1800);

    return res.status(200).json({
      status: 'success',
      data: {
        likes,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addAlbumHandler,
  getAlbumsHandler,
  getAlbumByIdHandler,
  editAlbumByIdHandler,
  deleteAlbumByIdHandler,
  uploadAlbumCoverHandler,
  likeAlbumHandler,
  unlikeAlbumHandler,
  getAlbumLikesHandler,
};
