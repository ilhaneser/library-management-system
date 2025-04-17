import { useState, useEffect } from 'react';
import axios from 'axios';
import Book from './Book';
import BookFilter from './BookFilter';
import Spinner from '../layout/Spinner';

const SearchBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    genre: '',
    available: false
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });

  // Get all genres for filter dropdown
  const [genres, setGenres] = useState([]);
  
  useEffect(() => {
    fetchBooks();
    fetchGenres();
    // eslint-disable-next-line
  }, []);

  const fetchGenres = async () => {
    try {
      // This would ideally be a separate API endpoint for genres
      // For now, we'll use some common genres
      setGenres([
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 
        'Mystery', 'Thriller', 'Romance', 'Biography',
        'History', 'Science', 'Technology', 'Self-Help'
      ]);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const { title, author, genre, available } = filters;
  const { currentPage, totalPages } = pagination;

  // Handle search submission
  const onSearch = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setBooks([]);
    setPagination({
      ...pagination,
      currentPage: 1
    });

    try {
      // If there's a search term, use the search endpoint
      if (searchTerm.trim() !== '') {
        const res = await axios.get(`/api/books/search?query=${searchTerm}`);
        setBooks(res.data.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalBooks: res.data.count
        });
      } else {
        // Otherwise, use the filtered books endpoint
        await fetchBooks(1);
      }
    } catch (err) {
      console.error('Error searching books:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch books with filters and pagination
  const fetchBooks = async (page = 1) => {
    setLoading(true);

    try {
      let queryParams = `?page=${page}`;
      if (title) queryParams += `&title=${title}`;
      if (author) queryParams += `&author=${author}`;
      if (genre) queryParams += `&genre=${genre}`;
      if (available) queryParams += `&available=true`;

      const res = await axios.get(`/api/books${queryParams}`);
      
      setBooks(res.data.data);
      setPagination({
        currentPage: res.data.page,
        totalPages: res.data.pages,
        totalBooks: res.data.total
      });
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const changePage = async (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setPagination({
      ...pagination,
      currentPage: page
    });

    await fetchBooks(page);
  };

  // Handle filter changes
  const onFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({
      ...pagination,
      currentPage: 1
    });
    
    fetchBooks(1);
  };

  return (
    <div className="search-books">
      <h1 className="mb-4">Search Books</h1>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={onSearch} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search mr-1"></i> Search
                </button>
              </div>
            </div>
          </form>

          <BookFilter onFilterChange={onFilterChange} />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0 text-muted">
              Showing {books.length} of {pagination.totalBooks} books
            </p>
            
            {totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination">
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

          {books.length === 0 ? (
            <div className="alert alert-info">
              No books found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="row">
              {books.map((book) => (
                <div key={book._id} className="col-md-6 col-lg-3 mb-4">
                  <Book book={book} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchBooks;