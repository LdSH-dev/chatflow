const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const uploadFile = async (file, options = {}) => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum limit of 50MB');
    }

    // Determine file type and resource type
    let resourceType = 'auto';
    let messageType = 'document';

    if (SUPPORTED_IMAGE_TYPES.includes(file.mimetype)) {
      resourceType = 'image';
      messageType = 'image';
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.mimetype)) {
      resourceType = 'video';
      messageType = 'video';
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(file.mimetype)) {
      resourceType = 'raw';
      messageType = 'document';
    } else {
      throw new Error('Unsupported file type');
    }

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: resourceType,
      folder: 'chatflow',
      ...options
    };

    // Convert buffer to base64 for Cloudinary
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64File, uploadOptions);

    // Prepare media object
    const media = {
      url: result.secure_url,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      thumbnail: result.thumbnail_url || result.secure_url,
      duration: result.duration,
      width: result.width,
      height: result.height
    };

    return {
      media,
      messageType,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const deleteFile = async (publicId, resourceType = 'auto') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  MAX_FILE_SIZE
}; 