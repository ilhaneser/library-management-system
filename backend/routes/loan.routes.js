const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.get('/myloans', protect, loanController.getUserLoans);
router.post('/', protect, loanController.createLoan);  // Users can create their own loans (borrow books)

// Protected routes for both users and staff
router.get('/:id', protect, loanController.getLoan);
router.put('/:id/renew', protect, loanController.renewLoan);
router.put('/:id/return', protect, loanController.returnBook);

// Reading progress route
router.put('/:id/progress', protect, loanController.updateReadingProgress);

// Staff only routes
router.get('/', protect, authorize('admin', 'librarian'), loanController.getLoans);

module.exports = router;