const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  ISBN: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  publicationYear: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // PDF file path (required for all books)
  pdfFile: {
    type: String,
    required: true
  },
  // Number of concurrent loans allowed
  maxConcurrentLoans: {
    type: Number,
    required: true,
    min: 1,
    default: 3
  },
  // Current number of active loans
  activeLoans: {
    type: Number,
    default: 0,
    min: 0
  },
  // Book cover image
  coverImage: {
    type: String,
    default: 'default-book-cover.jpg'
  },
  // Total pages in the PDF
  totalPages: {
    type: Number,
    required: true,
    min: 1
  },
  // Total loan count (for popularity tracking)
  loanCount: {
    type: Number,
    default: 0
  },
  addedOn: {
    type: Date,
    default: Date.now
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Add text index for search functionality
BookSchema.index({ 
  title: 'text', 
  author: 'text', 
  genre: 'text', 
  description: 'text' 
});

// Check if book is available for loan
BookSchema.virtual('isAvailableForLoan').get(function() {
  return this.activeLoans < this.maxConcurrentLoans;
});

// Method to increment active loans
BookSchema.methods.incrementLoan = function() {
  if (this.activeLoans < this.maxConcurrentLoans) {
    this.activeLoans += 1;
    this.loanCount += 1;
    return true;
  }
  return false;
};

// Method to decrement active loans
BookSchema.methods.decrementLoan = function() {
  if (this.activeLoans > 0) {
    this.activeLoans -= 1;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Book', BookSchema);