import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch summary statistics
      const statsRes = await axios.get('/api/admin/stats');
      setStats(statsRes.data.data);

      // Fetch recent loans
      const loansRes = await axios.get('/api/loans?limit=5&sort=-issueDate');
      setRecentLoans(loansRes.data.data);

      // Fetch popular books
      const booksRes = await axios.get('/api/books/popular');
      setPopularBooks(booksRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <div>
          <Link to="/admin/books/add" className="btn btn-primary mr-2">
            <i className="fas fa-plus-circle mr-1"></i> Add Book
          </Link>
          <button onClick={() => fetchDashboardData()} className="btn btn-outline-secondary">
            <i className="fas fa-sync-alt mr-1"></i> Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card stats-card border-left-primary shadow-sm h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Books
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalBooks}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-book fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/books" className="small text-primary">
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card stats-card border-left-success shadow-sm h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalUsers}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/users" className="small text-success">
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card stats-card border-left-info shadow-sm h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Active Loans
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.activeLoans}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-handshake fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/loans?status=active" className="small text-info">
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card stats-card border-left-danger shadow-sm h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Overdue Loans
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.overdueLoans}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/loans?status=overdue" className="small text-danger">
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Loans & Popular Books Sections */}
      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Recent Loans</h6>
              <Link to="/admin/loans" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentLoans.length === 0 ? (
                <p className="text-center my-3">No recent loans found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLoans.map((loan) => (
                        <tr key={loan._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={
                                  loan.book.coverImage && loan.book.coverImage !== 'default-book-cover.jpg'
                                    ? loan.book.coverImage
                                    : '/img/default-book-cover.jpg'
                                } 
                                alt={loan.book.title}
                                className="mr-2"
                                style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                              />
                              <div>
                                <Link to={`/books/${loan.book._id}`}>
                                  {loan.book.title}
                                </Link>
                                <div className="small text-muted">{loan.book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td>{loan.user.name}</td>
                          <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${
                              loan.status === 'active' 
                                ? 'success' 
                                : loan.status === 'overdue' 
                                  ? 'danger' 
                                  : 'secondary'
                            }`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Popular Books</h6>
              <Link to="/admin/books" className="btn btn-sm btn-primary">
                View All Books
              </Link>
            </div>
            <div className="card-body">
              {popularBooks.length === 0 ? (
                <p className="text-center my-3">No data available.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {popularBooks.map((book, index) => (
                    <div key={book._id} className="list-group-item d-flex align-items-center p-3">
                      <div className="position-relative mr-3">
                        <img
                          src={
                            book.coverImage && book.coverImage !== 'default-book-cover.jpg'
                              ? book.coverImage
                              : '/img/default-book-cover.jpg'
                          }
                          alt={book.title}
                          style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                        />
                        <span 
                          className="position-absolute badge badge-primary" 
                          style={{ top: '-10px', right: '-10px' }}
                        >
                          {book.loanCount}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-1">
                          <Link to={`/books/${book._id}`}>{book.title}</Link>
                        </h6>
                        <div className="small text-muted mb-1">{book.author}</div>
                        <div>
                          <span className="badge badge-light">
                            {book.availableCopies}/{book.copies} available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-2">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div className="card-body d-flex flex-wrap">
              <Link to="/admin/books/add" className="btn btn-primary m-2">
                <i className="fas fa-plus-circle mr-1"></i> Add New Book
              </Link>
              <Link to="/admin/loans/create" className="btn btn-success m-2">
                <i className="fas fa-handshake mr-1"></i> Create New Loan
              </Link>
              <Link to="/admin/users/add" className="btn btn-info m-2">
                <i className="fas fa-user-plus mr-1"></i> Add New User
              </Link>
              <Link to="/admin/reports" className="btn btn-secondary m-2">
                <i className="fas fa-chart-bar mr-1"></i> View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;