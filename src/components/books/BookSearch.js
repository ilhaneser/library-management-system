import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import { getBookCoverUrl } from '../../utilities/imageHelper';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to search
    const timeout = setTimeout(() => {
      performSearch();
    }, 300); // 300ms delay for better performance

    setSearchTimeout(timeout);

    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, selectedGenre]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data.data);
      setFilteredBooks(res.data.data);
      
      // Extract unique genres
      const uniqueGenres = [...new Set(res.data.data.map(book => book.genre))];
      setGenres(uniqueGenres.sort());
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      // If both search term and genre are empty/default, show all books
      if (searchTerm.trim() === '' && selectedGenre === 'all') {
        setFilteredBooks(books);
        return;
      }
      
      // Build query parameters
      const params = {};
      if (searchTerm.trim() !== '') {
        params.query = searchTerm;
      }
      if (selectedGenre !== 'all') {
        params.genre = selectedGenre;
      }
      
      // Make API call
      const res = await axios.get('/api/books/search', { params });
      setFilteredBooks(res.data.data);
    } catch (err) {
      console.error('Error searching books:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="book-search">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Search Books</h2>
          <div className="row">
            <div className="col-md-8">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, author or description..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <select
                  className="form-control"
                  value={selectedGenre}
                  onChange={handleGenreChange}
                >
                  <option value="all">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="search-results">
        {filteredBooks.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle mr-2"></i>
            No books found. Try adjusting your search criteria.
          </div>
        ) : (
          <>
            <h4 className="mb-3">Found {filteredBooks.length} books</h4>
            <div className="row">
              {filteredBooks.map(book => (
                <div key={book._id} className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <Link to={`/books/${book._id}`}>
                      <img
                        src={getBookCoverUrl(book.coverImage)}
                        alt={book.title}
                        className="card-img-top"
                        style={{ height: '250px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/img/default-book-cover.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        <Link to={`/books/${book._id}`}>{book.title}</Link>
                      </h5>
                      <p className="card-text text-muted mb-1">by {book.author}</p>
                      <small className="text-primary mb-2">{book.genre}</small>
                      <div className="mt-auto">
                        <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookSearch;