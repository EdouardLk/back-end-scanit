const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cvId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cv',
    required: true
  },
  companyName: { 
    type: String, 
    required: true,
    trim: true
  },
  jobTitle: { 
    type: String, 
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'interview', 'rejected', 'accepted'],
    default: 'pending'
  },
  comments: { 
    type: String,
    required: false,
    trim: true
  },
  applicationDate: { 
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Index pour optimiser les requêtes par utilisateur
ApplicationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema); 