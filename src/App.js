import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Alerts from './components/layout/Alerts';
import AuthDebugger from './components/auth/AuthDebugger';
// Import CSS
import './App.css';

// Public Pages
import Home from './components/pages/Home';
import About from './components/pages/About';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import NotFound from './components/pages/NotFound';

// Books Components
import SearchBooks from './components/books/SearchBooks';
import BookDetails from './components/books/BookDetails';
import BorrowBook from './components/books/BorrowBook';
import PdfReader from './components/books/PdfReader'; // Import the PDF Reader component

// User Components
import UserProfile from './components/users/UserProfile';
import Wishlist from './components/users/Wishlist';
import MyLoans from './components/loans/MyLoans';
import LoanDetails from './components/loans/LoanDetails';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import ManageBooks from './components/admin/ManageBooks';
import AddBook from './components/admin/AddBook';
import EditBook from './components/admin/EditBook';
import DeleteBook from './components/admin/DeleteBook';
import ManageLoans from './components/admin/ManageLoans';
import CreateLoan from './components/admin/CreateLoan';
import ManageUsers from './components/admin/ManageUsers';

// Route Protection
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Context Providers
import { AuthProvider } from './context/auth/AuthContext';
import { AlertProvider } from './context/alert/AlertContext';

// Utils
import setAuthToken from './utils/setAuthToken';

// Set base URL for axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Set auth token on initial app loading
if (localStorage.token) {
  setAuthToken(localStorage.token);
  console.log('Token loaded from localStorage on app init');
}

const App = () => {
  // Log app version on startup
  useEffect(() => {
    console.log('App initialized. Version 1.0.0');
    console.log('API URL:', axios.defaults.baseURL);
  }, []);

  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="app d-flex flex-column min-vh-100">
            <Navbar />
            <main className="container py-4 flex-grow-1">
              <Alerts />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/books" element={<SearchBooks />} />
                <Route path="/books/:id" element={<BookDetails />} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={<PrivateRoute component={UserProfile} />} />
                <Route path="/wishlist" element={<PrivateRoute component={Wishlist} />} />
                <Route path="/myloans" element={<PrivateRoute component={MyLoans} />} />
                <Route path="/loans/:id" element={<PrivateRoute component={LoanDetails} />} />
                <Route path="/books/:id/borrow" element={<PrivateRoute component={BorrowBook} />} />
                <Route path="/read/:id" element={<PrivateRoute component={PdfReader} />} /> {/* Add PDF reader route */}
                
                {/* Admin/Librarian Routes */}
                <Route path="/admin/dashboard" element={<AdminRoute component={Dashboard} roles={['admin', 'librarian']} />} />
                
                {/* Book Management */}
                <Route path="/admin/books" element={<AdminRoute component={ManageBooks} roles={['admin', 'librarian']} />} />
                <Route path="/admin/books/add" element={<AdminRoute component={AddBook} roles={['admin', 'librarian']} />} />
                <Route path="/admin/books/:id/edit" element={<AdminRoute component={EditBook} roles={['admin', 'librarian']} />} />
                <Route path="/admin/books/:id/delete" element={<AdminRoute component={DeleteBook} roles={['admin', 'librarian']} />} />
                
                {/* Loan Management */}
                <Route path="/admin/loans" element={<AdminRoute component={ManageLoans} roles={['admin', 'librarian']} />} />
                <Route path="/admin/loans/create" element={<AdminRoute component={CreateLoan} roles={['admin', 'librarian']} />} />
                <Route path="/admin/loans/:id" element={<AdminRoute component={LoanDetails} roles={['admin', 'librarian']} />} />
                
                {/* User Management (Admin Only) */}
                <Route path="/admin/users" element={<AdminRoute component={ManageUsers} roles={['admin']} />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <AuthDebugger />
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;