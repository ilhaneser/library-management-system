const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.get('/myloans', protect, loanController.getUserLoans);

// Protected routes for both users and staff
router.get('/:id', protect, loanController.getLoan);
router.put('/:id/renew', protect, loanController.renewLoan);

// Staff only routes
router.get('/', protect, authorize('admin', 'librarian'), loanController.getLoans);
router.post('/', protect, authorize('admin', 'librarian'), loanController.createLoan);
router.put('/:id/return', protect, authorize('admin', 'librarian'), loanController.returnBook);

module.exports = router;