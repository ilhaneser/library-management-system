import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import AlertContext from '../../context/alert/AlertContext';

const BookReview = ({ bookId, onReviewAdded }) => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [review, setReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { rating, comment } = review;

  const onChange = e => {
    setReview({
      ...review,
      [e.target.name]: e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value
    });
  };

  const onSubmit = async e => {
    e.preventDefault();

    if (comment.trim() === '') {
      setAlert('Please enter a review comment', 'danger');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`/api/books/${bookId}/reviews`, review);
      
      // Reset form
      setReview({
        rating: 5,
        comment: ''
      });
      
      setAlert('Review submitted successfully', 'success');
      
      // Notify parent component to refresh book data
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error submitting review', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="book-review card shadow-sm">
      <div className="card-header bg-light">
        <h4 className="mb-0">Write a Review</h4>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
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
              <option value="5">★★★★★ (5 - Excellent)</option>
              <option value="4">★★★★☆ (4 - Very Good)</option>
              <option value="3">★★★☆☆ (3 - Good)</option>
              <option value="2">★★☆☆☆ (2 - Fair)</option>
              <option value="1">★☆☆☆☆ (1 - Poor)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              name="comment"
              id="comment"
              className="form-control"
              value={comment}
              onChange={onChange}
              placeholder="Share your thoughts about this book..."
              rows="5"
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

BookReview.propTypes = {
  bookId: PropTypes.string.isRequired,
  onReviewAdded: PropTypes.func
};

export default BookReview;