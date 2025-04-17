import axios from 'axios';

// Add auth token to all requests if it exists
const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in headers');
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Auth token removed from headers');
  }
};

export default setAuthToken;