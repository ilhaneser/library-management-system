import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const ManageUsers = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAlert('Error fetching users', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') {
      fetchUsers();
      return;
    }

    // Filter users locally based on search term
    const filtered = users.filter(
      user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setUsers(filtered);
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditRole('');
  };

  const updateUserRole = async () => {
    if (!editingUser || editRole === editingUser.role) {
      cancelEditing();
      return;
    }

    setUpdatingId(editingUser._id);

    try {
      await axios.put(`/api/users/${editingUser._id}/role`, { role: editRole });
      setAlert(`User role updated successfully to ${editRole}`, 'success');
      
      // Update local state
      setUsers(users.map(user => 
        user._id === editingUser._id ? { ...user, role: editRole } : user
      ));
      
      cancelEditing();
    } catch (err) {
      setAlert(err.response?.data?.error || 'Error updating user role', 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    setUpdatingId(userId);

    try {
      await axios.put(`/api/users/${userId}/status`, { isActive: !isActive });
      setAlert(
        `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !isActive } : user
      ));
    } catch (err) {
      setAlert(
        err.response?.data?.error || 'Error updating user status',
        'danger'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && users.length === 0) {
    return <Spinner />;
  }

  const filteredUsers = searchTerm.trim() === ''
    ? users
    : users.filter(
        user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="manage-users">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Users</h1>
        <button
          className="btn btn-primary"
          onClick={() => fetchUsers()}
        >
          <i className="fas fa-sync-alt mr-1"></i> Refresh
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary ml-2">
              <i className="fas fa-search mr-1"></i> Search
            </button>
            {searchTerm && (
              <button 
                type="button"
                className="btn btn-secondary ml-2"
                onClick={() => {
                  setSearchTerm('');
                  fetchUsers();
                }}
              >
                <i className="fas fa-times mr-1"></i> Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">User List</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {editingUser && editingUser._id === user._id ? (
                        <select
                          className="form-control form-control-sm"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="librarian">Librarian</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${
                          user.role === 'admin' 
                            ? 'danger' 
                            : user.role === 'librarian' 
                              ? 'primary' 
                              : 'secondary'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.membershipDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {editingUser && editingUser._id === user._id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success mr-1"
                            onClick={updateUserRole}
                            disabled={updatingId === user._id}
                          >
                            {updatingId === user._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={cancelEditing}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-info mr-1"
                            onClick={() => startEditing(user)}
                          >
                            <i className="fas fa-user-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            disabled={updatingId === user._id}
                          >
                            {updatingId === user._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className={`fas fa-${user.isActive ? 'ban' : 'check-circle'}`}></i>
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="fas fa-users fa-2x mb-3 text-muted"></i>
                      <p className="mb-0">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;