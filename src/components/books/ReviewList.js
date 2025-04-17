import React from 'react';
import PropTypes from 'prop-types';

const ReviewList = ({ reviews }) => {
  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-book-reader fa-3x text-muted mb-3"></i>
        <p className="mb-0">No reviews yet. Be the first to review this book!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      <h4 className="mb-3">
        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
      </h4>
      
      {reviews.map((review, index) => (
        <div key={index} className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="mr-2">{renderStars(review.rating)}</span>
                <span className="font-weight-bold">{review.rating}/5</span>
              </div>
              <small className="text-muted">
                {formatDate(review.date)}
              </small>
            </div>
            
            <p className="card-text">{review.comment}</p>
            
            {review.user && (
              <div className="review-footer text-right">
                <small className="text-muted">
                  by {review.user.name || 'Anonymous User'}
                </small>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.array.isRequired
};

export default ReviewList;