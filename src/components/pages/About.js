import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-page">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h1 className="mb-4">About Our Library</h1>
          <p className="lead">
            The Library Management System is a comprehensive solution designed to efficiently
            manage all aspects of a modern library's operations.
          </p>
          <p>
            Our system provides an intuitive interface for both users and administrators,
            making it easy to search, borrow, return, and manage books. With features like
            wishlists, book reviews, and loan management, we aim to enhance the library
            experience for everyone.
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h3 className="mb-0">Features</h3>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <i className="fas fa-search text-primary mr-2"></i>
                  Advanced search functionality
                </li>
                <li className="list-group-item">
                  <i className="fas fa-book text-primary mr-2"></i>
                  Comprehensive book catalog
                </li>
                <li className="list-group-item">
                  <i className="fas fa-user text-primary mr-2"></i>
                  User accounts and profiles
                </li>
                <li className="list-group-item">
                  <i className="fas fa-handshake text-primary mr-2"></i>
                  Efficient loan management
                </li>
                <li className="list-group-item">
                  <i className="fas fa-heart text-primary mr-2"></i>
                  Personalized wishlists
                </li>
                <li className="list-group-item">
                  <i className="fas fa-star text-primary mr-2"></i>
                  Book ratings and reviews
                </li>
                <li className="list-group-item">
                  <i className="fas fa-chart-bar text-primary mr-2"></i>
                  Admin dashboard and reports
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h3 className="mb-0">Our Team</h3>
            </div>
            <div className="card-body">
              <p>
                This Library Management System was developed by Team 02 for the ICSI 418 course:
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Ahmed Aslam</li>
                <li className="list-group-item">Ahnaf Rahman</li>
                <li className="list-group-item">Ilhan Eser</li>
                <li className="list-group-item">Yash Patel</li>
                <li className="list-group-item">Haoyuan Wu</li>
              </ul>
              <p className="mt-3">
                Our team has worked diligently to create a robust system that meets the needs
                of both library staff and patrons. We've focused on creating an intuitive
                user interface and a powerful backend system.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h3 className="mb-0">Technology Stack</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Frontend</h5>
              <ul>
                <li>React.js</li>
                <li>Bootstrap for responsive design</li>
                <li>Context API for state management</li>
                <li>Axios for API requests</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5>Backend</h5>
              <ul>
                <li>Node.js with Express</li>
                <li>MongoDB for database</li>
                <li>Mongoose ODM</li>
                <li>JWT for authentication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h3 className="mb-4">Ready to start?</h3>
          <div className="d-flex justify-content-center">
            <Link to="/books" className="btn btn-primary mr-3">
              <i className="fas fa-search mr-2"></i> Browse Books
            </Link>
            <Link to="/register" className="btn btn-outline-primary">
              <i className="fas fa-user-plus mr-2"></i> Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;