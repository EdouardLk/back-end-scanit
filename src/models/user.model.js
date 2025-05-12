const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String,
     required: true
   },
  lastName: { 
    type: String,
     required: true
   },
  userName: { 
    type: String,
     required: true, unique: true
   },
  email: { 
    type: String,
     required: true, unique: true
   },
  password: { 
    type: String,
     required: true
   },
  credits: { 
    type: Number,
     required: true,
     default: 0
   },
  phone: { 
    type: String,
     required: true
   },
  role: { 
    type: String,
     required: true,
     enum: ['user', 'admin', 'moderator'],
     default: 'user' },
  tier: { 
    type: String,
     required: true,
     enum: ['freemium', 'premium'],
     default: 'freemium' }
}, { timestamps: true });

module.exports = mongoose.model('users', UserSchema);
