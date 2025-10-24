const cloudinary = require('../configs/cloudinary');
// console.log('cloudinary config:', cloudinary.config());

// Upload single image
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Chỉ chấp nhận file hình ảnh' });
    }

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        thumbnail: cloudinary.url(req.file.filename, {
          width: 300,
          height: 300,
          crop: 'fill'
        })
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload hình ảnh',
      error: error.message
    });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    if (!req.files.every(file => file.mimetype.startsWith('image/'))) {
      return res.status(400).json({ success: false, message: 'Chỉ chấp nhận file hình ảnh' });
    }

    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      thumbnail: cloudinary.url(file.filename, {
        width: 300,
        height: 300,
        crop: 'fill'
      })
    }));

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload hình ảnh',
      error: error.message
    });
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    console.log(1)
    if (!req.files || req.files.length === 0) {
      return res.status(200).json({ message: 'Không có file nào được gửi đi', success: false });
    }

    const filesWithDetails = await Promise.all(
      req.files.map(async (file) => {
        // file.filename chính là public_id
        const publicId = file.filename;
        let duration = 0; // Mặc định duration là 0

        // Chỉ lấy duration cho file video hoặc audio
        if (file.mimetype.startsWith('video') || file.mimetype.startsWith('audio')) {
          try {
            // Gọi Cloudinary Admin API để lấy chi tiết file
            const resourceDetails = await cloudinary.api.resource(publicId, {
              resource_type: 'video', // RẤT QUAN TRỌNG: Cloudinary coi cả audio là resource_type 'video'
              media_metadata: true // Bật cờ này nếu bạn cần thêm các metadata sâu hơn như codec, bitrate...
            });
            console.log('resourceDetails:', resourceDetails);
            // Lấy duration (tính bằng giây)
            if (resourceDetails && resourceDetails.duration) {
              duration = resourceDetails.duration;
            }
          } catch (apiError) {
            console.error(`Không thể lấy chi tiết cho file ${publicId}:`, apiError.message);
            // Có thể bỏ qua lỗi này và tiếp tục với duration = 0
          }
        }

        // Trả về object mới đã bao gồm duration
        return {
          url: file.path,
          publicId: publicId,
          format: file.mimetype,
          size: file.size,
          duration: duration, // Thêm trường duration vào đây
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: filesWithDetails
    });
  } catch (error) {
    console.log(5)
    console.log(error.message)
    return res.status(500).json({ error: error.message });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID là bắt buộc'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Xóa hình ảnh thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa hình ảnh'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hình ảnh',
      error: error.message
    });
  }
};
