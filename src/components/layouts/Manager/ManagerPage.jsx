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
  MdFilterList
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
      console.log('Starting dashboard fetch...');
      
      // Fetch all employees
      const employeesRes = await fetch(`${API_URL}/api/manager/employees/all`);
      const employeesData = await employeesRes.json();
      console.log('All employees:', employeesData);
      
      // Filter employees who have at least one shift
      const scheduled = employeesData.filter(emp => emp.total_shifts > 0);
      console.log('Scheduled employees:', scheduled);
      setScheduledEmployees(scheduled);

      // Get active stores count
      const storesRes = await fetch(`${API_URL}/api/manager/stores/all`);
      const allStores = await storesRes.json();
      console.log('All stores:', allStores);
      const activeStoresCount = allStores.filter(s => s.status === 'open').length;
      console.log('Active stores count:', activeStoresCount);

      // Fetch low stock
      const [giftStats, foodStats] = await Promise.all([
        fetch(`${API_URL}/api/manager/dashboard-stats/giftshop`).then(r => r.json()),
        fetch(`${API_URL}/api/manager/dashboard-stats/foodanddrinks`).then(r => r.json())
      ]);

      const combinedStats = {
        active_employees: scheduled.length,
        active_stores: activeStoresCount,
        low_stock_count: (giftStats.low_stock_count || 0) + (foodStats.low_stock_count || 0)
      };
      
      console.log('Combined stats:', combinedStats);
      setStats(combinedStats);

      // Fetch top items 
      const [giftItems, foodItems] = await Promise.all([
        fetch(`${API_URL}/api/manager/top-items/giftshop?limit=3`).then(r => r.json()),
        fetch(`${API_URL}/api/manager/top-items/foodanddrinks?limit=3`).then(r => r.json())
      ]);
      
      console.log('Gift items:', giftItems);
      console.log('Food items:', foodItems);
      
      setTopItems([...giftItems, ...foodItems].slice(0, 5));

      // Fetch store sale
      const salesRes = await fetch(`${API_URL}/api/manager/sales-by-store`);
      const salesData = await salesRes.json();
      console.log('Store sales:', salesData);
      setStoreSales(salesData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
        {/* Scheduled Employees - Expandable */}
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
      const res = await fetch(`${API_URL}/api/manager/employees/all`);
      const data = await res.json();
      console.log('Fetched employees:', data);
      setEmployees(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      addToast('Failed to load employees', 'error');
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/stores/all`);
      const data = await res.json();
      console.log('Fetched stores:', data);
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      addToast('Failed to load stores', 'error');
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

  const handleRemovalRequest = async (employee) => {
    const reason = prompt(`Request removal of ${employee.first_name} ${employee.last_name}?\n\nPlease provide a reason:`);
    
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/manager/request-employee-removal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          reason: reason.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Removal request sent to admin successfully!', 'success');
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
                onClick={() => handleRemovalRequest(employee)}
                title="Request removal from admin"
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
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] = useState(null);
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

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
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

  const handleUpdateStock = async (storeId, itemId, newQuantity, currentQuantity) => {
    if (newQuantity < currentQuantity) {
      addToast(`Cannot reduce stock below current quantity (${currentQuantity})`, 'warning');
      setEditingItem(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/manager/inventory/${storeId}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newQuantity })
      });

      if (res.ok) {
        addToast('Stock updated successfully', 'success');
        fetchInventory();
        setEditingItem(null);
      } else {
        addToast('Failed to update stock', 'error');
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      addToast('Error updating stock', 'error');
    }
  };

  const handleDeleteItem = async (storeId, itemId) => {
    try {
      const res = await fetch(`${API_URL}/api/manager/inventory/${storeId}/${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addToast('Item removed successfully', 'success');
        fetchInventory();
      } else {
        addToast('Failed to remove item', 'error');
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      addToast('Error removing item', 'error');
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
        
        const uploadRes = await fetch(`${API_URL}/upload/merchandise`, {
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

      addToast('Item added successfully!', 'success');
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
      addToast('Error adding item', 'error');
    }
  };

  const handleAssignMoreStores = async () => {
    if (newItem.store_assignments.length === 0) {
      addToast('Please select at least one store', 'warning');
      return;
    }

    try {
      const promises = newItem.store_assignments.map(assignment =>
        fetch(`${API_URL}/api/manager/inventory/${assignment.store_id}/${selectedItemForAssign.item_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_quantity: assignment.stock_quantity })
        })
      );

      await Promise.all(promises);
      
      addToast('Item assigned to stores successfully!', 'success');
      setShowAssignModal(false);
      setNewItem({ ...newItem, store_assignments: [] });
      fetchInventory();
    } catch (error) {
      console.error("Error assigning item:", error);
      addToast('Error assigning item to stores', 'error');
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
                  {editingItem === `${item.store_id}-${item.item_id}` ? (
                    <input 
                      type="number"
                      defaultValue={item.stock_quantity}
                      className="stock-input"
                      min={item.stock_quantity}
                      onBlur={(e) => handleUpdateStock(item.store_id, item.item_id, parseInt(e.target.value), item.stock_quantity)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateStock(item.store_id, item.item_id, parseInt(e.target.value), item.stock_quantity);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="stock-value"
                      onClick={() => setEditingItem(`${item.store_id}-${item.item_id}`)}
                    >
                      {item.stock_quantity}
                    </span>
                  )}
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
                      onClick={() => setEditingItem(`${item.store_id}-${item.item_id}`)}
                      title="Edit Stock"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button 
                      className="icon-btn-danger"
                      onClick={() => handleDeleteItem(item.store_id, item.item_id)}
                      title="Remove from Store"
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={() => {
                        setSelectedItemForAssign(item);
                        setShowAssignModal(true);
                      }}
                      title="Assign to More Stores"
                    >
                      <MdAdd size={18} />
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

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign "{selectedItemForAssign?.name}" to More Stores</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
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
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAssignMoreStores}>
                <MdSave size={18} />
                Assign to Stores
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
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSchedules();
  }, [dateRange]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/manager/schedules/all?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      const data = await res.json();
      setSchedules(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.work_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading-container">Loading schedules...</div>;
  }

  return (
    <div className="schedules-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule Management</h1>
          <p className="page-subtitle">View and manage employee work schedules</p>
        </div>
      </div>

      <div className="date-range-filter">
        <div className="form-group">
          <label>From</label>
          <input 
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>To</label>
          <input 
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="form-input"
          />
        </div>
      </div>

      <div className="schedules-timeline">
        {Object.keys(groupedSchedules).sort().map((date) => (
          <div key={date} className="schedule-day-card">
  <div className="day-header">
    <h3>
      Employees Scheduled - {' '}
      {new Date(date.includes('T') ? date : date + 'T00:00:00').toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </h3>
    <span className="shift-count">{groupedSchedules[date].length} shifts</span>
  </div>
  
  <div className="shifts-list">
    {groupedSchedules[date].map((schedule, idx) => (
      <div key={idx} className="shift-card">
        <div className="shift-time">
          <MdSchedule size={20} />
          <span>{schedule.shift_start} - {schedule.shift_end}</span>
        </div>
        <div className="shift-details">
          <div className="employee-name">
            <MdPerson size={18} />
            {(schedule.first_name || 'Unknown') + ' ' + (schedule.last_name || 'Employee')}
          </div>
          <div className="store-name">
            <MdStore size={18} />
            {schedule.store_name || 'Unknown Store'}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        ))}
      </div>

      {Object.keys(groupedSchedules).length === 0 && (
        <div className="empty-state">
          <MdSchedule size={64} />
          <p>No schedules found for the selected date range</p>
        </div>
      )}
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
      </main>
    </div>
  );
};

export default ManagerPage;