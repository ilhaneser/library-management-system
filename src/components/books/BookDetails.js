import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({
    rating: 5,
    comment: ''
  });

  const { rating, comment } = review;

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.data);
    } catch (err) {
      setAlert('Book not found', 'danger');
      navigate('/books');
    } finally {
      setLoading(false);
    }
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
    availableCopies,
    copies,
    location,
    coverImage,
    reviews = []
  } = book;

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="book-details">
      <button onClick={() => navigate(-1)} className="btn btn-light mb-4">
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>

      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="book-image">
            <img
              src={coverImage && coverImage !== 'default-book-cover.jpg'
                ? coverImage
                : '/img/default-book-cover.jpg'
              }
              alt={title}
              className="img-fluid"
            />
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
                    <span className={availableCopies > 0 ? 'text-success' : 'text-danger'}>
                      {availableCopies} of {copies} copies available
                    </span>
                  </p>
                  <p>
                    <strong>Location:</strong> {location.section}, Shelf {location.shelf}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="book-description mb-4">
            <h4>Description</h4>
            <p>{description}</p>
          </div>

          <div className="book-actions">
            {isAuthenticated && user.role !== 'admin' && (
              <button
                className="btn btn-primary"
                disabled={availableCopies === 0}
                onClick={() => navigate(`/books/${id}/borrow`)}
              >
                {availableCopies === 0 ? 'Not Available' : 'Borrow Book'}
              </button>
            )}

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