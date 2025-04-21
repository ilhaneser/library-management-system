import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

// Helper function to handle image paths
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

const MyLoans = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [loans, setLoans] = useState({
    active: [],
    returned: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [renewingId, setRenewingId] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      // Fetch active loans
      const activeRes = await axios.get('/api/loans/myloans?status=active');
      
      // Fetch returned loans
      const returnedRes = await axios.get('/api/loans/myloans?status=returned');
      
      // Filter out loans with null book references
      const validActiveLoans = activeRes.data.data ? 
        activeRes.data.data.filter(loan => loan && loan.book) : [];
      
      const validReturnedLoans = returnedRes.data.data ? 
        returnedRes.data.data.filter(loan => loan && loan.book) : [];
      
      setLoans({
        active: validActiveLoans,
        returned: validReturnedLoans
      });
    } catch (err) {
      console.error('Error fetching loans:', err);
      setAlert('Error fetching loans', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    try {
      await axios.put(`/api/loans/${loanId}/renew`);
      setAlert('Loan renewed successfully', 'success');
      fetchLoans();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error renewing loan', 'danger');
    } finally {
      setRenewingId(null);
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate) => {
    return calculateDaysLeft(dueDate) < 0;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="my-loans">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Loans</h1>
        <Link to="/books" className="btn btn-primary">
          <i className="fas fa-book mr-1"></i> Browse Books
        </Link>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Loans ({loans.active.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            Returned Books ({loans.returned.length})
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'active' ? 'show active' : ''}`}>
          {loans.active.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle mr-2"></i>
              You don't have any active loans.
            </div>
          ) : (
            loans.active.map((loan) => (
              <div 
                key={loan._id} 
                className={`card mb-3 ${isOverdue(loan.dueDate) ? 'border-danger' : ''}`}
              >
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 col-sm-3 mb-3 mb-md-0">
                      {loan.book && (
                        <img
                          src={getBookCoverUrl(loan.book.coverImage)}
                          alt={loan.book.title || "Book cover"}
                          className="img-fluid rounded"
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = '/img/default-book-cover.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      )}
                    </div>
                    <div className="col-md-7 col-sm-9">
                      {loan.book ? (
                        <>
                          <h4>
                            <Link to={`/books/${loan.book._id}`}>
                              {loan.book.title}
                            </Link>
                          </h4>
                          <p className="text-muted mb-1">By: {loan.book.author}</p>
                        </>
                      ) : (
                        <h4>Book information unavailable</h4>
                      )}
                      
                      <div className="loan-info mt-3">
                        <p>
                          <strong>Borrowed:</strong>{' '}
                          {new Date(loan.issueDate).toLocaleDateString()}
                        </p>
                        <p className={isOverdue(loan.dueDate) ? 'text-danger font-weight-bold' : ''}>
                          <strong>Due Date:</strong>{' '}
                          {new Date(loan.dueDate).toLocaleDateString()}
                          {isOverdue(loan.dueDate) ? (
                            <span className="badge badge-danger ml-2">OVERDUE</span>
                          ) : (
                            <span> ({calculateDaysLeft(loan.dueDate)} days left)</span>
                          )}
                        </p>
                        <p>
                          <strong>Renewals:</strong> {loan.renewalCount}/2
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3 d-flex flex-column justify-content-center align-items-center mt-3 mt-md-0">
                      {loan.renewalCount < 2 && !isOverdue(loan.dueDate) && (
                        <button
                          onClick={() => handleRenew(loan._id)}
                          disabled={renewingId === loan._id}
                          className="btn btn-primary btn-block"
                        >
                          {renewingId === loan._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                              Renewing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sync-alt mr-1"></i> Renew Loan
                            </>
                          )}
                        </button>
                      )}
                      {loan.book && (
                        <Link to={`/books/${loan.book._id}`} className="btn btn-outline-secondary btn-block mt-2">
                          <i className="fas fa-book mr-1"></i> View Book
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {isOverdue(loan.dueDate) && (
                    <div className="alert alert-danger mt-3 mb-0">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      This book is overdue. Please return it as soon as possible to avoid additional fines.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`tab-pane fade ${activeTab === 'returned' ? 'show active' : ''}`}>
          {loans.returned.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle mr-2"></i>
              You haven't returned any books yet.
            </div>
          ) : (
            loans.returned.map((loan) => (
              <div key={loan._id} className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 col-sm-3 mb-3 mb-md-0">
                      {loan.book && (
                        <img
                          src={getBookCoverUrl(loan.book.coverImage)}
                          alt={loan.book.title || "Book cover"}
                          className="img-fluid rounded"
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = '/img/default-book-cover.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      )}
                    </div>
                    <div className="col-md-7 col-sm-9">
                      {loan.book ? (
                        <>
                          <h4>
                            <Link to={`/books/${loan.book._id}`}>
                              {loan.book.title}
                            </Link>
                          </h4>
                          <p className="text-muted mb-1">By: {loan.book.author}</p>
                        </>
                      ) : (
                        <h4>Book information unavailable</h4>
                      )}
                      
                      <div className="loan-info mt-3">
                        <p>
                          <strong>Borrowed:</strong>{' '}
                          {new Date(loan.issueDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Due Date:</strong>{' '}
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Returned:</strong>{' '}
                          {new Date(loan.returnDate).toLocaleDateString()}
                        </p>
                        {loan.fine && loan.fine.amount > 0 && (
                          <p className="text-danger">
                            <strong>Fine:</strong> ${loan.fine.amount.toFixed(2)}{' '}
                            {loan.fine.paid ? '(Paid)' : '(Unpaid)'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 d-flex flex-column justify-content-center align-items-center mt-3 mt-md-0">
                      {loan.book && (
                        <Link to={`/books/${loan.book._id}`} className="btn btn-outline-secondary btn-block">
                          <i className="fas fa-book mr-1"></i> View Book
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLoans;