import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5>Library Management System</h5>
            <p>
              A comprehensive solution for managing books, users, and loans in a
              library environment.
            </p>
          </div>

          <div className="col-md-4 mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/">
                  <i className="fas fa-home mr-2"></i> Home
                </Link>
              </li>
              <li>
                <Link to="/books">
                  <i className="fas fa-book mr-2"></i> Browse Books
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <i className="fas fa-info-circle mr-2"></i> About
                </Link>
              </li>
              <li>
                <Link to="/login">
                  <i className="fas fa-sign-in-alt mr-2"></i> Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-4">
            <h5>Contact</h5>
            <address>
              <p>
                <i className="fas fa-envelope mr-2"></i> info@libraryms.com
              </p>
              <p>
                <i className="fas fa-phone mr-2"></i> (123) 456-7890
              </p>
              <p>
                <i className="fas fa-map-marker-alt mr-2"></i> 123 Library Street,<br />
                Book City, BC 12345
              </p>
            </address>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom text-center">
        <p className="mb-0">
          &copy; {year} Library Management System. All rights reserved. Made by Team 02.
        </p>
      </div>
    </footer>
  );
};

export default Footer;