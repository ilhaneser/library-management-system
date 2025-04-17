import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Book from '../books/Book';
import Spinner from '../layout/Spinner';
import AuthContext from '../../context/auth/AuthContext';

const Home = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, user, loading: authLoading } = authContext;

  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [userLoans, setUserLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);

  useEffect(() => {
    fetchHomeData();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Fetch recent books
      const recentRes = await axios.get('/api/books?sort=-addedOn&limit=6');
      setRecentBooks(recentRes.data.data);

      // Fetch popular books
      const popularRes = await axios.get('/api/books/popular?limit=6');
      setPopularBooks(popularRes.data.data || []);

      // Fetch user loans if authenticated
      if (isAuthenticated && user) {
        const loansRes = await axios.get('/api/loans/myloans?status=active');
        setUserLoans(loansRes.data.data);

        // Filter overdue loans
        const overdue = loansRes.data.data.filter(loan => {
          const dueDate = new Date(loan.dueDate);
          return dueDate < new Date();
        });
        setOverdueLoans(overdue);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <Spinner />;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section text-center">
        <h1 className="display-4 mb-4">Welcome to the Library Management System</h1>
        <p className="lead mb-4">Discover, borrow, and enjoy thousands of books in our collection</p>
        <div className="d-flex justify-content-center">
          <Link to="/books" className="btn btn-primary btn-lg mr-3">
            <i className="fas fa-search mr-2"></i> Browse Books
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-light btn-lg">
              <i className="fas fa-user-plus mr-2"></i> Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* User Dashboard (if authenticated) */}
      {isAuthenticated && (
        <div className="user-dashboard mt-5 mb-5">
          <div className="row">
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">My Books</h5>
                  <Link to="/myloans" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="card-body">
                  {userLoans.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-book fa-3x text-muted mb-3"></i>
                      <p className="mb-0">You haven't borrowed any books yet.</p>
                      <Link to="/books" className="btn btn-primary mt-3">Browse Books</Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {userLoans.slice(0, 3).map(loan => (
                        <div key={loan._id} className="list-group-item d-flex align-items-center">
                          <img
                            src={
                              loan.book.coverImage && loan.book.coverImage !== 'default-book-cover.jpg'
                                ? loan.book.coverImage
                                : '/img/default-book-cover.jpg'
                            }
                            alt={loan.book.title}
                            className="mr-3"
                            style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{loan.book.title}</h6>
                            <p className="mb-1 small text-muted">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                          </div>
                          <Link to={`/books/${loan.book._id}`} className="btn btn-sm btn-outline-secondary">
                            <i className="fas fa-eye"></i>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-4 mt-md-0">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Account Summary</h5>
                </div>
                <div className="card-body">
                  <div className="stats-item mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Active Loans</h6>
                      <span className="badge badge-primary">{userLoans.length}</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${(userLoans.length / user.maxBooksAllowed) * 100}%` }}
                        aria-valuenow={userLoans.length}
                        aria-valuemin="0"
                        aria-valuemax={user.maxBooksAllowed}
                      ></div>
                    </div>
                    <small className="text-muted">
                      {userLoans.length} of {user.maxBooksAllowed} maximum books
                    </small>
                  </div>

                  <div className="stats-item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Overdue Books</h6>
                      <span className={`badge ${overdueLoans.length > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {overdueLoans.length}
                      </span>
                    </div>
                    {overdueLoans.length > 0 ? (
                      <div className="alert alert-danger mb-0">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        You have {overdueLoans.length} overdue {overdueLoans.length === 1 ? 'book' : 'books'}.
                        Please return them as soon as possible.
                      </div>
                    ) : (
                      <div className="alert alert-success mb-0">
                        <i className="fas fa-check-circle mr-2"></i>
                        No overdue books. Keep it up!
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="/profile" className="btn btn-sm btn-outline-secondary">
                      <i className="fas fa-user mr-1"></i> Profile
                    </Link>
                    <Link to="/wishlist" className="btn btn-sm btn-outline-secondary">
                      <i className="fas fa-heart mr-1"></i> Wishlist
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Added Books */}
      <div className="recent-books mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Recently Added</h2>
          <Link to="/books" className="btn btn-outline-primary">
            View All
          </Link>
        </div>
        <div className="row">
          {recentBooks.map(book => (
            <div key={book._id} className="col-md-6 col-lg-2 mb-4">
              <Book book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* Popular Books */}
      <div className="popular-books mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Popular Books</h2>
          <Link to="/books" className="btn btn-outline-primary">
            View All
          </Link>
        </div>
        <div className="row">
          {popularBooks.map(book => (
            <div key={book._id} className="col-md-6 col-lg-2 mb-4">
              <Book book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="how-it-works mt-5 mb-5">
        <h2 className="text-center mb-5">How It Works</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100 text-center">
              <div className="card-body">
                <div className="circle-icon mb-3">
                  <i className="fas fa-search fa-2x"></i>
                </div>
                <h4>1. Search</h4>
                <p>Browse our extensive collection of books or search for specific titles, authors, or genres.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100 text-center">
              <div className="card-body">
                <div className="circle-icon mb-3">
                  <i className="fas fa-handshake fa-2x"></i>
                </div>
                <h4>2. Borrow</h4>
                <p>Select the books you want to borrow and check them out for a specified period.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100 text-center">
              <div className="card-body">
                <div className="circle-icon mb-3">
                  <i className="fas fa-book-reader fa-2x"></i>
                </div>
                <h4>3. Enjoy</h4>
                <p>Read and enjoy your books. Return them on time or renew if you need more time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;