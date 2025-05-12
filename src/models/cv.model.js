const mongoose = require('mongoose');

const CVSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
   },
  content: { 
    type: Array,     
    required: true
   },
  createdAt: { 
    type: Date,
     default: Date.now
   },
  updatedAt: { 
    type: Date,
     default: Date.now
   },
  AIGenerated: { 
    type: Boolean,
     required: true,
     default: false
   },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'users',
     required: true
   }
}, { timestamps: true });

module.exports = mongoose.model('cv', CVSchema);
