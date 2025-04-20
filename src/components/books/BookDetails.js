import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { isAuthenticated, user } = authContext;
  const { setAlert } = alertContext;

  const [book, setBook] = useState(null);
  const [activeLoan, setActiveLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [review, setReview] = useState({
    rating: 5,
    comment: ''
  });

  const { rating, comment } = review;

  useEffect(() => {
    fetchBook();
    if (isAuthenticated) {
      checkActiveLoan();
    }
    // eslint-disable-next-line
  }, [id, isAuthenticated]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.data);
      console.log("Book cover path from API:", res.data.data.coverImage);
    } catch (err) {
      setAlert('Book not found', 'danger');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };
  
  const checkActiveLoan = async () => {
    try {
      const res = await axios.get('/api/loans/myloans?status=active');
      const userLoans = res.data.data;
      
      // Find active loan for this book
      const loan = userLoans.find(loan => 
        loan.book._id === id && loan.status === 'active'
      );
      
      if (loan) {
        setActiveLoan(loan);
      }
    } catch (err) {
      console.error('Error checking active loans:', err);
    }
  };

  // Function to get the correct image URL directly from backend
  const getImageUrl = (coverImage) => {
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
    
    // Return direct URL to backend
    return `${backendUrl}/direct-file/covers/${filename}`;
  };

  // Check if user has already reviewed this book
  const hasReviewed = book && isAuthenticated && user && book.reviews
    ? book.reviews.some(r => r.user === user._id)
    : false;

  const onChange = e => {
    setReview({
      ...review,
      [e.target.name]: e.target.name === 'rating' 
        ? parseInt(e.target.value)
        : e.target.value
    });
  };

  const onSubmitReview = async e => {
    e.preventDefault();

    if (!isAuthenticated) {
      setAlert('Please login to leave a review', 'danger');
      return;
    }

    if (comment.trim() === '') {
      setAlert('Please enter a comment', 'danger');
      return;
    }

    try {
      const res = await axios.post(`/api/books/${id}/reviews`, review);
      setBook(res.data.data);
      setReview({
        rating: 5,
        comment: ''
      });
      setAlert('Review submitted successfully', 'success');
    } catch (err) {
      setAlert(err.response.data.error || 'Error submitting review', 'danger');
    }
  };
  
  const handleBorrow = async () => {
    if (!isAuthenticated) {
      setAlert('Please login to borrow books', 'danger');
      navigate('/login');
      return;
    }
    
    setBorrowing(true);
    
    try {
      const res = await axios.post('/api/loans', {
        bookId: id
      });
      
      setActiveLoan(res.data.data);
      setAlert('Book borrowed successfully!', 'success');
      
      // Update book data to reflect availability change
      fetchBook();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error borrowing book', 'danger');
    } finally {
      setBorrowing(false);
    }
  };
  
  const handleStartReading = () => {
    if (!activeLoan) return;
    navigate(`/read/${activeLoan._id}`);
  };
  
  const handleReturnBook = async () => {
    if (!activeLoan) return;
    
    try {
      await axios.put(`/api/loans/${activeLoan._id}/return`);
      setActiveLoan(null);
      setAlert('Book returned successfully', 'success');
      
      // Update book data to reflect availability change
      fetchBook();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error returning book', 'danger');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!book) {
    return <h2>Book not found</h2>;
  }

  const {
    title,
    author,
    ISBN,
    publisher,
    publicationYear,
    genre,
    description,
    maxConcurrentLoans,
    activeLoans,
    totalPages,
    coverImage,
    reviews = []
  } = book;
  
  // Check if book is available for loan
  const isAvailableForLoan = activeLoans < maxConcurrentLoans;

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';
    
  // Calculate reading progress
  let readingProgress = 0;
  if (activeLoan) {
    readingProgress = Math.round((activeLoan.lastReadPage / totalPages) * 100);
  }

  return (
    <div className="book-details">
      <button onClick={() => navigate(-1)} className="btn btn-light mb-4">
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>

      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="book-image">
            <img
              src={getImageUrl(coverImage)}
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
          </div>
          
          {/* Book actions */}
          <div className="book-actions mt-3">
            {isAuthenticated && (
              activeLoan ? (
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success btn-lg mb-2"
                    onClick={handleStartReading}
                  >
                    <i className="fas fa-book-reader mr-2"></i> Continue Reading
                  </button>
                  
                  {readingProgress > 0 && (
                    <div className="progress mb-2" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${readingProgress}%` }}
                        aria-valuenow={readingProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {readingProgress}% complete
                      </div>
                    </div>
                  )}
                  
                  <p className="text-center">
                    <small className="text-muted">
                      Last page read: {activeLoan.lastReadPage} of {totalPages}
                    </small>
                  </p>
                  
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleReturnBook}
                  >
                    <i className="fas fa-undo-alt mr-2"></i> Return Book
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-lg btn-block"
                  disabled={!isAvailableForLoan || borrowing}
                  onClick={handleBorrow}
                >
                  {borrowing ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-book mr-2"></i>
                      {isAvailableForLoan ? 'Borrow Book' : 'Not Available'}
                    </>
                  )}
                </button>
              )
            )}
            
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-outline-primary btn-block">
                <i className="fas fa-sign-in-alt mr-2"></i> Login to Borrow
              </Link>
            )}
          </div>
        </div>

        <div className="col-md-8">
          <h1 className="mb-2">{title}</h1>
          <p className="lead text-muted mb-3">By: {author}</p>
          
          <div className="mb-3 d-flex align-items-center">
            <span className="mr-2">Rating:</span>
            <h4 className="mb-0 mr-2">{averageRating}</h4>
            <small className="text-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</small>
          </div>

          <div className="book-meta card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Genre:</strong> {genre}</p>
                  <p><strong>ISBN:</strong> {ISBN}</p>
                  <p><strong>Publisher:</strong> {publisher}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Publication Year:</strong> {publicationYear}</p>
                  <p>
                    <strong>Availability:</strong>{' '}
                    <span className={isAvailableForLoan ? 'text-success' : 'text-danger'}>
                      {activeLoans} of {maxConcurrentLoans} copies in use
                    </span>
                  </p>
                  <p><strong>Total Pages:</strong> {totalPages}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="book-description mb-4">
            <h4>Description</h4>
            <p>{description}</p>
          </div>

          {isAuthenticated && (user.role === 'admin' || user.role === 'librarian') && (
            <div className="admin-actions">
              <button
                onClick={() => navigate(`/admin/books/${id}/edit`)}
                className="btn btn-dark mr-2"
              >
                <i className="fas fa-edit mr-1"></i> Edit Book
              </button>
              <button
                onClick={() => navigate(`/admin/books/${id}/delete`)}
                className="btn btn-danger"
              >
                <i className="fas fa-trash-alt mr-1"></i> Delete Book
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="mb-4">Reviews</h2>

        {!hasReviewed && isAuthenticated && (
          <div className="review-form card mb-4">
            <div className="card-body">
              <h4 className="card-title">Add a Review</h4>
              <form onSubmit={onSubmitReview}>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    name="rating"
                    id="rating"
                    className="form-control"
                    value={rating}
                    onChange={onChange}
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Comment</label>
                  <textarea
                    name="comment"
                    id="comment"
                    className="form-control"
                    value={comment}
                    onChange={onChange}
                    required
                    rows="4"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review this book!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div className="badge badge-primary p-2">
                      Rating: {review.rating}/5
                    </div>
                    <small className="text-muted">
                      {new Date(review.date).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="card-text">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;