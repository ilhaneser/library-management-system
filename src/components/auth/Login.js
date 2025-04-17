// src/components/auth/Login.js
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { login, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();

  const [debugInfo, setDebugInfo] = useState({ 
    attempts: 0,
    lastAttemptStatus: null,
    tokenReceived: false,
    tokenStored: false
  });

  useEffect(() => {
    // Clear previous errors on component mount
    clearErrors();
    
    console.log('Login component: isAuthenticated =', isAuthenticated);
    console.log('Debug info:', debugInfo);
    
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      navigate('/');
    }

    if (error) {
      console.log('Login error detected:', error);
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated, debugInfo]);

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const { email, password } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  // Direct login approach
  const onSubmit = async e => {
    e.preventDefault();
    
    if (email === '' || password === '') {
      setAlert('Please fill in all fields', 'danger');
      return;
    }
    
    setLoading(true);
    setDebugInfo(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    
    try {
      // Direct API call to verify token is received
      console.log('Making direct API login request');
      const response = await axios.post('/api/users/login', { email, password });
      console.log('Login API response:', response.data);
      
      if (response.data && response.data.token) {
        setDebugInfo(prev => ({ ...prev, tokenReceived: true }));
        
        // Manually set token in localStorage
        localStorage.setItem('token', response.data.token);
        setDebugInfo(prev => ({ ...prev, tokenStored: true }));
        
        // Manually set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('Auth token manually set in headers');
        
        // Manually update auth state
        setAlert('Login successful! Redirecting...', 'success');
        
        // Add a delay before redirecting to ensure state updates
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // Force a full page reload if needed
        }, 1500);
      } else {
        setAlert('Login response did not contain a token', 'danger');
      }
    } catch (err) {
      console.error('Login request error:', err);
      console.error('Error details:', err.response?.data);
      setDebugInfo(prev => ({ 
        ...prev, 
        lastAttemptStatus: err.response?.status || 'network-error' 
      }));
      setAlert(err.response?.data?.error || 'Login failed. Please check your credentials.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">
              <i className="fas fa-sign-in-alt text-primary mr-2"></i>
              Login
            </h2>
            
            {debugInfo.attempts > 0 && (
              <div className="alert alert-info">
                <p><strong>Debug Info:</strong></p>
                <ul className="mb-0">
                  <li>Login attempts: {debugInfo.attempts}</li>
                  <li>Token received: {debugInfo.tokenReceived ? 'Yes' : 'No'}</li>
                  <li>Token stored: {debugInfo.tokenStored ? 'Yes' : 'No'}</li>
                  <li>Last attempt status: {debugInfo.lastAttemptStatus || 'N/A'}</li>
                </ul>
              </div>
            )}
            
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
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
              <div className="form-group">
                <label htmlFor="password">Password</label>
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
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            <div className="text-center mt-3">
              <p>
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;