import React from 'react';
import { Navigate } from 'react-router-dom';

/*
 * Protects routes based on authentication type and user role
 * Matches localStorage keys set by Login.jsx
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {array} allowedRoles - (Optional) For employees, specific job titles allowed ['Manager', 'General Manager', 'Mechanical Employee']
 * 
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
    console.log('ProtectedRoute: Checking employee auth for path:', window.location.pathname);

  // Not logged in as employee
  if (!employeeData) {
      console.log('ProtectedRoute: No employee data, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    // Parse employee data once
    let employee = {};
    try {
      employee = JSON.parse(employeeData);
    } catch (e) {
      console.error('Error parsing employee data:', e);
      return <Navigate to="/login" replace />;
    }

    // Check if employee needs to change password (first-time login)
    if (employee.password_changed === false || employee.password_changed === 0) {
      console.log('ProtectedRoute: Employee needs to change password, redirecting');
      if (window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
      }
    }

    // If specific roles are required, check job_title
    if (allowedRoles.length > 0) {

    const jobTitle = employee.job_title;
      console.log('ProtectedRoute: Checking role - jobTitle:', jobTitle, 'allowedRoles:', allowedRoles);

    // Check if employee's job_title is in the allowed roles
    if (!allowedRoles.includes(jobTitle)) {
    console.log('ProtectedRoute: Role not allowed, redirecting based on job title');
   
    // Redirect based on job title
      if (jobTitle === 'Mechanical Employee') {
        return <Navigate to="/maintenance" replace />;
      } else if (jobTitle === 'General Manager') {
        return <Navigate to="/admin" replace />;
      } else if (jobTitle === 'Sales Employee') {
        return <Navigate to="/sales" replace />;
      } else {
          return <Navigate to="/" replace />;
        }
    }
    }
    console.log('ProtectedRoute: Employee authentication passed');
    return children;
  }

  // Invalid type
  console.warn('ProtectedRoute: Invalid type prop. Use "customer" or "employee"');
  return <Navigate to="/" replace />;
}

export default ProtectedRoute;
