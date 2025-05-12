const mongoose = require('mongoose');

const TemplatesUsersSchema = new mongoose.Schema({  
    
   templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'templates',
    required: true
   }, 
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'users',
     required: true
   }
}, { timestamps: true });

module.exports = mongoose.model('templates_users', TemplatesUsersSchema);
