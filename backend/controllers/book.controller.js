const Book = require('../models/Book');
const Loan = require('../models/Loan');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      genre, 
      available, 
      sort = 'title', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    if (available === 'true') filter.availableCopies = { $gt: 0 };

    // Count total documents that match the filter
    const total = await Book.countDocuments(filter);
    
    // Sort and paginate results
    const books = await Book.find(filter)
      .sort(sort.startsWith('-') ? sort : `${sort}`)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Use text index for search
    const books = await Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
exports.addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Book with this ISBN already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
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

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin/Librarian)
exports.deleteBook = async (req, res) => {
  try {
    // Check if book has active loans
    const activeLoans = await Loan.find({
      book: req.params.id,
      returnDate: null
    });
    
    if (activeLoans.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete book with active loans'
      });
    }
    
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private (User)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Rating and comment are required'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if user has already reviewed this book
    const hasReviewed = book.reviews.find(
      review => review.user.toString() === req.user.id
    );
    
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this book'
      });
    }
    
    // Add review
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };
    
    book.reviews.push(review);
    await book.save();
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};