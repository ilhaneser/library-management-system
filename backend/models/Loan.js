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
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active'
  },
  fine: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: {
      type: Date,
      default: null
    }
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Librarian who issued the book
    required: true
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
  
  // Calculate fine if overdue
  if (this.isOverdue) {
    const finePerDay = 1; // $1 per day overdue
    this.fine.amount = this.daysOverdue * finePerDay;
  }
  
  return true;
};

// Method to pay fine
LoanSchema.methods.payFine = function() {
  if (this.fine.paid) return false;
  
  this.fine.paid = true;
  this.fine.paymentDate = new Date();
  
  return true;
};

// Add compound index to prevent duplicate loans
LoanSchema.index({ user: 1, book: 1, returnDate: 1 }, { unique: true, partialFilterExpression: { returnDate: null } });

module.exports = mongoose.model('Loan', LoanSchema);