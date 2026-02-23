import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Children } from 'react';

const Protectedroute = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page" style={{ minHeight: '100dvh' }}>
        <span className="auth-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children;
};

export default Protectedroute;