import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';

const AuthContext = createContext();

// Create initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Create reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

// Create provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    console.log('Loading user, token exists:', !!localStorage.token);
    
    if (localStorage.token) {
      // Set the token in axios headers
      setAuthToken(localStorage.token);
    } else {
      // No token found, dispatch auth error
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
  
    try {
      console.log('Attempting to load user profile...');
      const res = await axios.get('/api/users/profile');
      console.log('User profile loaded:', res.data);
      
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error loading user:', err.response?.data || err.message);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/users/register', formData, config);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      // Set token immediately after registration
      setAuthToken(res.data.token);
      
      // Then load user data
      await loadUser();
      return true;
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || 'Registration failed'
      });
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Attempting login with:', formData.email);
      const res = await axios.post('/api/users/login', formData, config);
      console.log('Login response:', res.data);

      // Immediately set the auth token before dispatching
      setAuthToken(res.data.token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      // Load user after successful login
      await loadUser();
      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Invalid credentials'
      });
      return false;
    }
  };

  // Logout
  const logout = () => {
    // Remove token from headers when logging out
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile
  const updateProfile = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put('/api/users/profile', formData, config);

      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: res.data.data
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.error || 'Profile update failed'
      });
      return false;
    }
  };

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  // Set token on initial load
  useEffect(() => {
    // Check and set token on initial load
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        updateProfile,
        clearErrors,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;