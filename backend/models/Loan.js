const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  renewalCount: {
    type: Number,
    default: 0,
    max: 2 // Maximum number of renewals allowed
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'expired'],
    default: 'active'
  },
  // Last page the user read
  lastReadPage: {
    type: Number,
    default: 1
  },
  // Reading sessions tracking
  readingSessions: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    pagesRead: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Librarian who issued the book
    required: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for calculating if the loan is overdue
LoanSchema.virtual('isOverdue').get(function() {
  if (this.returnDate) return false;
  return new Date() > this.dueDate;
});

// Virtual for calculating days overdue
LoanSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = Math.abs(today - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating reading progress percentage
LoanSchema.virtual('readingProgress').get(function() {
  // This requires populating the book field when querying
  if (!this.populated('book')) return 0;
  
  const totalPages = this.book.totalPages;
  if (!totalPages || totalPages === 0) return 0;
  
  return Math.min(Math.round((this.lastReadPage / totalPages) * 100), 100);
});

// Method to update reading progress
LoanSchema.methods.updateReadingProgress = function(pageNumber, sessionDuration) {
  // Validate page number
  if (pageNumber < 1) pageNumber = 1;
  
  // Only update if the new page is further than the current lastReadPage
  if (pageNumber > this.lastReadPage) {
    const pagesRead = pageNumber - this.lastReadPage;
    this.lastReadPage = pageNumber;
    
    // Add reading session
    const now = new Date();
    const startTime = new Date(now.getTime() - (sessionDuration * 1000));
    
    this.readingSessions.push({
      startTime,
      endTime: now,
      pagesRead
    });
  }
  
  return this.lastReadPage;
};

// Method to renew a loan
LoanSchema.methods.renew = function(daysToAdd = 14) {
  if (this.renewalCount >= 2) return false;
  
  this.renewalCount += 1;
  
  const currentDueDate = new Date(this.dueDate);
  currentDueDate.setDate(currentDueDate.getDate() + daysToAdd);
  this.dueDate = currentDueDate;
  
  return true;
};

// Method to return a book
LoanSchema.methods.returnBook = function() {
  if (this.returnDate) return false;
  
  this.returnDate = new Date();
  this.status = 'returned';
  
  return true;
};

// Add compound index to prevent duplicate active loans
LoanSchema.index({ user: 1, book: 1, returnDate: 1 }, { unique: true, partialFilterExpression: { returnDate: null } });

module.exports = mongoose.model('Loan', LoanSchema);