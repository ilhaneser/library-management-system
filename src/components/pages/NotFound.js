import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found text-center py-5">
      <div className="display-1 text-muted mb-4">
        <i className="fas fa-exclamation-circle"></i> 404
      </div>
      <h1 className="mb-4">Page Not Found</h1>
      <p className="lead mb-5">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      <div className="d-flex justify-content-center">
        <Link to="/" className="btn btn-primary mr-3">
          <i className="fas fa-home mr-2"></i> Go to Home
        </Link>
        <Link to="/books" className="btn btn-outline-primary">
          <i className="fas fa-search mr-2"></i> Browse Books
        </Link>
      </div>
    </div>
  );
};

export default NotFound;