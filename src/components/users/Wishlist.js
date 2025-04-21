import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

// Helper function for book cover images
const getBookCoverUrl = (coverImage) => {
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
  
  // Handle different path formats
  if (coverImage.startsWith('/uploads/')) {
    return `${backendUrl}${coverImage}`;
  }
  
  // Return direct URL to backend
  return `${backendUrl}/direct-file/covers/${filename}`;
};

// Book component specifically for the wishlist
const WishlistBook = ({ book, removeFromWishlist }) => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const [removing, setRemoving] = useState(false);

  const handleRemoveFromWishlist = async () => {
    if (!book || !book._id) return;
    
    setRemoving(true);
    try {
      await axios.delete(`/api/users/wishlist/${book._id}`);
      setAlert('Book removed from wishlist', 'success');
      if (removeFromWishlist) {
        removeFromWishlist(book._id);
      }
    } catch (err) {
      console.error('Error removing book from wishlist:', err);
      setAlert('Error removing book from wishlist', 'danger');
    } finally {
      setRemoving(false);
    }
  };

  if (!book) {
    return null;
  }

  return (
    <div className="card h-100">
      <div className="position-relative">
        <img
          src={getBookCoverUrl(book.coverImage)}
          alt={book.title || "Book cover"}
          className="card-img-top"
          style={{ height: '250px', objectFit: 'cover' }}
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.src = '/img/default-book-cover.jpg';
            e.target.onerror = null;
          }}
        />
        <button 
          className="btn btn-sm btn-danger position-absolute" 
          style={{ top: '10px', right: '10px' }}
          onClick={handleRemoveFromWishlist}
          disabled={removing}
        >
          {removing ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <i className="fas fa-times"></i>
          )}
        </button>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{book.title}</h5>
        <p className="card-text text-muted">{book.author}</p>
        <div className="mt-auto">
          <Link to={`/books/${book._id}`} className="btn btn-primary btn-block">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/api/users/wishlist');
      console.log('Wishlist response:', res.data);
      
      // Make sure we only include valid books
      const validBooks = res.data.data ? res.data.data.filter(book => book && book._id) : [];
      setWishlist(validBooks);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setAlert('Error fetching wishlist', 'danger');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (bookId) => {
    setWishlist(wishlist.filter(book => book._id !== bookId));
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="wishlist">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Wishlist</h1>
        <Link to="/books" className="btn btn-primary">
          <i className="fas fa-search mr-1"></i> Browse Books
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle mr-2"></i>
          Your wishlist is empty. Browse books and add them to your wishlist.
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            You have {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} in your wishlist.
          </p>
          
          <div className="row">
            {wishlist.map((book) => (
              <div key={book._id} className="col-md-6 col-lg-3 mb-4">
                <WishlistBook 
                  book={book} 
                  removeFromWishlist={removeFromWishlist}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;