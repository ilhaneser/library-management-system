import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import axios from 'axios';

const Book = ({ book }) => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { isAuthenticated, user } = authContext;
  const { setAlert } = alertContext;

  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const {
    _id,
    title,
    author,
    ISBN,
    genre,
    description,
    availableCopies,
    copies,
    coverImage,
    hasDigitalVersion
  } = book;

  console.log("Book cover path:", coverImage);

  // Check if user has this book in wishlist
  const inWishlist = isAuthenticated && user && user.wishlist 
    ? user.wishlist.some(wishlistBook => wishlistBook._id === _id)
    : false;

  const addToWishlist = async () => {
    if (!isAuthenticated) {
      setAlert('Please login to add books to your wishlist', 'danger');
      return;
    }

    setIsAddingToWishlist(true);

    try {
      await axios.post(`/api/users/wishlist/${_id}`);
      setAlert('Book added to wishlist', 'success');
      
      // Update the user context to reflect the change
      authContext.loadUser();
    } catch (err) {
      setAlert(err.response.data.error || 'Error adding book to wishlist', 'danger');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const removeFromWishlist = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsAddingToWishlist(true);

    try {
      await axios.delete(`/api/users/wishlist/${_id}`);
      setAlert('Book removed from wishlist', 'success');
      
      // Update the user context to reflect the change
      authContext.loadUser();
    } catch (err) {
      setAlert(err.response.data.error || 'Error removing book from wishlist', 'danger');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Function to get the correct image URL directly from backend
  const getImageUrl = () => {
    // Get the backend URL from axios defaults or use the default
    const backendUrl = axios.defaults.baseURL || 'http://localhost:5001';
    
    // Handle empty or default case
    if (!coverImage || coverImage === 'default-book-cover.jpg') {
      return '/img/default-book-cover.jpg';
    }
    
    // Extract just the filename regardless of path format
    let filename;
    if (coverImage.includes('/')) {
      // If it has a path, extract just the filename
      filename = coverImage.split('/').pop();
    } else {
      // It's already just a filename
      filename = coverImage;
    }
    
    // Return direct URL to backend with token for authentication
    return `${backendUrl}/direct-file/covers/${filename}`;
  };

  return (
    <div className="card book-card shadow-sm h-100">
      <div className="book-cover position-relative">
        <img
          src={getImageUrl()}
          alt={title}
          className="img-fluid"
          onError={(e) => {
            // Only log the error if this isn't already the default image
            if (!e.target.src.includes('default-book-cover.jpg')) {
              console.error("Failed to load image:", e.target.src);
              e.target.src = '/img/default-book-cover.jpg';
              // Prevent infinite error loops by removing the error handler after fallback
              e.target.onerror = null;
            }
          }}
        />
        {/* Add PDF badge if digital version is available */}
        {hasDigitalVersion && (
          <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
            <span className="badge badge-pill badge-success">
              <i className="fas fa-file-pdf mr-1"></i> PDF
            </span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted mb-1">By: {author}</p>
        <p className="card-text small mb-1">
          <span className="badge badge-pill badge-light">{genre}</span>
        </p>
        <p className="card-text small mb-2">
          <span className={`badge badge-pill ${availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
            {availableCopies > 0 ? 'Available' : 'Not Available'}
          </span>
          <small className="text-muted ml-2">
            {availableCopies} of {copies} copies
          </small>
        </p>
        <p className="card-text flex-grow-1">
          {description && description.length > 100
            ? `${description.substring(0, 100)}...`
            : description}
        </p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <Link to={`/books/${_id}`} className="btn btn-sm btn-primary">
            View Details
          </Link>
          {isAuthenticated && (
            inWishlist ? (
              <button 
                onClick={removeFromWishlist} 
                className="btn btn-sm btn-outline-secondary"
                disabled={isAddingToWishlist}
              >
                {isAddingToWishlist ? (
                  <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-heart text-danger mr-1"></i>
                )}
                Remove
              </button>
            ) : (
              <button 
                onClick={addToWishlist} 
                className="btn btn-sm btn-outline-secondary"
                disabled={isAddingToWishlist || availableCopies === 0}
              >
                {isAddingToWishlist ? (
                  <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="far fa-heart mr-1"></i>
                )}
                Wishlist
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

Book.propTypes = {
  book: PropTypes.object.isRequired
};

export default Book;