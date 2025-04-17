import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';

const Register = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { register, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();

  const [debugInfo, setDebugInfo] = useState({ 
    attempts: 0,
    lastAttemptStatus: null,
    lastError: null,
    tokenReceived: false,
    tokenStored: false
  });

  useEffect(() => {
    // Clear previous errors on component mount
    clearErrors();
    
    console.log('Register component: isAuthenticated =', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      navigate('/');
    }

    if (error) {
      console.log('Registration error detected:', error);
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated]);

  const [user, setUser] = useState({
    name: '',
    username: '',  // Added username field
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [showAddressDetails, setShowAddressDetails] = useState(false);

  const { name, username, email, password, confirmPassword, contactNumber, address } = user;

  const onChange = e => {
    if (e.target.name.startsWith('address.')) {
      const field = e.target.name.split('.')[1];
      setUser({
        ...user,
        address: {
          ...address,
          [field]: e.target.value
        }
      });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  // Direct registration approach
  const onSubmit = async e => {
    e.preventDefault();

    if (name === '' || username === '' || email === '' || password === '') {
      setAlert('Please enter all required fields', 'danger');
      return;
    } else if (password !== confirmPassword) {
      setAlert('Passwords do not match', 'danger');
      return;
    } else if (password.length < 6) {
      setAlert('Password must be at least 6 characters', 'danger');
      return;
    }

    setLoading(true);
    setDebugInfo(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    
    try {
      // Direct API call to verify registration
      console.log('Making direct API registration request');
      console.log('Registration data:', { name, username, email, password, contactNumber, address });
      
      const response = await axios.post('/api/users/register', {
        name,
        username,  // Include username in the request
        email,
        password,
        contactNumber,
        address
      });
      
      console.log('Registration API response:', response.data);
      
      if (response.data && response.data.token) {
        setDebugInfo(prev => ({ ...prev, tokenReceived: true }));
        
        // Manually set token in localStorage
        localStorage.setItem('token', response.data.token);
        setDebugInfo(prev => ({ ...prev, tokenStored: true }));
        
        // Manually set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('Auth token manually set in headers');
        
        setAlert('Registration successful! Redirecting...', 'success');
        
        // Add a delay before redirecting to ensure state updates
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setAlert('Registration response did not contain a token', 'danger');
      }
    } catch (err) {
      console.error('Registration request error:', err);
      console.error('Error details:', err.response?.data);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        lastAttemptStatus: err.response?.status || 'network-error',
        lastError: err.response?.data?.error || err.message
      }));
      
      setAlert(err.response?.data?.error || 'Registration failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">
              <i className="fas fa-user-plus text-primary mr-2"></i>
              Sign Up
            </h2>
            
            {debugInfo.attempts > 0 && (
              <div className="alert alert-info">
                <p><strong>Debug Info:</strong></p>
                <ul className="mb-0">
                  <li>Registration attempts: {debugInfo.attempts}</li>
                  <li>Token received: {debugInfo.tokenReceived ? 'Yes' : 'No'}</li>
                  <li>Token stored: {debugInfo.tokenStored ? 'Yes' : 'No'}</li>
                  <li>Last attempt status: {debugInfo.lastAttemptStatus || 'N/A'}</li>
                  <li>Last error: {debugInfo.lastError || 'None'}</li>
                </ul>
              </div>
            )}
            
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name <span className="text-danger">*</span></label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-user"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              {/* New Username field */}
              <div className="form-group">
                <label htmlFor="username">Username <span className="text-danger">*</span></label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-user-tag"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={username}
                    onChange={onChange}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address <span className="text-danger">*</span></label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="password">Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter your password"
                        minLength="6"
                        required
                      />
                    </div>
                    <small className="form-text text-muted">
                      Password must be at least 6 characters long
                    </small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={onChange}
                        placeholder="Confirm your password"
                        minLength="6"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-phone"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    className="form-control"
                    value={contactNumber}
                    onChange={onChange}
                    placeholder="Enter your contact number"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setShowAddressDetails(!showAddressDetails)}
                >
                  <i className={`fas fa-chevron-${showAddressDetails ? 'down' : 'right'} mr-2`}></i>
                  {showAddressDetails ? 'Hide' : 'Add'} Address Details
                </button>
              </div>
              
              {showAddressDetails && (
                <div className="address-details">
                  <div className="form-group">
                    <label htmlFor="address.street">Street Address</label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      className="form-control"
                      value={address.street}
                      onChange={onChange}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="address.city">City</label>
                        <input
                          type="text"
                          id="address.city"
                          name="address.city"
                          className="form-control"
                          value={address.city}
                          onChange={onChange}
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="address.state">State</label>
                        <input
                          type="text"
                          id="address.state"
                          name="address.state"
                          className="form-control"
                          value={address.state}
                          onChange={onChange}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="address.zipCode">Zip Code</label>
                        <input
                          type="text"
                          id="address.zipCode"
                          name="address.zipCode"
                          className="form-control"
                          value={address.zipCode}
                          onChange={onChange}
                          placeholder="Zip Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary btn-block mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>
            <div className="text-center mt-3">
              <p>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;