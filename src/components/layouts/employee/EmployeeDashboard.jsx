import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false);
  const [assignedStores, setAssignedStores] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployeeData = async () => {
      // Get employee info from localStorage
      const employeeData = localStorage.getItem('employee_info');
      if (employeeData) {
        try {
          const parsed = JSON.parse(employeeData);
          setEmployeeInfo(parsed);

          // Fetch assigned stores from the database
          let fetchedStores = [];
          try {
            console.log('=== DEBUG: Fetching stores for employee ===');
            console.log('Employee ID:', parsed.employee_id);
            console.log('API endpoint:', `/employee/${parsed.employee_id}/stores`);

            const storesData = await api.getEmployeeStores(parsed.employee_id);

            console.log('=== DEBUG: API Response ===');
            console.log('Raw response:', storesData);
            console.log('Is array?', Array.isArray(storesData));
            console.log('Length:', storesData?.length);
            console.log('First item:', storesData?.[0]);

            fetchedStores = storesData || [];
            setAssignedStores(fetchedStores);

            console.log('=== DEBUG: State updated ===');
            console.log('fetchedStores:', fetchedStores);
          } catch (error) {
            console.error('=== ERROR: Failed to fetch employee stores ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            setAssignedStores([]);
          }

          // Get recent transactions for assigned stores (still mock for now)
          // TODO: Replace with real API call when store orders endpoint is ready
          const mockTransactions = getMockTransactionsForStores(fetchedStores);
          setRecentTransactions(mockTransactions);

        } catch (error) {
          console.error('Error parsing employee data:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    loadEmployeeData();
  }, [navigate]);

  // Mock data function for transactions - replace with real API call later
  const getMockTransactionsForStores = (stores) => {
    if (stores.length === 0) return [];
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
          <div>
            <button
              onClick={() => setShowEmployeeInfo(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#5a6b3d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6d8047'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#5a6b3d'}
            >My Information
            </button>
            <button onClick={handleLogout} className="logout-btn">
            Logout
            </button>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-grid">
          {/* Assigned Stores */}
          <div className="dashboard-card">
            <h2>🏪 My Shifts</h2>
            <div className="stores-list">
              {assignedStores.length === 0 ? (
                <p className="no-stores-message">No shifts scheduled yet.</p>
              ) : (
                assignedStores.map((shift, index) => (
                  <div key={`${shift.store_id}-${shift.work_date}-${index}`} className="store-item">
                    <div className="store-info">
                      <h3>{shift.name}</h3>
                      <span className="store-type">{shift.type}</span>
                      <span className={`store-status status-${shift.status}`}>
                        {shift.status}
                      </span>
                    </div>
                    <div className="shift-details">
                      <div className="shift-info-row">
                        <span className="shift-label">📅 Date:</span>
                        <span className="shift-value">
                          {shift.work_date
                            ? new Date(shift.work_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Not set'}
                        </span>
                      </div>
                      <div className="shift-info-row">
                        <span className="shift-label">⏰ Shift:</span>
                        <span className="shift-value">
                          {shift.shift_start && shift.shift_end
                            ? `${shift.shift_start.slice(0, 5)} - ${shift.shift_end.slice(0, 5)}`
                            : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            </div>
          </div>
        </div>
      </main>

      {/* Employee Information Modal */}
      {showEmployeeInfo && employeeInfo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '18px',
            maxWidth: '400px',
            width: '100%',
            margin: '0 16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#3e4b2b', marginBottom: '24px'}}>
              Employee Information
            </h2>

            <div>
              <div>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Employee ID
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.employee_id}
                </p>
              </div>

              <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Name
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.first_name} {employeeInfo.last_name}
                </p>
              </div>

              <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Job Title
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.job_title}
                </p>
              </div>

              <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Email
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.email || 'Not provided'}
                </p>
              </div>

              <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Phone
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.phone || 'Not provided'}
                </p>
              </div>

              <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Gender
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.gender || 'Not provided'}
                </p>
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                  Hire Date
                </label>
                <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                  {employeeInfo.hire_date
                    ? new Date(employeeInfo.hire_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not provided'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEmployeeInfo(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3e4b2b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
