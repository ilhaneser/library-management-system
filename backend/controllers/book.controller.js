const Book = require('../models/Book');
const Loan = require('../models/Loan');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      genre,
      available, // Available for loan
      sort = 'title', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    if (available === 'true') filter.activeLoans = { $lt: '$maxConcurrentLoans' };

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

// @desc    Read book PDF file
// @route   GET /api/books/:id/read
// @access  Private
exports.readBookPdf = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if user has an active loan for this book
    const activeLoan = await Loan.findOne({
      user: req.user.id,
      book: req.params.id,
      status: 'active'
    });
    
    if (!activeLoan) {
      return res.status(403).json({
        success: false,
        error: 'You must borrow this book before reading'
      });
    }
    
    // PDF path
    const pdfPath = path.join(__dirname, '..', book.pdfFile.replace(/^\/uploads/, 'uploads'));
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }
    
    // Set security headers to prevent download
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send file to client for inline viewing
    res.sendFile(pdfPath);
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
    const { query, genre } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    
    // Add text search if query provided
    if (query) {
      // Use regex for partial matching instead of text index
      // 'i' flag makes it case insensitive
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add genre filter if provided
    if (genre && genre !== 'all') {
      searchCriteria.genre = genre;
    }
    
    // Execute search
    const books = await Book.find(searchCriteria)
      .limit(20)
      .sort({ title: 1 });
    
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
    // Check if PDF file path is provided
    if (!req.body.pdfFile) {
      return res.status(400).json({
        success: false,
        error: 'PDF file is required'
      });
    }
    
    // Calculate total pages if not provided
    if (!req.body.totalPages) {
      const pdfPath = path.join(__dirname, '..', req.body.pdfFile.replace(/^\/uploads/, 'uploads'));
      if (fs.existsSync(pdfPath)) {
        try {
          const pdfBytes = fs.readFileSync(pdfPath);
          const pdfDoc = await PDFDocument.load(pdfBytes);
          req.body.totalPages = pdfDoc.getPageCount();
        } catch (err) {
          console.error('Error calculating PDF pages:', err);
          req.body.totalPages = 1; // Default if can't calculate
        }
      } else {
        req.body.totalPages = 1; // Default if file not found
      }
    }
    
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
    // If updating PDF, recalculate total pages
    if (req.body.pdfFile && req.body.pdfFile !== req.body.currentPdfFile) {
      const pdfPath = path.join(__dirname, '..', req.body.pdfFile.replace(/^\/uploads/, 'uploads'));
      if (fs.existsSync(pdfPath)) {
        try {
          const pdfBytes = fs.readFileSync(pdfPath);
          const pdfDoc = await PDFDocument.load(pdfBytes);
          req.body.totalPages = pdfDoc.getPageCount();
        } catch (err) {
          console.error('Error calculating PDF pages:', err);
          // Don't update totalPages if can't calculate
        }
      }
    }
    
    // Remove currentPdfFile from data to update
    if (req.body.currentPdfFile) {
      delete req.body.currentPdfFile;
    }
    
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
      status: 'active'
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
    
    // Delete PDF file
    if (book.pdfFile) {
      const pdfPath = path.join(__dirname, '..', book.pdfFile.replace(/^\/uploads/, 'uploads'));
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
    
    // Delete cover image
    if (book.coverImage && book.coverImage !== 'default-book-cover.jpg') {
      const coverPath = path.join(__dirname, '..', book.coverImage.replace(/^\/uploads/, 'uploads'));
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
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