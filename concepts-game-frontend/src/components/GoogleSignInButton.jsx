import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useUser();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      setError('');
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_black"
        size="large"
        width="300"
        text="signin_with"
        shape="rectangular"
        ux_mode="popup"                    // ← ADD THIS
        use_fedcm_for_prompt={false}       // ← ADD THIS (disables FedCM)
      />
      {error && (
        <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}