import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import AlertContext from '../../context/alert/AlertContext';

const LoanItem = ({ loan, refreshLoans }) => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [processingRenew, setProcessingRenew] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(false);

  const {
    _id,
    book,
    issueDate,
    dueDate,
    returnDate,
    renewalCount,
    status,
    fine
  } = loan;

  const handleRenew = async () => {
    setProcessingRenew(true);
    try {
      await axios.put(`/api/loans/${_id}/renew`);
      setAlert('Loan renewed successfully', 'success');
      if (refreshLoans) refreshLoans();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error renewing loan', 'danger');
    } finally {
      setProcessingRenew(false);
    }
  };

  const handleReturn = async () => {
    if (!window.confirm('Are you sure you want to return this book?')) {
      return;
    }

    setProcessingReturn(true);
    try {
      await axios.put(`/api/loans/${_id}/return`);
      setAlert('Book returned successfully', 'success');
      if (refreshLoans) refreshLoans();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error returning book', 'danger');
    } finally {
      setProcessingReturn(false);
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

  const daysLeft = calculateDaysLeft(dueDate);
  const overdue = isOverdue(dueDate) && status === 'active';

  return (
    <div className={`card mb-3 ${overdue ? 'border-danger' : ''}`}>
      <div className="card-body">
        <div className="row">
          <div className="col-md-2 col-sm-3 mb-3 mb-md-0">
            <img
              src={
                book.coverImage && book.coverImage !== 'default-book-cover.jpg'
                  ? book.coverImage
                  : '/img/default-book-cover.jpg'
              }
              alt={book.title}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-7 col-sm-9">
            <h4>
              <Link to={`/books/${book._id}`}>{book.title}</Link>
            </h4>
            <p className="text-muted mb-1">By: {book.author}</p>
            
            <div className="loan-info mt-3">
              <p>
                <strong>Borrowed:</strong>{' '}
                {new Date(issueDate).toLocaleDateString()}
              </p>
              <p className={overdue ? 'text-danger font-weight-bold' : ''}>
                <strong>Due Date:</strong>{' '}
                {new Date(dueDate).toLocaleDateString()}
                {status === 'active' && (
                  overdue ? (
                    <span className="badge badge-danger ml-2">
                      {Math.abs(daysLeft)} days overdue
                    </span>
                  ) : (
                    <span className="text-muted ml-2">
                      ({daysLeft} days left)
                    </span>
                  )
                )}
              </p>
              {returnDate && (
                <p>
                  <strong>Returned:</strong>{' '}
                  {new Date(returnDate).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge badge-${
                  status === 'active' 
                    ? overdue ? 'danger' : 'success' 
                    : status === 'returned' 
                      ? 'info' 
                      : 'secondary'
                }`}>
                  {status.toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Renewals:</strong> {renewalCount}/2
              </p>
              {fine && fine.amount > 0 && (
                <p className="text-danger">
                  <strong>Fine:</strong> ${fine.amount.toFixed(2)}{' '}
                  {fine.paid ? '(Paid)' : '(Unpaid)'}
                </p>
              )}
            </div>
          </div>
          <div className="col-md-3 d-flex flex-column justify-content-center align-items-center mt-3 mt-md-0">
            <Link 
              to={`/loans/${_id}`} 
              className="btn btn-info btn-block mb-2"
            >
              <i className="fas fa-info-circle mr-1"></i> Details
            </Link>
            
            {status === 'active' && (
              <>
                {renewalCount < 2 && !overdue && (
                  <button
                    onClick={handleRenew}
                    disabled={processingRenew}
                    className="btn btn-success btn-block mb-2"
                  >
                    {processingRenew ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                        Renewing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt mr-1"></i> Renew
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleReturn}
                  disabled={processingReturn}
                  className="btn btn-primary btn-block"
                >
                  {processingReturn ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                      Returning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-undo-alt mr-1"></i> Return
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        {overdue && (
          <div className="alert alert-danger mt-3 mb-0">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            This book is overdue. Please return it as soon as possible to avoid additional fines.
          </div>
        )}
      </div>
    </div>
  );
};

LoanItem.propTypes = {
  loan: PropTypes.object.isRequired,
  refreshLoans: PropTypes.func
};

export default LoanItem;