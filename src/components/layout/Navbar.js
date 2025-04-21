import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
  };

  const authLinks = (
    <ul className="navbar-nav ml-auto">
      <li className="nav-item">
        <Link className="nav-link" to="/books">
          <i className="fas fa-book"></i> Browse Books
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/books">
          <i className="fas fa-search"></i> Search Books
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/myloans">
          <i className="fas fa-handshake"></i> My Loans
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/wishlist">
          <i className="fas fa-heart"></i> Wishlist
        </Link>
      </li>
      <li className="nav-item dropdown">
        <a 
          className="nav-link dropdown-toggle" 
          href="#!" 
          id="navbarDropdown" 
          role="button" 
          data-toggle="dropdown" 
          aria-haspopup="true" 
          aria-expanded="false"
        >
          <i className="fas fa-user"></i> {user && user.name}
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
          <Link className="dropdown-item" to="/profile">
            <i className="fas fa-id-card"></i> Profile
          </Link>
          {user && (user.role === 'admin' || user.role === 'librarian') && (
            <Link className="dropdown-item" to="/admin/dashboard">
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </Link>
          )}
          <div className="dropdown-divider"></div>
          <a className="dropdown-item" href="#!" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav ml-auto">
      <li className="nav-item">
        <Link className="nav-link" to="/books">
          <i className="fas fa-book"></i> Browse Books
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/books">
          <i className="fas fa-search"></i> Search Books
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/about">
          <i className="fas fa-info-circle"></i> About
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">
          <i className="fas fa-user-plus"></i> Register
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          <i className="fas fa-sign-in-alt"></i> Login
        </Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-book-open"></i> LibraryMS
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;