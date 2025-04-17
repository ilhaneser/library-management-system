import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // For a real implementation, you would need an admin/stats endpoint
      // Here we'll simulate it by making separate calls
      const booksRes = await axios.get('/api/books');
      const usersRes = await axios.get('/api/users');
      const activeLoansRes = await axios.get('/api/loans?status=active');
      const overdueLoansRes = await axios.get('/api/loans?status=overdue');

      setStats({
        totalBooks: booksRes.data.total || 0,
        totalUsers: usersRes.data.count || 0,
        activeLoans: activeLoansRes.data.total || 0,
        overdueLoans: overdueLoansRes.data.total || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="stats-container">
      <div className="row">
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
    </div>
  );
};

export default AdminStats;