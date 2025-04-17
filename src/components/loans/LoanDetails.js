import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';
import AuthContext from '../../context/auth/AuthContext';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  const { setAlert } = alertContext;
  const { user } = authContext;

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingReturn, setProcessingReturn] = useState(false);
  const [processingRenew, setProcessingRenew] = useState(false);

  useEffect(() => {
    fetchLoan();
    // eslint-disable-next-line
  }, [id]);

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`/api/loans/${id}`);
      setLoan(res.data.data);
    } catch (err) {
      setAlert('Error fetching loan details', 'danger');
      navigate('/admin/loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!window.confirm('Are you sure you want to return this book?')) {
      return;
    }

    setProcessingReturn(true);
    try {
      const res = await axios.put(`/api/loans/${id}/return`);
      setLoan(res.data.data);
      setAlert('Book returned successfully', 'success');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error returning book', 'danger');
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleRenewLoan = async () => {
    setProcessingRenew(true);
    try {
      const res = await axios.put(`/api/loans/${id}/renew`);
      setLoan(res.data.data);
      setAlert('Loan renewed successfully', 'success');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error renewing loan', 'danger');
    } finally {
      setProcessingRenew(false);
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

  if (!loan) {
    return (
      <div className="alert alert-danger">
        Loan not found. <Link to="/admin/loans">Go back to loans</Link>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft(loan.dueDate);
  const overdue = isOverdue(loan.dueDate);

  return (
    <div className="loan-details">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-light mb-4"
      >
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Loan Details</h5>
          <span className={`badge badge-${
            loan.status === 'active' 
              ? overdue ? 'danger' : 'success' 
              : loan.status === 'returned' 
                ? 'info' 
                : 'secondary'
          }`}>
            {overdue && loan.status === 'active' ? 'OVERDUE' : loan.status.toUpperCase()}
          </span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3 mb-md-0">
              <img
                src={
                  loan.book.coverImage && loan.book.coverImage !== 'default-book-cover.jpg'
                    ? loan.book.coverImage
                    : '/img/default-book-cover.jpg'
                }
                alt={loan.book.title}
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-9">
              <h4>
                <Link to={`/books/${loan.book._id}`}>
                  {loan.book.title}
                </Link>
              </h4>
              <p className="text-muted mb-3">by {loan.book.author}</p>
              
              <div className="loan-info mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Borrowed by:</strong>{' '}
                      {loan.user.name} ({loan.user.email})
                    </p>
                    <p>
                      <strong>Issue Date:</strong>{' '}
                      {new Date(loan.issueDate).toLocaleDateString()}
                    </p>
                    <p className={overdue ? 'text-danger font-weight-bold' : ''}>
                      <strong>Due Date:</strong>{' '}
                      {new Date(loan.dueDate).toLocaleDateString()}
                      {overdue ? (
                        <span className="badge badge-danger ml-2">
                          {Math.abs(daysLeft)} days overdue
                        </span>
                      ) : (
                        loan.status === 'active' && (
                          <span className="text-muted ml-2">
                            ({daysLeft} days left)
                          </span>
                        )
                      )}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Renewals:</strong> {loan.renewalCount}/2
                    </p>
                    {loan.returnDate && (
                      <p>
                        <strong>Return Date:</strong>{' '}
                        {new Date(loan.returnDate).toLocaleDateString()}
                      </p>
                    )}
                    {loan.fine && loan.fine.amount > 0 && (
                      <p className="text-danger">
                        <strong>Fine:</strong> ${loan.fine.amount.toFixed(2)}{' '}
                        {loan.fine.paid ? '(Paid)' : '(Unpaid)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {loan.status === 'active' && (
                <div className="loan-actions">
                  <div className="btn-group">
                    {(user.role === 'admin' || user.role === 'librarian') && (
                      <button
                        onClick={handleReturnBook}
                        disabled={processingReturn}
                        className="btn btn-primary mr-2"
                      >
                        {processingReturn ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-undo-alt mr-1"></i> Return Book
                          </>
                        )}
                      </button>
                    )}
                    
                    {loan.renewalCount < 2 && !overdue && (
                      <button
                        onClick={handleRenewLoan}
                        disabled={processingRenew}
                        className="btn btn-success"
                      >
                        {processingRenew ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock mr-1"></i> Renew Loan
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loan.notes && (
            <div className="mt-4">
              <h5>Notes</h5>
              <p>{loan.notes}</p>
            </div>
          )}
        </div>
        <div className="card-footer bg-white">
          <small className="text-muted">
            Loan ID: {loan._id} | 
            Issued by: {loan.issuedBy?.name || 'System'}
          </small>
        </div>
      </div>

      {loan.status === 'active' && overdue && (
        <div className="alert alert-danger">
          <h5>
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Overdue Notice
          </h5>
          <p className="mb-0">
            This book is {Math.abs(daysLeft)} days overdue. A fine of ${(Math.abs(daysLeft) * 1).toFixed(2)} has been applied to this loan.
            Please return the book as soon as possible to avoid additional charges.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;