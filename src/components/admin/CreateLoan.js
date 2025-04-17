import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertContext from '../../context/alert/AlertContext';
import Spinner from '../layout/Spinner';

const CreateLoan = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchBooks();

    // Set default due date (14 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(
        books.filter(
          book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.ISBN.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, books]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAlert('Error fetching users', 'danger');
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/books?available=true');
      setBooks(res.data.data);
      setFilteredBooks(res.data.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setAlert('Error fetching books', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBook) {
      setAlert('Please select a book', 'danger');
      return;
    }

    if (!selectedUser) {
      setAlert('Please select a user', 'danger');
      return;
    }

    if (!dueDate) {
      setAlert('Please select a due date', 'danger');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/loans', {
        userId: selectedUser,
        bookId: selectedBook._id,
        dueDate
      });

      setAlert('Loan created successfully', 'success');
      navigate('/admin/loans');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error creating loan';
      setAlert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="create-loan">
      <h1 className="mb-4">Create New Loan</h1>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6">
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
              </div>
              <div className="col-md-6">
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
              </div>
            </div>

            <div className="book-search mb-4">
              <div className="form-group">
                <label>Search Books</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="book-list">
              <h5>Available Books</h5>
              {filteredBooks.length === 0 ? (
                <p className="text-muted">No books available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Available Copies</th>
                        <th>Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map(book => (
                        <tr
                          key={book._id}
                          className={selectedBook && selectedBook._id === book._id ? 'table-primary' : ''}
                        >
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.ISBN}</td>
                          <td>{book.availableCopies}</td>
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                selectedBook && selectedBook._id === book._id
                                  ? 'btn-success'
                                  : 'btn-outline-primary'
                              }`}
                              onClick={() => handleBookSelect(book)}
                              disabled={book.availableCopies === 0}
                            >
                              {selectedBook && selectedBook._id === book._id ? (
                                <i className="fas fa-check"></i>
                              ) : (
                                'Select'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-4 text-right">
              <button
                type="button"
                className="btn btn-light mr-2"
                onClick={() => navigate('/admin/loans')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedBook || !selectedUser || !dueDate || submitting}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLoan;