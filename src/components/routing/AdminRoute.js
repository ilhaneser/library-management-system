import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';
import Spinner from '../layout/Spinner';

const AdminRoute = ({ component: Component, roles }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, user } = authContext;

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (!roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Component />;
};

export default AdminRoute;