import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication type and user role
 * Matches localStorage keys set by Login.jsx
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string} type - 'customer' or 'employee' - which type of user can access
 * @param {array} allowedRoles - (Optional) For employees, specific job titles allowed ['Manager', 'General Manager', 'Mechanical Employee']
 * 
 * Usage Examples:
 * <ProtectedRoute type="customer">
 *   <HomePage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute type="employee" allowedRoles={['Manager', 'General Manager']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * localStorage Structure:
 * ========================
 * CUSTOMER:
 * - 'customer_token': JWT token stored by api.setCustomerToken()
 * - 'themepark_user': Customer object {customer_id, email, first_name, last_name, ...}
 * 
 * EMPLOYEE:
 * - 'employee': Employee object {employee_id, email, first_name, last_name, job_title, ...}
 * - 'employee_token': (Optional) Token if implemented
 */
function ProtectedRoute({ children, type = 'customer', allowedRoles = [] }) {
  // Check customer authentication
  if (type === 'customer') {
    // Customer stores: 'customer_token' and 'themepark_user'
    const customerData = localStorage.getItem('themepark_user');
    const customerToken = localStorage.getItem('customer_token');

    // Not logged in as customer
    if (!customerToken || !customerData) {
      return <Navigate to="/login" replace />;
    }

    return children;
  }

  // Check employee authentication
  if (type === 'employee') {
    // Employee stores: 'employee' (object with job_title)
    const employeeData = localStorage.getItem('employee');

    // Not logged in as employee
    if (!employeeData) {
      return <Navigate to="/login" replace />;
    }

    // If specific roles are required, check job_title
    if (allowedRoles.length > 0) {
      let employee = {};
      try {
        employee = JSON.parse(employeeData);
      } catch (e) {
        console.error('Error parsing employee data:', e);
        return <Navigate to="/login" replace />;
      }

      const jobTitle = employee.job_title;

      // Check if employee's job_title is in the allowed roles
      if (!allowedRoles.includes(jobTitle)) {
        // Redirect based on job title
        if (jobTitle === 'Mechanical Employee') {
          return <Navigate to="/maintenance" replace />;
        } else if (jobTitle === 'Manager' || jobTitle === 'General Manager') {
          return <Navigate to="/admin" replace />;
        } else {
          return <Navigate to="/" replace />;
        }
      }
    }

    return children;
  }

  // Invalid type
  console.warn('ProtectedRoute: Invalid type prop. Use "customer" or "employee"');
  return <Navigate to="/" replace />;
}

export default ProtectedRoute;
