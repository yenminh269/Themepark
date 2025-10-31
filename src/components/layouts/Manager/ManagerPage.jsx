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
  MdPerson
} from "react-icons/md";
import "./ManagerPage.css";

const API_URL = "http://localhost:3001";

// SIDEBAR COMPONENT
const Sidebar = ({ activeTab, setActiveTab, activeDepartment, setActiveDepartment, managerInfo, onLogout }) => {
  const tabs = [
    { id: "overview", label: "Dashboard", icon: MdDashboard },
    { id: "employees", label: "Employees", icon: MdPeople },
    { id: "inventory", label: "Inventory", icon: MdInventory },
    { id: "schedules", label: "Schedules", icon: MdSchedule },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <h2 className="sidebar-logo">Velocity Valley</h2>
          <p className="sidebar-subtitle">Manager Portal</p>
        </div>
      </div>

      {/* Department Toggle */}
      <div className="department-toggle">
        <button 
          className={activeDepartment === 'giftshop' ? 'active' : ''}
          onClick={() => setActiveDepartment('giftshop')}
        >
          Gift Shop
        </button>
        <button 
          className={activeDepartment === 'foodanddrinks' ? 'active' : ''}
          onClick={() => setActiveDepartment('foodanddrinks')}
        >
          Food & Drinks
        </button>
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
          
          <button className="logout-button" onClick={onLogout}>
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

// STAT CARD
const StatCard = ({ title, value, icon: Icon, color = "#66785F" }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div className="stat-content">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
      </div>
    </div>
  );
};

// oVERVIEW TAB
const OverviewTab = ({ department, managerInfo }) => {
  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [department]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await fetch(`${API_URL}/api/manager/dashboard-stats/${department}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      const itemsRes = await fetch(`${API_URL}/api/manager/top-items/${department}?limit=5`);
      const itemsData = await itemsRes.json();
      setTopItems(itemsData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  const deptName = department === 'giftshop' ? 'Gift Shop' : 'Food & Beverages';

  return (
    <div className="overview-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview - {deptName}</h1>
          <p className="page-subtitle">Welcome back, {managerInfo?.first_name}!</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Monthly Revenue" 
          value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`}
          icon={MdAttachMoney}
          color="#66785F"
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.total_orders || 0}
          icon={MdShoppingCart}
          color="#91AC8F"
        />
        <StatCard 
          title="Active Employees" 
          value={stats?.active_employees || 0}
          icon={MdPeople}
          color="#B2C9AD"
        />
        <StatCard 
          title="Active Stores" 
          value={stats?.active_stores || 0}
          icon={MdStore}
          color="#4B5945"
        />
      </div>

      {stats?.low_stock_count > 0 && (
        <div className="alert-section warning">
          <MdWarning size={24} />
          <div>
            <h4>Low Stock Alert</h4>
            <p>{stats.low_stock_count} items are running low on stock. Check inventory for details.</p>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Top Selling Items This Month</h2>
        </div>
        
        {topItems.length > 0 ? (
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
            <p>No sales data available for this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

// EMPLOYEES TAB
const EmployeesTab = ({ department }) => {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    store_id: '',
    work_date: new Date().toISOString().split('T')[0],
    worked_hour: 8,
    shift_start: '09:00',
    shift_end: '17:00'
  });

  useEffect(() => {
    fetchEmployees();
    fetchStores();
  }, [department]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/manager/employees/${department}`);
      const data = await res.json();
      setEmployees(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manager/stores/${department}`);
      const data = await res.json();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || !assignmentData.store_id) {
      alert('Please select a store');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/manager/assign-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          ...assignmentData
        })
      });

      if (res.ok) {
        alert('Employee assigned successfully!');
        setShowAssignModal(false);
        fetchEmployees();
      } else {
        alert('Failed to assign employee');
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert('Error assigning employee');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading employees...</div>;
  }

  return (
    <div className="employees-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">Manage your team and assign them to stores</p>
        </div>
      </div>

      <div className="employees-grid">
        {employees.map((employee) => (
          <div key={employee.employee_id} className="employee-card">
            <div className="employee-avatar">
              {employee.first_name[0]}{employee.last_name[0]}
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
            <button 
              className="assign-btn"
              onClick={() => {
                setSelectedEmployee(employee);
                setShowAssignModal(true);
              }}
            >
              <MdSchedule size={18} />
              Assign to Store
            </button>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="empty-state">
          <MdPeople size={64} />
          <p>No employees found</p>
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
                <label>Select Store</label>
                <select 
                  value={assignmentData.store_id}
                  onChange={(e) => setAssignmentData({...assignmentData, store_id: e.target.value})}
                  className="form-select"
                >
                  <option value="">Choose a store...</option>
                  {stores.map(store => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Work Date</label>
                <input 
                  type="date"
                  value={assignmentData.work_date}
                  onChange={(e) => setAssignmentData({...assignmentData, work_date: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Shift Start</label>
                  <input 
                    type="time"
                    value={assignmentData.shift_start}
                    onChange={(e) => setAssignmentData({...assignmentData, shift_start: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Shift End</label>
                  <input 
                    type="time"
                    value={assignmentData.shift_end}
                    onChange={(e) => setAssignmentData({...assignmentData, shift_end: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hours</label>
                <input 
                  type="number"
                  value={assignmentData.worked_hour}
                  onChange={(e) => setAssignmentData({...assignmentData, worked_hour: parseInt(e.target.value)})}
                  className="form-input"
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAssignEmployee}>
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

// INVENTORY TAB
const InventoryTab = ({ department }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [department]);

  useEffect(() => {
    filterInventoryData();
  }, [inventory, searchTerm, filterStatus]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/manager/inventory/${department}`);
      const data = await res.json();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setLoading(false);
    }
  };

  const filterInventoryData = () => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.store_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.stock_status === filterStatus);
    }

    setFilteredInventory(filtered);
  };

  const handleUpdateStock = async (storeId, itemId, newQuantity) => {
    try {
      const res = await fetch(`${API_URL}/api/manager/inventory/${storeId}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newQuantity })
      });

      if (res.ok) {
        fetchInventory();
        setEditingItem(null);
      } else {
        alert('Failed to update stock');
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert('Error updating stock');
    }
  };

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'critical': return '#dc3545';
      case 'low': return '#ffc107';
      default: return '#28a745';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading inventory...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Monitor and update stock levels across all stores</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input 
            type="text"
            placeholder="Search items or stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
                    <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name} />
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-desc">{item.description.substring(0, 40)}...</p>
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
                      min="0"
                      onBlur={(e) => handleUpdateStock(item.store_id, item.item_id, parseInt(e.target.value))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateStock(item.store_id, item.item_id, parseInt(e.target.value));
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
                  <button 
                    className="icon-btn"
                    onClick={() => setEditingItem(`${item.store_id}-${item.item_id}`)}
                    title="Edit Stock"
                  >
                    <MdEdit size={18} />
                  </button>
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
    </div>
  );
};

// SCHEDULES TAB 
const SchedulesTab = ({ department }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSchedules();
  }, [department, dateRange]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/manager/schedules/${department}?start_date=${dateRange.start}&end_date=${dateRange.end}`
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
              <h3>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</h3>
              <span className="shift-count">{groupedSchedules[date].length} shifts</span>
            </div>
            
            <div className="shifts-list">
              {groupedSchedules[date].map((schedule, idx) => (
                <div key={idx} className="shift-card">
                  <div className="shift-time">
                    <MdSchedule size={20} />
                    <span>{schedule.shift_start} - {schedule.shift_end}</span>
                    <span className="hours-badge">{schedule.worked_hour}h</span>
                  </div>
                  <div className="shift-details">
                    <div className="employee-name">
                      <MdPerson size={18} />
                      {schedule.first_name} {schedule.last_name}
                    </div>
                    <div className="store-name">
                      <MdStore size={18} />
                      {schedule.store_name}
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

// MAIN MANAGER PAGE
const ManagerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeDepartment, setActiveDepartment] = useState("giftshop");
  const [managerInfo, setManagerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get manager info from localStorage (set by your login)
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
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/logout');
    }
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
        activeDepartment={activeDepartment}
        setActiveDepartment={setActiveDepartment}
        managerInfo={managerInfo}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        {activeTab === "overview" && (
          <OverviewTab department={activeDepartment} managerInfo={managerInfo} />
        )}
        {activeTab === "employees" && (
          <EmployeesTab department={activeDepartment} />
        )}
        {activeTab === "inventory" && (
          <InventoryTab department={activeDepartment} />
        )}
        {activeTab === "schedules" && (
          <SchedulesTab department={activeDepartment} />
        )}
      </main>
    </div>
  );
};

export default ManagerPage;