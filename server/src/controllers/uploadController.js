const cloudinary = require('../configs/cloudinary');
// console.log('cloudinary config:', cloudinary.config());

// Upload single image
exports.uploadSingleImage = async (req, res) => {
  try {
    console.log('req.file: ', req.file);
    console.log('cloudinary', cloudinary);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    console.log(2)
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
