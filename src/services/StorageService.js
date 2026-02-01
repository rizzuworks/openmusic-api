const fs = require('fs');
const path = require('path');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads/covers');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file, albumId) {
    const filename = `cover-${albumId}-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    return `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
      const filename = fileUrl.split('/').pop();
      const filepath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }
}

module.exports = StorageService;
