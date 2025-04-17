import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';

const BorrowBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { isAuthenticated, user } = authContext;
  const { setAlert } = alertContext;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [activeLoans, setActiveLoans] = useState(0);
  const [loanDuration, setLoanDuration] = useState(14); // Default to 14 days

  useEffect(() => {
    if (!isAuthenticated) {
      setAlert('Please login to borrow books', 'danger');
      navigate('/login');
      return;
    }

    fetchBook();
    fetchActiveLoans();
    // eslint-disable-next-line
  }, [id, isAuthenticated]);

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

  const fetchActiveLoans = async () => {
    try {
      const res = await axios.get('/api/loans/myloans?status=active');
      setActiveLoans(res.data.count);
    } catch (err) {
      console.error('Error fetching active loans:', err);
    }
  };

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      setAlert('Please login to borrow books', 'danger');
      navigate('/login');
      return;
    }

    // Check if user has reached maximum allowed loans
    if (activeLoans >= user.maxBooksAllowed) {
      setAlert(`You have reached the maximum limit of ${user.maxBooksAllowed} books`, 'danger');
      return;
    }

    setBorrowing(true);

    try {
      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(loanDuration));

      // Create loan (this is different for user vs. librarian)
      if (user.role === 'user') {
        // For regular users, create a loan request
        await axios.post('/api/loans/request', {
          bookId: id,
          dueDate
        });
        setAlert('Loan request submitted successfully', 'success');
      } else {
        // For librarians/admins, create the loan directly
        await axios.post('/api/loans', {
          userId: user._id,
          bookId: id,
          dueDate
        });
        setAlert('Book borrowed successfully', 'success');
      }

      // Redirect to my loans page
      navigate('/myloans');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error borrowing book', 'danger');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!book) {
    return <h2>Book not found</h2>;
  }

  // Check if book is available
  if (book.availableCopies <= 0) {
    return (
      <div className="borrow-container card shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Borrow Book</h2>
          <div className="alert alert-danger">
            This book is currently not available for borrowing.
          </div>
          <button onClick={() => navigate(`/books/${id}`)} className="btn btn-light">
            Back to Book Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h2 className="mb-0">Borrow Book</h2>
      </div>
      
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-3">
            <img
              src={book.coverImage && book.coverImage !== 'default-book-cover.jpg'
                ? book.coverImage
                : '/img/default-book-cover.jpg'
              }
              alt={book.title}
              className="img-fluid rounded"
            />
          </div>

          <div className="col-md-9">
            <h3>{book.title}</h3>
            <p className="text-muted mb-2">By: {book.author}</p>
            
            <div className="book-meta mb-3">
              <span className="badge badge-pill badge-light mr-2">{book.genre}</span>
              <span className="badge badge-pill badge-light mr-2">ISBN: {book.ISBN}</span>
              <span className={`badge badge-pill ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.availableCopies} of {book.copies} available
              </span>
            </div>
          </div>
        </div>

        <div className="loan-details card bg-light mb-4">
          <div className="card-body">
            <h4 className="card-title">Loan Details</h4>
            
            <div className="form-group">
              <label htmlFor="loanDuration">Loan Duration (days)</label>
              <select
                id="loanDuration"
                className="form-control"
                name="loanDuration"
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <p>
                  <strong>Due Date:</strong>{' '}
                  {new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>Current Active Loans:</strong> {activeLoans} of {user.maxBooksAllowed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeLoans >= user.maxBooksAllowed && (
          <div className="alert alert-danger mb-4">
            You have reached the maximum limit of {user.maxBooksAllowed} books.
            Please return some books before borrowing new ones.
          </div>
        )}

        <div className="d-flex justify-content-between">
          <button onClick={() => navigate(`/books/${id}`)} className="btn btn-light">
            Cancel
          </button>
          <button
            onClick={handleBorrow}
            disabled={borrowing || activeLoans >= user.maxBooksAllowed}
            className="btn btn-primary"
          >
            {borrowing ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Confirm Borrow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowBook;