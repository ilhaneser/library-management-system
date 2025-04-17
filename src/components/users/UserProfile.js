import { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import Spinner from '../layout/Spinner';

const UserProfile = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { user, loading, updateProfile } = authContext;
  const { setAlert } = alertContext;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const {
    name,
    email,
    contactNumber,
    address,
    currentPassword,
    newPassword,
    confirmPassword
  } = formData;

  const onChange = e => {
    if (e.target.name.startsWith('address.')) {
      const field = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...address,
          [field]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();

    // Validate form
    if (newPassword !== confirmPassword) {
      setAlert('New password and confirm password do not match', 'danger');
      return;
    }

    // Create update object (only include fields that should be updated)
    const updateData = {};
    if (name !== user.name) updateData.name = name;
    if (email !== user.email) updateData.email = email;
    if (contactNumber !== user.contactNumber) updateData.contactNumber = contactNumber;
    
    // Check if address has changed
    if (
      address.street !== user.address?.street ||
      address.city !== user.address?.city ||
      address.state !== user.address?.state ||
      address.zipCode !== user.address?.zipCode
    ) {
      updateData.address = address;
    }

    // Include password update if provided
    if (currentPassword && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    // Don't submit if no changes
    if (Object.keys(updateData).length === 0) {
      setAlert('No changes to update', 'info');
      return;
    }

    setIsUpdating(true);
    const success = await updateProfile(updateData);
    setIsUpdating(false);

    if (success) {
      setAlert('Profile updated successfully', 'success');
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h2 className="mb-0">User Profile</h2>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <h4>Personal Information</h4>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    value={contactNumber}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4>Address</h4>
                <div className="form-group">
                  <label htmlFor="address.street">Street</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address.street"
                    name="address.street"
                    value={address.street}
                    onChange={onChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="address.city">City</label>
                      <input
                        type="text"
                        className="form-control"
                        id="address.city"
                        name="address.city"
                        value={address.city}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="address.state">State</label>
                      <input
                        type="text"
                        className="form-control"
                        id="address.state"
                        name="address.state"
                        value={address.state}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="address.zipCode">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={address.zipCode}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4>Change Password</h4>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={onChange}
                        minLength="6"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        minLength="6"
                      />
                    </div>
                  </div>
                </div>
                <small className="form-text text-muted">
                  Leave password fields empty if you don't want to change the password.
                </small>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;