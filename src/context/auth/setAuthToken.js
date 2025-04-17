import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    // Set auth token header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in headers');
  } else {
    // Remove auth token if none exists
    delete axios.defaults.headers.common['Authorization'];
    console.log('Auth token removed from headers');
  }
};

export default setAuthToken;