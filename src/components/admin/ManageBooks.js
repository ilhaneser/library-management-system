import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const ManageBooks = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentPage, totalPages } = pagination;

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/books?page=${currentPage}&limit=10&sort=title`);
      
      setBooks(res.data.data);
      setPagination({
        currentPage: res.data.page,
        totalPages: res.data.pages,
        totalBooks: res.data.total
      });
    } catch (err) {
      console.error('Error fetching books:', err);
      setAlert('Error fetching books', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (searchTerm.trim() === '') {
        fetchBooks();
        return;
      }

      const res = await axios.get(`/api/books/search?query=${searchTerm}`);
      
      setBooks(res.data.data);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalBooks: res.data.count
      });
    } catch (err) {
      console.error('Error searching books:', err);
      setAlert('Error searching books', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (bookId) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter(id => id !== bookId));
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      // Deselect all
      setSelectedBooks([]);
    } else {
      // Select all
      setSelectedBooks(books.map(book => book._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBooks.length === 0) {
      setAlert('No books selected', 'info');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
      setIsDeleting(true);
      
      try {
        // In a real implementation, you might have a batch delete endpoint
        // For now, we'll delete them one by one
        const deletePromises = selectedBooks.map(id => axios.delete(`/api/books/${id}`));
        await Promise.all(deletePromises);
        
        setAlert(`Successfully deleted ${selectedBooks.length} books`, 'success');
        setSelectedBooks([]);
        fetchBooks();
      } catch (err) {
        console.error('Error deleting books:', err);
        setAlert(err.response?.data?.error || 'Error deleting books', 'danger');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  if (loading && books.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="manage-books">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Books</h1>
        <Link to="/admin/books/add" className="btn btn-primary">
          <i className="fas fa-plus-circle mr-1"></i> Add New Book
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search books by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary ml-2">
              <i className="fas fa-search mr-1"></i> Search
            </button>
            {searchTerm && (
              <button 
                type="button"
                className="btn btn-secondary ml-2"
                onClick={() => {
                  setSearchTerm('');
                  fetchBooks();
                }}
              >
                <i className="fas fa-times mr-1"></i> Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Book List</h5>
            <div>
              <button 
                className="btn btn-danger btn-sm mr-2"
                disabled={selectedBooks.length === 0 || isDeleting}
                onClick={handleDeleteSelected}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt mr-1"></i> Delete Selected
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => fetchBooks()}
              >
                <i className="fas fa-sync-alt mr-1"></i> Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>
                    <div className="custom-control custom-checkbox ml-2">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="selectAll"
                        checked={selectedBooks.length === books.length && books.length > 0}
                        onChange={handleSelectAll}
                      />
                      <label className="custom-control-label" htmlFor="selectAll"></label>
                    </div>
                  </th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <div className="custom-control custom-checkbox ml-2">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`select-${book._id}`}
                          checked={selectedBooks.includes(book._id)}
                          onChange={() => handleSelectBook(book._id)}
                        />
                        <label className="custom-control-label" htmlFor={`select-${book._id}`}></label>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            book.coverImage && book.coverImage !== 'default-book-cover.jpg'
                              ? book.coverImage
                              : '/img/default-book-cover.jpg'
                          }
                          alt={book.title}
                          className="mr-2"
                          style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                        />
                        <div>
                          <Link to={`/books/${book._id}`}>{book.title}</Link>
                          <small className="d-block text-muted">ISBN: {book.ISBN}</small>
                        </div>
                      </div>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>
                      <span className={`badge badge-pill ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.availableCopies}/{book.copies}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/books/${book._id}/edit`} className="btn btn-sm btn-info mr-1">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Link to={`/books/${book._id}`} className="btn btn-sm btn-secondary">
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="fas fa-book fa-2x mb-3 text-muted"></i>
                      <p className="mb-0">No books found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {books.length} of {pagination.totalBooks} books
            </div>
            {totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(totalPages).keys()].map(x => (
                    <li key={x + 1} className={`page-item ${currentPage === x + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => changePage(x + 1)}
                      >
                        {x + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;