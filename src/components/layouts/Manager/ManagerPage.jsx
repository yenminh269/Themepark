import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdDashboard, 
  MdPeople, 
  MdInventory, 
  MdSchedule, 
  MdLogout,
  MdStore,
  MdWarning,
  MdAttachMoney,
  MdAssessment,
  MdShoppingCart,
  MdEdit,
  MdAdd,
  MdClose,
  MdSave,
  MdPerson,
  MdSearch,
  MdDeleteOutline,
  MdAddCircle,
  MdCheck,
  MdUpload,
  MdFilterList,
  MdReceipt, 
  MdExpandMore, 
  MdExpandLess,
  MdFileDownload,
  MdTrendingUp,
  MdDelete,
  MdRefresh 
} from "react-icons/md";
import "./ManagerPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'error' && <MdClose size={20} />}
        {type === 'success' && <MdCheck size={20} />}
        {type === 'warning' && <MdWarning size={20} />}
        <span>{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <MdClose size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

//SIDEBAR
const Sidebar = ({ activeTab, setActiveTab, managerInfo, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const tabs = [
    { id: "overview", label: "Dashboard", icon: MdDashboard },
    { id: "employees", label: "Employees", icon: MdPeople },
    { id: "inventory", label: "Inventory", icon: MdInventory },
    { id: "schedules", label: "Schedules", icon: MdSchedule },
    { id: "orders", label: "Orders", icon: MdReceipt },
  ];

  const handleLogoutClick = () => {
    if (showLogoutConfirm) {
      onLogout();
    } else {
      setShowLogoutConfirm(true);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Velocity Valley</h2>
        <p className="sidebar-subtitle">Manager Portal</p>
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="nav-icon" size={22} />
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {managerInfo && (
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {managerInfo.first_name?.[0]}{managerInfo.last_name?.[0]}
            </div>
            <div className="profile-info">
              <p className="profile-name">
                {managerInfo.first_name} {managerInfo.last_name}
              </p>
              <p className="profile-title">{managerInfo.job_title}</p>
            </div>
          </div>
          
          {!showLogoutConfirm ? (
            <button className="logout-button" onClick={handleLogoutClick}>
              <MdLogout size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <div className="logout-confirm">
              <p className="logout-text">Sure you want to logout?</p>
              <div className="logout-actions">
                <button className="btn-confirm-logout" onClick={handleLogoutClick}>
                  <MdCheck size={18} />
                  Yes
                </button>
                <button className="btn-cancel-logout" onClick={() => setShowLogoutConfirm(false)}>
                  <MdClose size={18} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

// stat
const StatCard = ({ title, value, icon: Icon, color = "#66785F", subtitle }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div className="stat-content">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// overview
const OverviewTab = ({ managerInfo }) => {
  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [storeSales, setStoreSales] = useState([]);
  const [scheduledEmployees, setScheduledEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING DASHBOARD DATA ===');
      
      // Fetch all employees
      console.log('Fetching employees...');
      const employeesRes = await fetch(`${API_URL}/api/manager/employees/all`);
      const employeesData = await employeesRes.json();
      console.log('Employees response:', employeesData);
      
      // Filter employees who have at least one shift
      const scheduled = Array.isArray(employeesData) 
        ? employeesData.filter(emp => emp.total_shifts > 0)
        : [];
      console.log('Scheduled employees:', scheduled);
      setScheduledEmployees(scheduled);

      // Get active stores count
      console.log('Fetching stores...');
      const storesRes = await fetch(`${API_URL}/api/manager/stores/all`);
      const allStores = await storesRes.json();
      console.log('Stores response:', allStores);
      const activeStoresCount = Array.isArray(allStores) 
        ? allStores.filter(s => s.status === 'open').length
        : 0;
      console.log('Active stores count:', activeStoresCount);

      // Fetch low stock
      console.log('Fetching dashboard stats...');
      const [giftStats, foodStats] = await Promise.all([
        fetch(`${API_URL}/api/manager/dashboard-stats/giftshop`).then(r => r.json()),
        fetch(`${API_URL}/api/manager/dashboard-stats/foodanddrinks`).then(r => r.json())
      ]);
      console.log('Gift stats:', giftStats);
      console.log('Food stats:', foodStats);

      const combinedStats = {
        active_employees: scheduled.length,
        active_stores: activeStoresCount,
        low_stock_count: (giftStats.low_stock_count || 0) + (foodStats.low_stock_count || 0)
      };
      
      console.log('Combined stats:', combinedStats);
      setStats(combinedStats);

      // Fetch top items from OLD working endpoint
      console.log('Fetching top items...');
      const [giftItems, foodItems] = await Promise.all([
        fetch(`${API_URL}/api/manager/top-items/giftshop?limit=3`).then(r => r.json()),
        fetch(`${API_URL}/api/manager/top-items/foodanddrinks?limit=3`).then(r => r.json())
      ]);
      
      console.log('Gift items:', giftItems);
      console.log('Food items:', foodItems);
      
      const allTopItems = [
        ...(Array.isArray(giftItems) ? giftItems : []),
        ...(Array.isArray(foodItems) ? foodItems : [])
      ].slice(0, 5);
      
      console.log('Combined top items:', allTopItems);
      setTopItems(allTopItems);

      // Fetch store sales
      console.log('Fetching store sales...');
      const salesRes = await fetch(`${API_URL}/api/manager/sales-by-store`);
      const salesData = await salesRes.json();
      console.log('Store sales:', salesData);
      setStoreSales(Array.isArray(salesData) ? salesData : []);
      
      setLoading(false);
      console.log('=== DASHBOARD FETCH COMPLETE ===');
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({ active_employees: 0, active_stores: 0, low_stock_count: 0 });
      setTopItems([]);
      setStoreSales([]);
      setScheduledEmployees([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  return (
    <div className="overview-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back, {managerInfo?.first_name}!</p>
        </div>
      </div>

      <div className="stats-grid">
        {/* Scheduled Employees */}
        <div className="stat-card expandable" style={{ borderTopColor: '#B2C9AD' }}>
          <div 
            className="stat-header clickable"
            onClick={() => setShowEmployeeDetails(!showEmployeeDetails)}
          >
            <div className="stat-icon" style={{ backgroundColor: '#B2C9AD20' }}>
              <MdPeople size={24} style={{ color: '#B2C9AD' }} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Scheduled Employees</p>
              <h3 className="stat-value">{stats?.active_employees || 0}</h3>
              <p className="stat-subtitle">Click to view list</p>
            </div>
            <div className="expand-icon">
              {showEmployeeDetails ? '▼' : '▶'}
            </div>
          </div>

          {showEmployeeDetails && (
            <div className="store-details-section">
              <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Employees with Upcoming Shifts</h4>
              {scheduledEmployees.length > 0 ? (
                <div className="employee-list">
                  {scheduledEmployees.map((emp) => (
                    <div key={emp.employee_id} className="employee-list-item">
                      <div className="employee-avatar-small">
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <div className="employee-list-info">
                        <h5>{emp.first_name} {emp.last_name}</h5>
                        <p>{emp.total_shifts} shift{emp.total_shifts !== 1 ? 's' : ''} scheduled</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-small">
                  <p>No employees scheduled</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Stores */}
        <div className="stat-card expandable" style={{ borderTopColor: '#4B5945' }}>
          <div 
            className="stat-header clickable"
            onClick={() => setShowStoreDetails(!showStoreDetails)}
          >
            <div className="stat-icon" style={{ backgroundColor: '#4B594520' }}>
              <MdStore size={24} style={{ color: '#4B5945' }} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Active Stores</p>
              <h3 className="stat-value">{stats?.active_stores || 0}</h3>
              <p className="stat-subtitle">Click to view sales</p>
            </div>
            <div className="expand-icon">
              {showStoreDetails ? '▼' : '▶'}
            </div>
          </div>

          {showStoreDetails && (
            <div className="store-details-section">
              <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Store Sales (This Month)</h4>
              {storeSales && storeSales.length > 0 ? (
                <div className="store-sales-list">
                  {storeSales.map((store) => (
                    <div key={store.store_id} className="store-sale-item">
                      <div className="store-info">
                        <h4>{store.store_name}</h4>
                        <span className="store-type-badge-small">{store.store_type}</span>
                      </div>
                      <div className="store-metrics">
                        <div className="metric">
                          <span className="metric-label">Revenue</span>
                          <span className="metric-value">${parseFloat(store.total_revenue || 0).toFixed(2)}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Orders</span>
                          <span className="metric-value">{store.total_orders || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-small">
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {stats?.low_stock_count > 0 && (
        <div className="alert-section warning">
          <MdWarning size={24} />
          <div>
            <h4>Low Stock Alert</h4>
            <p>{stats.low_stock_count} items are running low on stock.</p>
          </div>
        </div>
      )}

      {/* Top Selling Items */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Top Selling Items This Month</h2>
        </div>
        
        {topItems && topItems.length > 0 ? (
          <div className="top-items-grid">
            {topItems.map((item, index) => (
              <div key={item.item_id} className="top-item-card">
                <div className="item-rank">#{index + 1}</div>
                <img 
                  src={item.image_url || 'https://via.placeholder.com/80'} 
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">${item.price}</p>
                  <div className="item-stats">
                    <span>{item.total_sold} sold</span>
                    <span className="revenue">${parseFloat(item.total_revenue).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MdShoppingCart size={48} />
            <p>No sales data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
//EMPLOYEES
const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showRemoveEmployeeModal, setShowRemoveEmployeeModal] = useState(false);
const [employeeToRemove, setEmployeeToRemove] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    store_id: '',
    work_date: new Date().toISOString().split('T')[0],
    shift_start: '09:00',
    shift_end: '17:00'
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchEmployees();
    fetchStores();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Fetching employees...');
      const res = await fetch(`${API_URL}/api/manager/employees/all`);
      const data = await res.json();
      console.log('Employees data:', data);
      setEmployees(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      addToast('Failed to load employees', 'error');
      setEmployees([]);
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...');
      const res = await fetch(`${API_URL}/api/manager/stores/all`);
      const data = await res.json();
      console.log('Stores data:', data);
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      addToast('Failed to load stores', 'error');
      setStores([]);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(emp => {
      const firstName = emp.first_name || '';
      const lastName = emp.last_name || '';
      const email = emp.email || '';
      const phone = emp.phone || '';
      
      return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             phone.includes(searchTerm);
    });
    setFilteredEmployees(filtered);
  };

  const handleAssignEmployee = async () => {
    console.log('=== ASSIGNMENT DEBUG ===');
    console.log('Selected Employee:', selectedEmployee);
    console.log('Assignment Data:', assignmentData);
    console.log('Store ID Type:', typeof assignmentData.store_id);
    console.log('Store ID Value:', assignmentData.store_id);
    
    if (!selectedEmployee) {
      addToast('No employee selected', 'error');
      return;
    }

    if (!assignmentData.store_id || assignmentData.store_id === '') {
      addToast('Please select a store', 'warning');
      return;
    }

    if (!assignmentData.work_date) {
      addToast('Please select a work date', 'warning');
      return;
    }

    if (!assignmentData.shift_start || !assignmentData.shift_end) {
      addToast('Please select shift times', 'warning');
      return;
    }

    const payload = {
      employee_id: parseInt(selectedEmployee.employee_id),
      store_id: parseInt(assignmentData.store_id),
      work_date: assignmentData.work_date,
      shift_start: assignmentData.shift_start,
      shift_end: assignmentData.shift_end
    };

    console.log('Payload being sent:', payload);
    console.log('API URL:', `${API_URL}/api/manager/assign-employee`);

    try {
      const res = await fetch(`${API_URL}/api/manager/assign-employee`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        addToast('Employee assigned successfully!', 'success');
        setShowAssignModal(false);
        setAssignmentData({
          store_id: '',
          work_date: new Date().toISOString().split('T')[0],
          shift_start: '09:00',
          shift_end: '17:00'
        });
        fetchEmployees();
      } else {
        console.error('Assignment failed:', data);
        addToast(data.error || 'Failed to assign employee', 'error');
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      addToast('Network error: Unable to assign employee', 'error');
    }
  };


// Handle the actual removal after confirmation
const openRemoveEmployeeModal = (employee) => {
    setEmployeeToRemove(employee);
    setShowRemoveEmployeeModal(true);
  };

  const handleRemovalRequest = async () => {
    if (!employeeToRemove) return;

    try {
      const res = await fetch(`${API_URL}/api/manager/request-employee-removal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeToRemove.employee_id
        })
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Removal request sent to admin successfully!', 'success');
        setShowRemoveEmployeeModal(false);
        setEmployeeToRemove(null);
        fetchEmployees();
      } else {
        addToast(data.error || 'Failed to send removal request', 'error');
      }
    } catch (error) {
      console.error("Error requesting removal:", error);
      addToast('Error sending removal request', 'error');
    }
  };
  if (loading) {
    return <div className="loading-container">Loading employees...</div>;
  }

  return (
    <div className="employees-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">Manage your team and assign them to stores</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <MdSearch size={20} className="search-icon" />
          <input 
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-results-info">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      <div className="employees-grid">
        {filteredEmployees.map((employee) => (
          <div key={employee.employee_id} className="employee-card">
            <div className="employee-avatar">
              {(employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')}
            </div>
            <div className="employee-info">
              <h3>{employee.first_name} {employee.last_name}</h3>
              <p className="employee-role">{employee.job_title}</p>
              <div className="employee-stats">
                <div className="stat">
                  <span className="label">Hours (Month)</span>
                  <span className="value">{employee.total_hours || 0}h</span>
                </div>
                <div className="stat">
                  <span className="label">Shifts</span>
                  <span className="value">{employee.total_shifts || 0}</span>
                </div>
              </div>
              <div className="employee-contact">
                <p>{employee.email}</p>
                <p>{employee.phone}</p>
              </div>
            </div>
            <div className="employee-actions">
              <button 
                className="assign-btn"
                onClick={() => {
                  console.log('Opening modal for employee:', employee);
                  setSelectedEmployee(employee);
                  setShowAssignModal(true);
                }}
              >
                <MdSchedule size={18} />
                Assign to Store
              </button>
              <button
  className="remove-btn"
  onClick={() => openRemoveEmployeeModal(employee)}
>
  <MdDeleteOutline size={18} />
  Request Removal
</button>

            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="empty-state">
          <MdPeople size={64} />
          <p>{searchTerm ? 'No employees found matching your search' : 'No employees found'}</p>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign {selectedEmployee?.first_name} to Store</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Select Store *</label>
                <select 
                  value={assignmentData.store_id}
                  onChange={(e) => {
                    console.log('Store selected - value:', e.target.value);
                    console.log('Store selected - type:', typeof e.target.value);
                    setAssignmentData({...assignmentData, store_id: e.target.value});
                  }}
                  className="form-select"
                >
                  <option value="">Choose a store...</option>
                  {stores.map(store => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.name} ({store.type})
                    </option>
                  ))}
                </select>
                {stores.length === 0 && (
                  <span className="error-text">No stores available</span>
                )}
              </div>

              <div className="form-group">
                <label>Work Date *</label>
                <input 
                  type="date"
                  value={assignmentData.work_date}
                  onChange={(e) => setAssignmentData({...assignmentData, work_date: e.target.value})}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Shift Start *</label>
                  <input 
                    type="time"
                    value={assignmentData.shift_start}
                    onChange={(e) => setAssignmentData({...assignmentData, shift_start: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Shift End *</label>
                  <input 
                    type="time"
                    value={assignmentData.shift_end}
                    onChange={(e) => setAssignmentData({...assignmentData, shift_end: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAssignEmployee}
                disabled={!assignmentData.store_id}
              >
                <MdSave size={18} />
                Assign Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE EMPLOYEE MODAL */}
      {showRemoveEmployeeModal && employeeToRemove && (
        <div className="modal-overlay" onClick={() => setShowRemoveEmployeeModal(false)}>
          <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><MdWarning /> Confirm Removal Request</h2>
              <button className="close-btn" onClick={() => setShowRemoveEmployeeModal(false)}>
                <MdClose size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirmation-message">
                <MdWarning size={48} className="warning-icon" />
                <p>
                  Are you sure you want to request removal for{" "}
                  <strong>
                    {employeeToRemove.first_name} {employeeToRemove.last_name}
                  </strong>?
                </p>
                <p className="warning-text">
                  This will send a removal request to the administrator for review.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRemoveEmployeeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleRemovalRequest}
              >
                <MdDeleteOutline /> Yes, Request Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// INVENTORY
const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStore, setFilterStore] = useState('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteInventoryModal, setShowDeleteInventoryModal] = useState(false);
const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    type: 'apparel',
    image_url: '',
    store_assignments: []
  });
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    description: '',
    type: '',
    stock_quantity: 0
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchInventory();
    fetchStores();
  }, []);

  useEffect(() => {
    filterInventoryData();
  }, [inventory, searchTerm, filterStatus, filterStore]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/manager/inventory/all`);
      const data = await res.json();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      addToast('Failed to load inventory', 'error');
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/stores/all`);
      const data = await res.json();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      addToast('Failed to load stores', 'error');
    }
  };

  const filterInventoryData = () => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const itemName = item.name || '';
        const storeName = item.store_name || '';
        return itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               storeName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.stock_status === filterStatus);
    }

    if (filterStore !== 'all') {
      filtered = filtered.filter(item => item.store_id === parseInt(filterStore));
    }

    setFilteredInventory(filtered);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      price: item.price,
      description: item.description,
      type: item.type,
      stock_quantity: item.stock_quantity
    });
    setShowEditModal(true);
  };

  const handleEditItem = async () => {
    // Validate
    if (!editForm.name.trim()) {
      addToast('❌ Item name is required', 'error');
      return;
    }
    if (!editForm.price || parseFloat(editForm.price) <= 0) {
      addToast('❌ Price must be greater than 0', 'error');
      return;
    }
    if (parseFloat(editForm.price) > 9999.99) {
      addToast('❌ Price cannot exceed $9,999.99', 'error');
      return;
    }
    if (editForm.stock_quantity < editingItem.stock_quantity) {
      addToast('❌ Cannot decrease inventory! Stock only decreases through customer purchases.', 'error');
      return;
    }

    try {
      // Update merchandise details
      const merchRes = await fetch(`${API_URL}/api/manager/merchandise/${editingItem.item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          price: parseFloat(editForm.price),
          description: editForm.description,
          type: editForm.type
        })
      });

      if (!merchRes.ok) {
        throw new Error('Failed to update merchandise');
      }

      // Update stock if changed
      if (editForm.stock_quantity !== editingItem.stock_quantity) {
        const stockRes = await fetch(
          `${API_URL}/api/manager/inventory/${editingItem.store_id}/${editingItem.item_id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_quantity: editForm.stock_quantity })
          }
        );

        if (!stockRes.ok) {
          throw new Error('Failed to update stock');
        }
      }

      addToast('✅ Item updated successfully!', 'success');
      setShowEditModal(false);
      setEditingItem(null);
      fetchInventory();
    } catch (error) {
      console.error("Error updating item:", error);
      addToast('❌ Error updating item', 'error');
    }
  };

  const validateItemForm = () => {
    const errors = {};
    
    if (!newItem.name.trim()) {
      errors.name = 'Item name is required';
    }
    
    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (parseFloat(newItem.price) > 9999.99) {
      errors.price = 'Price cannot exceed $9,999.99';
    }
    
    if (!newItem.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!newItem.image_url.trim() && !imageFile) {
      errors.image_url = 'Image URL or upload is required';
    }
    
    if (newItem.store_assignments.length === 0) {
      errors.stores = 'Please assign to at least one store';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteItem = async (storeId, itemId) => {
    if (!window.confirm('Remove this item from the store?')) return;

    try {
      const res = await fetch(`${API_URL}/api/manager/inventory/${storeId}/${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addToast(' Item removed successfully', 'success');
        fetchInventory();
      } else {
        addToast(' Failed to remove item', 'error');
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      addToast('❌ Error removing item', 'error');
    }
  };

  const handleAddItem = async () => {
    if (!validateItemForm()) {
      addToast('Please fix all errors before submitting', 'warning');
      return;
    }

    try {
      let imageUrl = newItem.image_url;

      if (imageFile) {
        const formData = new FormData();
        formData.append('photo', imageFile);
        
        const uploadRes = await fetch(`${API_URL}/api/manager/upload/merchandise`, {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.photo_path;
        }
      }

      const itemRes = await fetch(`${API_URL}/api/manager/merchandise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          price: parseFloat(newItem.price),
          quantity: 0,
          description: newItem.description,
          type: newItem.type,
          image_url: imageUrl
        })
      });

      if (!itemRes.ok) {
        throw new Error('Failed to create item');
      }

      const itemData = await itemRes.json();
      const itemId = itemData.item_id;

      const inventoryPromises = newItem.store_assignments.map(assignment => 
        fetch(`${API_URL}/api/manager/inventory/${assignment.store_id}/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_quantity: assignment.stock_quantity })
        })
      );

      await Promise.all(inventoryPromises);

      addToast(' Item added successfully!', 'success');
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        price: '',
        description: '',
        type: 'apparel',
        image_url: '',
        store_assignments: []
      });
      setImageFile(null);
      setFormErrors({});
      fetchInventory();
    } catch (error) {
      console.error("Error adding item:", error);
      addToast(' Error adding item', 'error');
    }
  };
  // Open delete inventory modal
const openDeleteInventoryModal = (storeId, itemId, itemName, storeName) => {
  setInventoryToDelete({ storeId, itemId, itemName, storeName });
  setShowDeleteInventoryModal(true);
};

// NEW: Handle delete inventory confirmation  
const handleDeleteInventory = async () => {
  if (!inventoryToDelete) return;

  try {
    const res = await fetch(
      `${API_URL}/api/manager/inventory/${inventoryToDelete.storeId}/${inventoryToDelete.itemId}`,
      { method: 'DELETE' }
    );

    if (res.ok) {
      addToast("Item removed from inventory", "success");
      setShowDeleteInventoryModal(false);
      setInventoryToDelete(null);
      fetchInventory();
    } else {
      addToast("Failed to remove item", "error");
    }
  } catch (error) {
    console.error("Error removing item:", error);
    addToast("Error removing item", "error");
  }
};

  const handleStoreAssignment = (storeId, isChecked) => {
    if (isChecked) {
      setNewItem({
        ...newItem,
        store_assignments: [...newItem.store_assignments, { store_id: storeId, stock_quantity: 20 }]
      });
    } else {
      setNewItem({
        ...newItem,
        store_assignments: newItem.store_assignments.filter(a => a.store_id !== storeId)
      });
    }
  };

  const updateStoreQuantity = (storeId, quantity) => {
    setNewItem({
      ...newItem,
      store_assignments: newItem.store_assignments.map(a => 
        a.store_id === storeId ? { ...a, stock_quantity: parseInt(quantity) || 0 } : a
      )
    });
  };

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'critical': return '#dc3545';
      case 'low': return '#ffc107';
      default: return '#28a745';
    }
  };

  const merchandiseTypes = ['apparel', 'toys', 'accessories', 'drinkware', 'snacks', 'beverages'];

  if (loading) {
    return <div className="loading-container">Loading inventory...</div>;
  }

  return (
    <div className="inventory-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Monitor and update stock levels across all stores</p>
        </div>
        <button className="btn-add-item" onClick={() => setShowAddItemModal(true)}>
          <MdAddCircle size={20} />
          Add New Item
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <MdSearch size={20} className="search-icon" />
          <input 
            type="text"
            placeholder="Search items or stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <MdFilterList size={20} />
            <select 
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stores</option>
              {stores.map(store => (
                <option key={store.store_id} value={store.store_id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All Items
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'critical' ? 'active' : ''}`}
              onClick={() => setFilterStatus('critical')}
            >
              Critical
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'low' ? 'active' : ''}`}
              onClick={() => setFilterStatus('low')}
            >
              Low Stock
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'normal' ? 'active' : ''}`}
              onClick={() => setFilterStatus('normal')}
            >
              Normal
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Store</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={`${item.store_id}-${item.item_id}`}>
                <td>
                  <div className="item-cell">
                    <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name || 'Item'} />
                    <div>
                      <p className="item-name">{item.name || 'Unnamed Item'}</p>
                      <p className="item-desc">{item.description ? item.description.substring(0, 40) + '...' : 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td>{item.store_name}</td>
                <td><span className="category-badge">{item.type}</span></td>
                <td>${item.price}</td>
                <td>
                  <span className="stock-value">{item.stock_quantity}</span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStockStatusColor(item.stock_status)}20`,
                      color: getStockStatusColor(item.stock_status)
                    }}
                  >
                    {item.stock_status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn"
                      onClick={() => openEditModal(item)}
                      title="Edit Item"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
  className="icon-btn-danger"
  onClick={() =>
    openDeleteInventoryModal(
      item.store_id,
      item.item_id,
      item.name,
      item.store_name
    )
  }
  title="Remove from Store"
>
  <MdDeleteOutline size={18} />
</button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="empty-state">
            <MdInventory size={64} />
            <p>No inventory items found</p>
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Item Name *</label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price * (Max: $9,999.99)</label>
                  <input 
                    type="number"
                    step="0.01"
                    max="9999.99"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={editForm.type}
                    onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                    className="form-select"
                  >
                    {merchandiseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Store</label>
                <input 
                  type="text"
                  value={editingItem.store_name}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity * (Can only increase)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    padding: '10px 16px', 
                    background: '#f0f4f0', 
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: '#4B5945'
                  }}>
                    Current: {editingItem.stock_quantity}
                  </span>
                  <span style={{ fontSize: '20px', color: '#91AC8F' }}>→</span>
                  <input 
                    type="number"
                    min={editingItem.stock_quantity}
                    value={editForm.stock_quantity}
                    onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value) || 0})}
                    className="form-input"
                    style={{ maxWidth: '150px' }}
                  />
                </div>
                <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
                  ⚠️ Stock can only increase. Customer purchases decrease stock automatically.
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditItem}>
                <MdSave size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="modal-overlay" onClick={() => setShowAddItemModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="close-btn" onClick={() => setShowAddItemModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
                <label>Item Name *</label>
                <input 
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="form-input"
                  placeholder="Enter item name"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.price ? 'has-error' : ''}`}>
                  <label>Price * (Max: $9,999.99)</label>
                  <input 
                    type="number"
                    step="0.01"
                    max="9999.99"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                    className="form-select"
                  >
                    {merchandiseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`form-group ${formErrors.description ? 'has-error' : ''}`}>
                <label>Description *</label>
                <textarea 
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter item description"
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className={`form-group ${formErrors.image_url ? 'has-error' : ''}`}>
                <label>Image *</label>
                <div className="image-upload-section">
                  <input 
                    type="url"
                    value={newItem.image_url}
                    onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="or-divider">OR</span>
                  <label className="file-upload-btn">
                    <MdUpload size={20} />
                    {imageFile ? imageFile.name : 'Upload Image'}
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setImageFile(e.target.files[0]);
                        setNewItem({...newItem, image_url: ''});
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {formErrors.image_url && <span className="error-text">{formErrors.image_url}</span>}
              </div>

              <div className={`form-group ${formErrors.stores ? 'has-error' : ''}`}>
                <label>Assign to Stores *</label>
                <div className="store-assignments">
                  {stores.map(store => {
                    const assignment = newItem.store_assignments.find(a => a.store_id === store.store_id);
                    const isAssigned = !!assignment;
                    
                    return (
                      <div key={store.store_id} className="store-assignment-row">
                        <label className="checkbox-label">
                          <input 
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => handleStoreAssignment(store.store_id, e.target.checked)}
                          />
                          <span>{store.name} ({store.type})</span>
                        </label>
                        {isAssigned && (
                          <input 
                            type="number"
                            min="0"
                            value={assignment.stock_quantity}
                            onChange={(e) => updateStoreQuantity(store.store_id, e.target.value)}
                            className="quantity-input"
                            placeholder="Qty"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {formErrors.stores && <span className="error-text">{formErrors.stores}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddItemModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddItem}>
                <MdSave size={18} />
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE INVENTORY MODAL */}
{showDeleteInventoryModal && inventoryToDelete && (
  <div className="modal-overlay" onClick={() => setShowDeleteInventoryModal(false)}>
    <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2><MdWarning /> Confirm Removal</h2>
        <button className="close-btn" onClick={() => setShowDeleteInventoryModal(false)}>
          <MdClose size={24} />
        </button>
      </div>

      <div className="modal-body">
        <div className="confirmation-message">
          <MdWarning size={48} className="warning-icon" />
          <p>
            Are you sure you want to remove <strong>{inventoryToDelete.itemName}</strong> from{" "}
            <strong>{inventoryToDelete.storeName}</strong>?
          </p>
          <p className="warning-text">This will remove the item from this store's inventory.</p>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          className="btn-secondary" 
          onClick={() => setShowDeleteInventoryModal(false)}
        >
          Cancel
        </button>
        <button 
          className="btn-danger" 
          onClick={handleDeleteInventory}
        >
          <MdDelete /> Yes, Remove Item
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
// SCHEDULES
const SchedulesTab = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ADD THIS
  const [scheduleToDelete, setScheduleToDelete] = useState(null); // ADD THIS
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    employee_id: 'all',
    store_id: 'all'
  });
  const [scheduleForm, setScheduleForm] = useState({
    employee_id: '',
    store_id: '',
    work_date: new Date().toISOString().split('T')[0],
    shift_start: '09:00',
    shift_end: '17:00'
  });
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
    fetchStores();
  }, [dateRange]);

  useEffect(() => {
    filterSchedules();
  }, [schedules, filters]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(dateRange);
      const res = await fetch(`${API_URL}/api/manager/schedules/all?${params}`);
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/employees/all`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/stores/all`);
      const data = await res.json();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const filterSchedules = () => {
    let filtered = [...schedules];

    if (filters.employee_id !== 'all') {
      filtered = filtered.filter(s => s.employee_id === parseInt(filters.employee_id));
    }

    if (filters.store_id !== 'all') {
      filtered = filtered.filter(s => s.store_id === parseInt(filters.store_id));
    }

    setFilteredSchedules(filtered);
  };

  const handleEditSchedule = async () => {
  if (!editingSchedule) return;

  try {
    const res = await fetch(
      `${API_URL}/api/manager/schedule/${editingSchedule.employee_id}/${editingSchedule.store_id}/${editingSchedule.work_date}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_store_id: scheduleForm.store_id,
          new_work_date: scheduleForm.work_date,
          shift_start: scheduleForm.shift_start,
          shift_end: scheduleForm.shift_end
        })
      }
    );

    const data = await res.json();

    if (res.ok) {
      addToast('✅ Schedule updated successfully!', 'success');
      setShowEditModal(false);
      setEditingSchedule(null);
      fetchSchedules();
    } else {
      addToast(`❌ ${data.error}`, 'error');
    }
  } catch (error) {
    console.error("Error updating schedule:", error);
    addToast('❌ Error updating schedule', 'error');
  }
};

const openEditModal = (schedule) => {
  setEditingSchedule(schedule);
  setScheduleForm({
    employee_id: schedule.employee_id,
    store_id: schedule.store_id,
    work_date: schedule.work_date.split('T')[0],
    shift_start: schedule.shift_start,
    shift_end: schedule.shift_end
  });
  setShowEditModal(true);
};

const openDeleteModal = (employee_id, store_id, work_date, employeeName) => {
  setScheduleToDelete({ employee_id, store_id, work_date, employeeName });
  setShowDeleteModal(true);
};

const handleDeleteSchedule = async () => {
  if (!scheduleToDelete) return;

  try {
    const formattedDate = scheduleToDelete.work_date.split('T')[0];
    
    const res = await fetch(
      `${API_URL}/api/manager/schedule/${scheduleToDelete.employee_id}/${scheduleToDelete.store_id}/${formattedDate}`,
      { method: 'DELETE' }
    );

    if (res.ok) {
      addToast(' Schedule deleted successfully', 'success');
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      fetchSchedules();
    } else {
      addToast(' Failed to delete schedule', 'error');
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
    addToast(' Error deleting schedule', 'error');
  }
};

const calculateDuration = (start, end) => {
  if (!start || !end) return 'N/A';
  const startTime = new Date(`2000-01-01 ${start}`);
  const endTime = new Date(`2000-01-01 ${end}`);
  const diff = (endTime - startTime) / (1000 * 60 * 60);
  return `${diff} hours`;
};

  if (loading) {
    return <div className="loading-container">Loading schedules...</div>;
  }

  return (
    <div className="schedules-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Schedules</h1>
          <p className="page-subtitle">View and manage employee work schedules</p>
        </div>
      </div>

      {/* Date Range & Filters */}
      <div className="filters-section">
        <div className="form-group">
          <label>Start Date</label>
          <input 
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input 
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Employee</label>
          <select 
            value={filters.employee_id}
            onChange={(e) => setFilters({...filters, employee_id: e.target.value})}
            className="form-select"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Store</label>
          <select 
            value={filters.store_id}
            onChange={(e) => setFilters({...filters, store_id: e.target.value})}
            className="form-select"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store.store_id} value={store.store_id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={fetchSchedules} style={{ alignSelf: 'flex-end' }}>
          <MdRefresh size={18} />
          Refresh
        </button>
      </div>

      {/* Schedules Table */}
      <div className="table-container">
        {filteredSchedules.length > 0 ? (
          <table className="schedules-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Store</th>
                <th>Date</th>
                <th>Shift Start</th>
                <th>Shift End</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => {
                const duration = schedule.shift_start && schedule.shift_end ? 
                  calculateDuration(schedule.shift_start, schedule.shift_end) : 'N/A';
                
                return (
                  <tr key={`${schedule.employee_id}-${schedule.store_id}-${schedule.work_date}`}>
                    <td>
                      <div className="employee-cell">
                        <MdPerson size={20} />
                        <span>{schedule.first_name} {schedule.last_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="store-cell">
                        <MdStore size={18} />
                        <span>{schedule.store_name}</span>
                      </div>
                    </td>
                    <td>{new Date(schedule.work_date).toLocaleDateString()}</td>
                    <td>{schedule.shift_start}</td>
                    <td>{schedule.shift_end}</td>
                    <td>{duration}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn"
                          onClick={() => openEditModal(schedule)}
                          title="Edit Schedule"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button 
                          className="icon-btn-danger"
                          onClick={() => openDeleteModal(
                            schedule.employee_id,
                            schedule.store_id,
                            schedule.work_date,
                            `${schedule.first_name} ${schedule.last_name}`
                          )}
                          title="Delete Schedule"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <MdSchedule size={64} />
            <p>No schedules found</p>
          </div>
        )}
      </div>

      {/* Edit Schedule Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Schedule</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Employee</label>
                <input 
                  type="text"
                  value={`${editingSchedule?.first_name} ${editingSchedule?.last_name}`}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Store *</label>
                <select 
                  value={scheduleForm.store_id}
                  onChange={(e) => setScheduleForm({...scheduleForm, store_id: e.target.value})}
                  className="form-select"
                >
                  {stores.map(store => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Work Date *</label>
                <input 
                  type="date"
                  value={scheduleForm.work_date}
                  onChange={(e) => setScheduleForm({...scheduleForm, work_date: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Shift Start *</label>
                  <input 
                    type="time"
                    value={scheduleForm.shift_start}
                    onChange={(e) => setScheduleForm({...scheduleForm, shift_start: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Shift End *</label>
                  <input 
                    type="time"
                    value={scheduleForm.shift_end}
                    onChange={(e) => setScheduleForm({...scheduleForm, shift_end: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditSchedule}>
                <MdSave size={18} />
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
       {showDeleteModal && scheduleToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Schedule</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ 
                padding: '20px', 
                background: '#fff3cd', 
                borderRadius: '8px',
                border: '1px solid #ffc107',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <MdWarning size={24} style={{ color: '#856404' }} />
                  <strong style={{ color: '#856404' }}>Are you sure?</strong>
                </div>
                <p style={{ margin: 0, color: '#856404' }}>
                  This will delete the schedule for <strong>{scheduleToDelete.employeeName}</strong> on{' '}
                  <strong>{new Date(scheduleToDelete.work_date).toLocaleDateString()}</strong>.
                </p>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDeleteSchedule}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none'
                }}
              >
                <MdDeleteOutline size={18} />
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
const calculateDuration = (start, end) => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  let hours = endHour - startHour;
  let minutes = endMin - startMin;
  
  if (minutes < 0) {
    hours--;
    minutes += 60;
  }
  
  return `${hours}h ${minutes}m`;
};
//ORDERS
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    store_id: 'all',
    status: 'all',
    payment_method: 'all'
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/stores/all`);
      const data = await res.json();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}/api/manager/orders/all?${params}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (orderDetails[orderId]) return;
    
    try {
      const res = await fetch(`${API_URL}/api/manager/orders/${orderId}/details`);
      const data = await res.json();
      setOrderDetails(prev => ({...prev, [orderId]: data}));
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return <div className="loading-container">Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Orders</h1>
          <p className="page-subtitle">View and analyze all store orders</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <MdFilterList size={18} />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#4B5945' }}>
            <MdReceipt size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#66785F' }}>
            <MdAttachMoney size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#91AC8F' }}>
            <MdShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Order Value</span>
            <span className="stat-value">${avgOrderValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Store</label>
            <select 
              value={filters.store_id}
              onChange={(e) => setFilters({...filters, store_id: e.target.value})}
              className="form-select"
            >
              <option value="all">All Stores</option>
              {stores.map(store => (
                <option key={store.store_id} value={store.store_id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select 
              value={filters.payment_method}
              onChange={(e) => setFilters({...filters, payment_method: e.target.value})}
              className="form-select"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="table-container">
        {orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Store</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.store_order_id}>
                  <tr>
                    <td>#{order.store_order_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>
                      <div className="store-cell">
                        <strong>{order.store_name}</strong>
                        <span className="store-type-badge">{order.store_type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <strong>{order.first_name} {order.last_name}</strong>
                        <span className="customer-email">{order.email}</span>
                      </div>
                    </td>
                    <td>{order.total_quantity} items</td>
                    <td className="amount">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className="payment-badge">
                        {order.payment_method === 'credit_card' ? 'Card' : 'Cash'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="icon-btn"
                        onClick={() => toggleOrderExpand(order.store_order_id)}
                      >
                        {expandedOrder === order.store_order_id ? 
                          <MdExpandLess size={20} /> : <MdExpandMore size={20} />
                        }
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.store_order_id && orderDetails[order.store_order_id] && (
                    <tr className="expanded-row">
                      <td colSpan="9">
                        <div className="order-details">
                          <h4>Order Items</h4>
                          <table className="details-table">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Price/Item</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails[order.store_order_id].map((detail) => (
                                <tr key={detail.item_id}>
                                  <td>
                                    <div className="item-cell">
                                      {detail.image_url && (
                                        <img src={detail.image_url} alt={detail.item_name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                      )}
                                      <span>{detail.item_name}</span>
                                    </div>
                                  </td>
                                  <td>{detail.item_type}</td>
                                  <td>{detail.quantity}</td>
                                  <td>${parseFloat(detail.price_per_item).toFixed(2)}</td>
                                  <td className="amount">${parseFloat(detail.subtotal).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <MdReceipt size={64} />
            <p>No orders found for selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
//MAIN
const ManagerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [managerInfo, setManagerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employeeData = localStorage.getItem('employee_info');
    
    if (!employeeData) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(employeeData);
      setManagerInfo(parsed);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing employee data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('employee_info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Manager Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="manager-page">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        managerInfo={managerInfo}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === "overview" && (
          <OverviewTab managerInfo={managerInfo} />
        )}
        {activeTab === "employees" && (
          <EmployeesTab />
        )}
        {activeTab === "inventory" && (
          <InventoryTab />
        )}
        {activeTab === "schedules" && (
          <SchedulesTab />
        )}
        {activeTab === "orders" && (
          <OrdersTab />
        )}
      </main>
    </div>
  );
};

export default ManagerPage;