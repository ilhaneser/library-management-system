import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const ManageLoans = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'active',
    overdue: false,
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLoans: 0
  });

  const { status, overdue, searchTerm } = filters;
  const { currentPage, totalPages } = pagination;

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line
  }, [status, overdue, currentPage]);

  const fetchLoans = async () => {
    setLoading(true);

    try {
      // Build query parameters
      let queryParams = `?status=${status}&page=${currentPage}`;
      if (overdue) queryParams += '&overdue=true';
      if (searchTerm) queryParams += `&search=${searchTerm}`;

      const res = await axios.get(`/api/loans${queryParams}`);
      
      setLoans(res.data.data);
      setPagination({
        currentPage: res.data.page,
        totalPages: res.data.pages,
        totalLoans: res.data.total
      });
    } catch (err) {
      console.error('Error fetching loans:', err);
      setAlert('Error fetching loans', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });

    // Reset to page 1 when filters change
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLoans();
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

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Are you sure you want to return this book?')) {
      return;
    }

    setProcessingId(loanId);
    
    try {
      await axios.put(`/api/loans/${loanId}/return`);
      setAlert('Book returned successfully', 'success');
      
      // Update the loans list
      fetchLoans();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error returning book', 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate) => {
    return calculateDaysLeft(dueDate) < 0;
  };

  if (loading && loans.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="manage-loans">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Loans</h1>
        <Link to="/admin/loans/create" className="btn btn-primary">
          <i className="fas fa-plus-circle mr-1"></i> Create New Loan
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row align-items-end">
              <div className="col-md-3">
                <div className="form-group mb-md-0">
                  <label htmlFor="status">Status</label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={status}
                    onChange={handleFilterChange}
                  >
                    <option value="active">Active</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-group mb-md-0">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="overdue"
                      name="overdue"
                      checked={overdue}
                      onChange={handleFilterChange}
                    />
                    <label className="custom-control-label" htmlFor="overdue">
                      Overdue Only
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-group mb-md-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by book title or user name"
                    name="searchTerm"
                    value={searchTerm}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-search mr-1"></i> Filter
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Loan List</h5>
            <span className="badge badge-pill badge-primary">
              {pagination.totalLoans} Loans
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {loans.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-handshake fa-3x text-muted mb-3"></i>
              <p className="mb-0">No loans found. Adjust your filters or create a new loan.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th>Book</th>
                    <th>User</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr 
                      key={loan._id}
                      className={loan.status === 'overdue' || (loan.status === 'active' && isOverdue(loan.dueDate)) ? 'table-danger' : ''}
                    >
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
                            <Link to={`/books/${loan.book._id}`}>{loan.book.title}</Link>
                            <small className="d-block text-muted">
                              by {loan.book.author}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {loan.user.name}
                          <small className="d-block text-muted">
                            {loan.user.email}
                          </small>
                        </div>
                      </td>
                      <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                      <td>
                        {new Date(loan.dueDate).toLocaleDateString()}
                        {loan.status === 'active' && isOverdue(loan.dueDate) && (
                          <span className="badge badge-danger ml-2">
                            {Math.abs(calculateDaysLeft(loan.dueDate))} days overdue
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          loan.status === 'active' 
                            ? 'success' 
                            : loan.status === 'overdue' || (loan.status === 'active' && isOverdue(loan.dueDate))
                              ? 'danger'
                              : 'secondary'
                        }`}>
                          {loan.status === 'active' && isOverdue(loan.dueDate) 
                            ? 'Overdue' 
                            : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {loan.status === 'active' && (
                          <button
                            className="btn btn-sm btn-primary mr-1"
                            onClick={() => handleReturnBook(loan._id)}
                            disabled={processingId === loan._id}
                          >
                            {processingId === loan._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="fas fa-undo-alt mr-1"></i>
                            )}
                            Return
                          </button>
                        )}
                        <Link 
                          to={`/admin/loans/${loan._id}`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="fas fa-eye mr-1"></i> Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <nav aria-label="Loans pagination">
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => changePage(page)}
                    >
                      {page}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLoans;