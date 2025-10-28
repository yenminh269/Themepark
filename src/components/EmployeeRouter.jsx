import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function EmployeeRouter() {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get employee info from localStorage (set during login)
    const employeeData = localStorage.getItem('employee_info');
    if (employeeData) {
      try {
        const parsed = JSON.parse(employeeData);
        setEmployeeInfo(parsed);
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!employeeInfo) {
    return <Navigate to="/login" replace />;
  }

  // Route based on job title
  const { job_title } = employeeInfo;

  switch (job_title) {
    case 'General Manager':
      return <Navigate to="/admin" replace />;

    case 'Store Manager':
      // Store Manager handles merchandise/gift shops
      localStorage.setItem('manager_department', 'giftshop');
      return <Navigate to="/manager" replace />;

    case 'Concession Manager':
      // Concession Manager handles food and drinks
      localStorage.setItem('manager_department', 'foodanddrinks');
      return <Navigate to="/manager" replace />;

    case 'Mechanical Employee':
      return <Navigate to="/maintenance" replace />;

    case 'Sales Employee':
      // Sales employees work in gift/merchandise stores
      return <Navigate to="/employee-dashboard" replace />;

    case 'Concession Employee':
      // Concession employees work in food/drink areas
      return <Navigate to="/employee-dashboard" replace />;

    default:
      // Unknown job title, redirect to login
      console.warn('Unknown job title:', job_title);
      localStorage.removeItem('employee_info');
      return <Navigate to="/login" replace />;
  }
}
