const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: Number,
    required: true,
    index: true
  },
  receiverId: {
    type: Number,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: function() {
      // Content is required only if there's no media
      return !this.media || !this.media.url;
    },
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document'],
    default: 'text'
  },
  // Media fields
  media: {
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    thumbnail: String, // For videos and images
    duration: Number, // For videos in seconds
    width: Number, // For images and videos
    height: Number // For images and videos
  },
  repliedMessageId: {
    type: String,
    ref: 'Message',
    index: true
  },
  delivered: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Custom validation to ensure either content or media is present
messageSchema.pre('validate', function(next) {
  if (!this.content && (!this.media || !this.media.url)) {
    this.invalidate('content', 'Message must have either content or media');
  }
  next();
});

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, delivered: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;