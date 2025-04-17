import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const DeleteBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.data);
    } catch (err) {
      setAlert('Error fetching book details', 'danger');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTitleChange = (e) => {
    setConfirmTitle(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleCancel = () => {
    navigate(`/admin/books/${id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    // Validate confirmation
    if (confirmTitle !== book.title) {
      setAlert('Please enter the correct book title to confirm deletion', 'danger');
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`/api/books/${id}`);
      setAlert('Book deleted successfully', 'success');
      navigate('/admin/books');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error deleting book';
      setAlert(errorMsg, 'danger');
      setDeleting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!book) {
    return (
      <div className="alert alert-danger">
        Book not found
        <button 
          className="btn btn-primary ml-3"
          onClick={() => navigate('/admin/books')}
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="delete-book">
      <div className="card shadow-sm">
        <div className="card-header bg-danger text-white">
          <h3 className="mb-0">Delete Book</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Warning:</strong> This action cannot be undone. Deleting this book will permanently remove it from the system.
          </div>

          <div className="row mb-4">
            <div className="col-md-3 col-sm-4 mb-3 mb-md-0">
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
            <div className="col-md-9 col-sm-8">
              <h4>{book.title}</h4>
              <p className="text-muted">by {book.author}</p>
              <p><strong>ISBN:</strong> {book.ISBN}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>Genre:</strong> {book.genre}</p>
              <p>
                <strong>Copies:</strong> {book.copies} 
                (Available: {book.availableCopies})
              </p>
            </div>
          </div>

          <form onSubmit={handleDelete}>
            <div className="form-group">
              <label htmlFor="confirmTitle">
                Type <strong>{book.title}</strong> to confirm deletion:
              </label>
              <input
                type="text"
                className="form-control"
                id="confirmTitle"
                value={confirmTitle}
                onChange={handleConfirmTitleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Admin Password:</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={deleting || confirmTitle !== book.title}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteBook;