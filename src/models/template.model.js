const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true, unique: true
    },
    content: { 
        type: String,
        required: true
    },
    tier: { type: String,
        required: true, 
        enum: ['free', 'premium'],
        default: 'free'
    },
    price: { type: Number,
        required: true, 
        default: 0
    },
    genres: { type: [String],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('templates', TemplateSchema);
