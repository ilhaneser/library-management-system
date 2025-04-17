import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import AlertContext from '../../context/alert/AlertContext';
import axios from 'axios';

const CreateLoanForm = ({ bookId, onSuccess }) => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBook();

    // Set default due date (14 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, [bookId]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAlert('Error fetching users', 'danger');
    }
  };

  const fetchBook = async () => {
    try {
      const res = await axios.get(`/api/books/${bookId}`);
      setBook(res.data.data);
    } catch (err) {
      console.error('Error fetching book:', err);
      setAlert('Error fetching book details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setAlert('Please select a user', 'danger');
      return;
    }

    if (!dueDate) {
      setAlert('Please select a due date', 'danger');
      return;
    }

    if (book && book.availableCopies <= 0) {
      setAlert('This book is not available for borrowing', 'danger');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/loans', {
        userId: selectedUser,
        bookId,
        dueDate
      });

      setAlert('Loan created successfully', 'success');
      
      // Reset form
      setSelectedUser('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error creating loan';
      setAlert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (book && book.availableCopies <= 0) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        This book is currently not available for borrowing.
      </div>
    );
  }

  return (
    <div className="create-loan-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userSelect">Select User</label>
          <select
            className="form-control"
            id="userSelect"
            value={selectedUser}
            onChange={handleUserChange}
            required
          >
            <option value="">-- Select User --</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            className="form-control"
            id="dueDate"
            value={dueDate}
            onChange={handleDueDateChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !selectedUser || !dueDate}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
              Creating Loan...
            </>
          ) : (
            'Create Loan'
          )}
        </button>
      </form>
    </div>
  );
};

CreateLoanForm.propTypes = {
  bookId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func
};

export default CreateLoanForm;