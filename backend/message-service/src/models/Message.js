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
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
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

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, delivered: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;