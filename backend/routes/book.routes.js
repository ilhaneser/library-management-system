const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', bookController.getBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBook);

// Protected routes
router.post('/', protect, authorize('admin', 'librarian'), bookController.addBook);
router.put('/:id', protect, authorize('admin', 'librarian'), bookController.updateBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), bookController.deleteBook);
router.post('/:id/reviews', protect, bookController.addReview);

module.exports = router;