const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

// Wishlist routes
router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist/:bookId', protect, userController.addToWishlist);
router.delete('/wishlist/:bookId', protect, userController.removeFromWishlist);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getUsers);
router.put('/:id/role', protect, authorize('admin'), userController.updateUserRole);

module.exports = router;