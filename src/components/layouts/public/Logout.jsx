import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('employee');
    localStorage.removeItem('employee_info');
    localStorage.removeItem('manager_department');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('themepark_user');

    // Optionally clear everything
    // localStorage.clear();

    console.log('User logged out - all auth data cleared');

    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #EEF5FF, #B4D4FF)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#176B87', marginBottom: '1rem' }}>Logging out...</h2>
        <p style={{ color: '#666' }}>Please wait while we log you out.</p>
      </div>
    </div>
  );
}
