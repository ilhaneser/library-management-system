import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const BookFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    genre: '',
    available: false
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const { title, author, genre, available } = filters;

  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch unique genre values
  const fetchGenres = async () => {
    try {
      // In a real implementation, this would be an API endpoint
      // For now, we'll use some common genres as placeholders
      const commonGenres = [
        'Fiction',
        'Non-Fiction',
        'Science Fiction',
        'Fantasy',
        'Mystery',
        'Thriller',
        'Romance',
        'Biography',
        'History',
        'Science',
        'Technology',
        'Self-Help'
      ];
      
      setGenres(commonGenres);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFilters({
      ...filters,
      [e.target.name]: value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      title: '',
      author: '',
      genre: '',
      available: false
    };
    
    setFilters(resetFilters);
    
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  return (
    <div className="book-filter card shadow-sm mb-4">
      <div className="card-header bg-light">
        <button
          className="btn btn-link btn-block text-left p-0"
          onClick={() => setExpanded(!expanded)}
        >
          <h5 className="mb-0 d-flex justify-content-between align-items-center">
            <span>Filter Books</span>
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
          </h5>
        </button>
      </div>
      
      <div className={`collapse ${expanded ? 'show' : ''}`}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    placeholder="Search by title"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="author">Author</label>
                  <input
                    type="text"
                    className="form-control"
                    id="author"
                    name="author"
                    value={author}
                    onChange={handleChange}
                    placeholder="Search by author"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="genre">Genre</label>
                  <select
                    className="form-control"
                    id="genre"
                    name="genre"
                    value={genre}
                    onChange={handleChange}
                  >
                    <option value="">All Genres</option>
                    {genres.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="custom-control custom-checkbox mt-4">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="available"
                      name="available"
                      checked={available}
                      onChange={handleChange}
                    />
                    <label className="custom-control-label" htmlFor="available">
                      Available books only
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-primary">
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

BookFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired
};

export default BookFilter;