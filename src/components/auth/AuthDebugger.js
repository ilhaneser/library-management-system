import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/auth/AuthContext';

const AuthDebugger = () => {
  const authContext = useContext(AuthContext);
  const { token, isAuthenticated, loading, user, error } = authContext;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Log auth state changes
    console.log('Auth state updated:', {
      token: token ? 'EXISTS' : 'NONE',
      isAuthenticated,
      loading,
      user: user ? `${user.name} (${user.email})` : 'NONE',
      error
    });
  }, [token, isAuthenticated, loading, user, error]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '10px',
        maxWidth: '300px',
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
      }}
    >
      <div 
        style={{ 
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span>Auth Debugger</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <div><strong>Token:</strong> {token ? '✓ (Set)' : '✗ (Missing)'}</div>
          <div><strong>Authenticated:</strong> {isAuthenticated ? '✓ (Yes)' : '✗ (No)'}</div>
          <div><strong>Loading:</strong> {loading ? '⟳ (Yes)' : '✓ (No)'}</div>
          <div><strong>User:</strong> {user ? `${user.name} (${user.email})` : '✗ (None)'}</div>
          <div><strong>Role:</strong> {user ? user.role : 'N/A'}</div>
          <div><strong>Error:</strong> {error ? `✗ ${error}` : '✓ (None)'}</div>
          <div style={{ marginTop: '5px' }}>
            <button 
              onClick={() => localStorage.removeItem('token')}
              style={{
                fontSize: '10px',
                padding: '2px 5px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Clear Token
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;