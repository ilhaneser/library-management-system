import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';

const Register = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { register, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }

    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated]);

  const [user, setUser] = useState({
    name: '',
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

  const { name, email, password, confirmPassword, contactNumber, address } = user;

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

  const onSubmit = e => {
    e.preventDefault();

    if (name === '' || email === '' || password === '') {
      setAlert('Please enter all required fields', 'danger');
    } else if (password !== confirmPassword) {
      setAlert('Passwords do not match', 'danger');
    } else if (password.length < 6) {
      setAlert('Password must be at least 6 characters', 'danger');
    } else {
      setLoading(true);
      register({
        name,
        email,
        password,
        contactNumber,
        address
      }).finally(() => setLoading(false));
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