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
  copies: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableCopies: {
    type: Number,
    min: 0,
    default: function() {
      return this.copies;
    }
  },
  location: {
    shelf: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    }
  },
  coverImage: {
    type: String,
    default: 'default-book-cover.jpg'
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

// Add methods to handle book availability
BookSchema.methods.borrow = function() {
  if (this.availableCopies > 0) {
    this.availableCopies -= 1;
    return true;
  }
  return false;
};

BookSchema.methods.return = function() {
  if (this.availableCopies < this.copies) {
    this.availableCopies += 1;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Book', BookSchema);