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
  score: {
    ats: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    readability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  analysisDetails: {
    keywordMatches: [{
      keyword: String,
      count: Number
    }],
    suggestions: [{
      type: String,
      category: {
        type: String,
        enum: ['format', 'content', 'keywords', 'grammar']
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low']
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'error'],
    default: 'pending'
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

// Méthode pour calculer le score global
CVSchema.methods.calculateOverallScore = function() {
  const weights = {
    ats: 0.6,        // 60% du score
    readability: 0.4, // 40% du score
  };

  this.score.overall = Math.round(
    this.score.ats * weights.ats +
    this.score.readability * weights.readability
  );

  return this.score.overall;
};

module.exports = mongoose.model('cv', CVSchema);
