import { Link } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';
import '../pages/Login.css';
import './Register.css';

const Register = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          🔮 Concepts
        </Link>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start combining elements</p>

        <div style={{ marginTop: '24px' }}>
          <GoogleSignInButton />
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;