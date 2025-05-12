const mongoose = require('mongoose');

const LogErrorSchema = new mongoose.Schema({
    errorMessage: { 
        type: String, 
        required: true },
    date: { 
        type: Date, 
        default: Date.now
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', required: true }
}, { timestamps: true });

module.exports = mongoose.model('log_errors', LogErrorSchema);
