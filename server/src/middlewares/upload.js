const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../configs/cloudinary');

// Cấu hình storage cho Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'kltn', // Tên folder trên Cloudinary
//     allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'wav', 'ogg', 'pdf', 'docx'], // cho phép upload: ảnh, video, audio, file
//     transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Giới hạn kích thước
//   }
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'kltn/others'; // Folder mặc định cho các file khác
    let transformation = [];
    const resource_type = 'auto';

    // Kiểm tra nếu là file ảnh
    if (file.mimetype.startsWith('image')) {
      folder = 'kltn/images'; // Lưu ảnh vào folder riêng
      transformation = [{ width: 1000, height: 1000, crop: 'limit' }];
    }
    // Kiểm tra nếu là file video
    else if (file.mimetype.startsWith('video')) {
      folder = 'kltn/videos';
    }
    // Kiểm tra nếu là file audio
    else if (file.mimetype.startsWith('audio')) {
      folder = 'kltn/audios';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'wav', 'ogg', 'pdf', 'docx'],
      transformation: transformation,
      resource_type: resource_type // Để Cloudinary tự nhận diện loại file (quan trọng)
    };
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 3 // Giới hạn 30MB
  }
});

module.exports = upload;