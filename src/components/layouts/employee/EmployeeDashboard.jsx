import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [assignedStores, setAssignedStores] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get employee info from localStorage
    const employeeData = localStorage.getItem('employee_info');
    if (employeeData) {
      try {
        const parsed = JSON.parse(employeeData);
        setEmployeeInfo(parsed);

        // Get assigned stores based on employee job type
        // For now, we'll simulate this - in a real app, this would come from the API
        const mockStores = getMockStoresForEmployee(parsed.job_title);
        setAssignedStores(mockStores);

        // Get recent transactions for assigned stores
        const mockTransactions = getMockTransactionsForStores(mockStores);
        setRecentTransactions(mockTransactions);

      } catch (error) {
        console.error('Error parsing employee data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  // Mock data functions - replace with real API calls
  const getMockStoresForEmployee = (jobTitle) => {
    if (jobTitle === 'Sales Employee') {
      return [
        { store_id: 1, name: 'Main Gift Shop', type: 'merchandise' },
        { store_id: 2, name: 'East Gift Shop', type: 'merchandise' }
      ];
    } else if (jobTitle === 'Concession Employee') {
      return [
        { store_id: 3, name: 'Main Concession Stand', type: 'food/drink' },
        { store_id: 4, name: 'Poolside Snacks', type: 'food/drink' }
      ];
    }
    return [];
  };

  const getMockTransactionsForStores = (stores) => {
    return stores.flatMap(store =>
      Array.from({ length: 3 }, (_, i) => ({
        id: `${store.store_id}-${i}`,
        store_name: store.name,
        time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toLocaleTimeString(),
        amount: (Math.random() * 50 + 10).toFixed(2),
        items: Math.floor(Math.random() * 5) + 1
      }))
    ).sort((a, b) => new Date('2000-01-01 ' + b.time) - new Date('2000-01-01 ' + a.time));
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!employeeInfo) {
    return null;
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="employee-header">
        <div className="header-content">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome back, {employeeInfo.first_name} {employeeInfo.last_name}</p>
            <span className="job-title">{employeeInfo.job_title}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-grid">
          {/* Assigned Stores */}
          <div className="dashboard-card">
            <h2>🏪 My Stores</h2>
            <div className="stores-list">
              {assignedStores.map(store => (
                <div key={store.store_id} className="store-item">
                  <div className="store-info">
                    <h3>{store.name}</h3>
                    <span className="store-type">{store.type}</span>
                  </div>
                  <button className="view-store-btn">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="dashboard-card">
            <h2>📊 Today's Activity</h2>
            <div className="activity-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {recentTransactions.filter(t =>
                    new Date(t.time).toDateString() === new Date().toDateString()
                  ).length}
                </span>
                <span className="stat-label">Transactions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  ${recentTransactions
                    .filter(t => new Date(t.time).toDateString() === new Date().toDateString())
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toFixed(2)}
                </span>
                <span className="stat-label">Revenue</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {recentTransactions
                    .filter(t => new Date(t.time).toDateString() === new Date().toDateString())
                    .reduce((sum, t) => sum + t.items, 0)}
                </span>
                <span className="stat-label">Items Sold</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="dashboard-card full-width">
            <h2>🛒 Recent Transactions</h2>
            <div className="transactions-list">
              {recentTransactions.slice(0, 10).map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="store-name">{transaction.store_name}</span>
                    <span className="transaction-time">{transaction.time}</span>
                  </div>
                  <div className="transaction-details">
                    <span className="items-count">{transaction.items} items</span>
                    <span className="amount">${transaction.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>⚡ Quick Actions</h2>
            <div className="quick-actions">
              <button className="action-btn">
                📱 Process Sale
              </button>
              <button className="action-btn">
                📦 Check Inventory
              </button>
              <button className="action-btn">
                🔔 Request Help
              </button>
              <button className="action-btn">
                📋 Daily Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
