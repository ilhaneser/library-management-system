const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private (Admin/Librarian)
exports.getLoans = async (req, res) => {
  try {
    const { 
      status, 
      user, 
      book, 
      overdue = 'false', 
      sort = '-issueDate',
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;
    if (book) filter.book = book;
    
    // Handle overdue filter
    if (overdue === 'true') {
      filter.status = 'active';
      filter.dueDate = { $lt: new Date() };
    }
    
    // Count total documents that match the filter
    const total = await Loan.countDocuments(filter);
    
    // Find loans with pagination
    const loans = await Loan.find(filter)
      .populate('user', 'name email')
      .populate('book', 'title author ISBN totalPages coverImage')
      .populate('issuedBy', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user's loans
// @route   GET /api/loans/myloans
// @access  Private (User)
exports.getUserLoans = async (req, res) => {
  try {
    const { status, sort = '-issueDate' } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    
    const loans = await Loan.find(filter)
      .populate('book', 'title author ISBN coverImage totalPages')
      .sort(sort);
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'name email contactNumber')
      .populate('book', 'title author ISBN publisher publicationYear genre totalPages coverImage')
      .populate('issuedBy', 'name');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    // Check if user has access to this loan
    if (
      req.user.role === 'user' && 
      loan.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this loan'
      });
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new loan (borrow book)
// @route   POST /api/loans
// @access  Private (User)
exports.createLoan = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;
    
    // Default loan period (21 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 21);
    
    // Validate required fields
    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Book ID is required'
      });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if book is available for loan
    if (book.activeLoans >= book.maxConcurrentLoans) {
      return res.status(400).json({
        success: false,
        error: 'Book is not available for borrowing at this time'
      });
    }
    
    // Check if user already has an active loan for this book
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: 'active'
    });
    
    if (existingLoan) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active loan for this book'
      });
    }
    
    // Check if user has reached maximum allowed loans
    const activeLoans = await Loan.countDocuments({
      user: userId,
      status: 'active'
    });
    
    const user = await User.findById(userId);
    if (activeLoans >= user.maxBooksAllowed) {
      return res.status(400).json({
        success: false,
        error: `You have reached the maximum limit of ${user.maxBooksAllowed} borrowed books`
      });
    }
    
    // Create loan
    const loan = await Loan.create({
      user: userId,
      book: bookId,
      dueDate: dueDate,
      lastReadPage: 1
    });
    
    // Update book availability
    book.activeLoans += 1;
    book.loanCount += 1;
    await book.save();
    
    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Return book
// @route   PUT /api/loans/:id/return
// @access  Private (User)
exports.returnBook = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    // Check if user owns this loan or is admin/librarian
    if (
      req.user.role === 'user' && 
      loan.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to return this loan'
      });
    }
    
    // Check if book is already returned
    if (loan.returnDate) {
      return res.status(400).json({
        success: false,
        error: 'Book already returned'
      });
    }
    
    // Return the book
    const returned = loan.returnBook();
    if (!returned) {
      return res.status(400).json({
        success: false,
        error: 'Could not process return'
      });
    }
    
    await loan.save();
    
    // Update book availability
    const book = await Book.findById(loan.book);
    book.activeLoans -= 1;
    await book.save();
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Renew loan
// @route   PUT /api/loans/:id/renew
// @access  Private
exports.renewLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    // Check if user is authorized to renew
    if (
      req.user.role === 'user' && 
      loan.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to renew this loan'
      });
    }
    
    // Check if book is already returned
    if (loan.returnDate) {
      return res.status(400).json({
        success: false,
        error: 'Cannot renew returned book'
      });
    }
    
    // Check if loan is overdue
    if (new Date() > loan.dueDate && req.user.role === 'user') {
      return res.status(400).json({
        success: false,
        error: 'Cannot renew overdue loan. Please contact the librarian'
      });
    }
    
    // Renew the loan
    const renewed = loan.renew();
    if (!renewed) {
      return res.status(400).json({
        success: false,
        error: 'Maximum renewals reached'
      });
    }
    
    await loan.save();
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update reading progress
// @route   PUT /api/loans/:id/progress
// @access  Private (User)
exports.updateReadingProgress = async (req, res) => {
  try {
    const { pageNumber, sessionDuration = 300 } = req.body; // Default 5 minutes
    
    if (!pageNumber) {
      return res.status(400).json({
        success: false,
        error: 'Page number is required'
      });
    }
    
    const loan = await Loan.findById(req.params.id).populate('book');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    // Check if user owns this loan
    if (loan.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this loan'
      });
    }
    
    // Check if loan is active
    if (loan.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update reading progress on inactive loan'
      });
    }
    
    // Validate page number
    if (pageNumber > loan.book.totalPages) {
      return res.status(400).json({
        success: false,
        error: `Page number cannot exceed total pages (${loan.book.totalPages})`
      });
    }
    
    // Update reading progress
    loan.updateReadingProgress(pageNumber, sessionDuration);
    await loan.save();
    
    res.status(200).json({
      success: true,
      data: {
        lastReadPage: loan.lastReadPage,
        progress: Math.round((loan.lastReadPage / loan.book.totalPages) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};