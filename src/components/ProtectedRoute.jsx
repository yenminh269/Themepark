import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if customer is logged in by checking for token
  const customerToken = localStorage.getItem('customer_token');
  const customerUser = localStorage.getItem('themepark_user');

  // If no token or user data, redirect to login
  if (!customerToken && !customerUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
}
