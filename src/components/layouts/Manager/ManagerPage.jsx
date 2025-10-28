// src/components/layouts/manager/ManagerPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardCard from "./DashboardCard";
import EditableTable from "./EditableTable";
import TransactionTable from "./TransactionTable";
import "./ManagerPage.css";
import { api } from "../../../services/api";

const ManagerPage = () => {
  const navigate = useNavigate();
  
  // Get manager info from localStorage
  const [managerInfo, setManagerInfo] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    department: "",
    email: ""
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState({
    staff: [],
    inventory: [],
    sales: { today: 0, week: 0, month: 0 }
  });

  const [staffDetails, setStaffDetails] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topItems, setTopItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportType, setReportType] = useState("");

  // Load manager info and department from localStorage
  useEffect(() => {
    const employeeData = localStorage.getItem('employee_info');
    const department = localStorage.getItem('manager_department');

    if (employeeData && department) {
      try {
        const parsedEmployee = JSON.parse(employeeData);
        setManagerInfo({
          first_name: parsedEmployee.first_name,
          last_name: parsedEmployee.last_name,
          job_title: parsedEmployee.job_title,
          department: department,
          email: parsedEmployee.email
        });
      } catch (error) {
        console.error('Error parsing employee data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard data when department is set
  useEffect(() => {
    if (!managerInfo.department) return; // Wait for department to be set

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const result = await api.getManagerDashboard(managerInfo.department);
        setDashboardData({
          staff: result.staff,
          inventory: result.inventory,
          sales: result.sales
        });
        setStaffDetails(result.staff);
        setRecentTransactions(result.transactions);
        setLowStock(result.lowStock);
        setTopItems(result.topItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep some fallback data for development
        setStaffDetails([
          { employee_id: 1, first_name: "Emily", last_name: "Chen", job_title: "Sales Associate", stores_assigned: 2, store_names: "Main Gift Shop, West Gift Shop" },
        ]);
        setRecentTransactions([]);
        setLowStock([]);
        setTopItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [managerInfo.department]);

  const getDepartmentName = () => {
    if (!managerInfo) return "";
    const dept = managerInfo.department;
    if (dept === "giftshop") return "Gift Shop";
    if (dept === "foodanddrinks") return "Food & Beverages";
    if (dept === "maintenance") return "Maintenance";
    return dept;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    alert("Delete functionality - will be connected to backend later");
  };

  const handleGenerateReport = (type) => {
    setReportType(type);
    setShowReportModal(true);
  };

  if (loading) {
    return (
      <div className="manager-layout">
        <div className="loading-container">
          <p>Loading manager information...</p>
        </div>
      </div>
    );
  }

  const isMaintenance = managerInfo.department === "maintenance";

  return (
    <div className="manager-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} managerInfo={managerInfo} />
      
      <main className="manager-content">
        {activeTab === "overview" && (
          <>
            <header className="manager-header">
              <div>
                <h1>{getDepartmentName()} Manager Dashboard</h1>
                <p>Welcome back, {managerInfo.first_name}</p>
              </div>
            </header>

            <section className="overview-section">
              <div className="card-grid">
                <DashboardCard 
                  title="Today's Revenue" 
                  value={formatCurrency(dashboardData.sales.today)} 
                  badge="Today"
                />
                <DashboardCard 
                  title="Weekly Revenue" 
                  value={formatCurrency(dashboardData.sales.week)} 
                  badge="This Week"
                />
                <DashboardCard 
                  title="Monthly Revenue" 
                  value={formatCurrency(dashboardData.sales.month)} 
                  badge="This Month"
                />
                <DashboardCard 
                  title={isMaintenance ? "Active Jobs" : "Low Stock Items"} 
                  value={isMaintenance 
                    ? recentTransactions.filter(t => t.status !== "completed").length 
                    : lowStock.length
                  }
                  alert={!isMaintenance && lowStock.length > 0}
                />
              </div>

              {/* Reports Section */}
              <div className="section-card" style={{ marginBottom: "2rem" }}>
                <h3>Data Reports</h3>
                <p style={{ color: "#66bb6a", marginBottom: "1rem", fontSize: "0.9rem" }}>
                  Generate formatted reports from multiple database tables
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <button 
                    className="report-button"
                    onClick={() => handleGenerateReport("sales")}
                  >
                    Sales Report
                  </button>
                  <button 
                    className="report-button"
                    onClick={() => handleGenerateReport("inventory")}
                  >
                    Inventory Status Report
                  </button>
                  <button 
                    className="report-button"
                    onClick={() => handleGenerateReport("staff")}
                  >
                    Staff Performance Report
                  </button>
                </div>
              </div>

              {/* Top Items / Recent Activity */}
              <div className="two-column-grid">
                {!isMaintenance && topItems.length > 0 && (
                  <div className="section-card">
                    <h3>Top Selling Items</h3>
                    <div className="items-list">
                      {topItems.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <div className="item-info">
                            <span className="item-rank">{idx + 1}</span>
                            <div>
                              <p className="item-name">{item.name}</p>
                              <p className="item-meta">{item.total_sold} units sold</p>
                            </div>
                          </div>
                          <span className="item-value">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="section-card">
                  <h3>Staff Overview</h3>
                  <div className="items-list">
                    {staffDetails.slice(0, 5).map((staff, idx) => (
                      <div key={idx} className="item-row">
                        <div className="item-info">
                          <div className="staff-avatar">
                            {staff.first_name?.[0]}{staff.last_name?.[0]}
                          </div>
                          <div>
                            <p className="item-name">{staff.first_name} {staff.last_name}</p>
                            <p className="item-meta">{staff.job_title}</p>
                          </div>
                        </div>
                        <span className="item-meta">
                          {isMaintenance ? `${staff.active_jobs || 0} jobs` : `${staff.stores_assigned || 0} stores`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {!isMaintenance && lowStock.length > 0 && (
                <div className="alert-section">
                  <h3>Low Stock Alert</h3>
                  <div className="alert-grid">
                    {lowStock.map((item, idx) => (
                      <div key={idx} className="alert-card">
                        <p className="alert-item-name">{item.name}</p>
                        <p className="alert-store">{item.store_name}</p>
                        <p className="alert-quantity">Only {item.quantity} left</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "staff" && (
          <section className="staff-section scrollable">
            <div className="section-header">
              <h2>Staff Management</h2>
              <button className="add-button" onClick={handleAddItem}>
                + Add Staff
              </button>
            </div>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(46, 125, 50, 0.08)" }}>
              <input
                type="text"
                placeholder="Search staff by name or job title..."
                className="search-bar"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
              />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job Title</th>
                  <th>{isMaintenance ? "Active Jobs" : "Assigned Stores"}</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffDetails
                  .filter(staff => 
                    `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                    staff.job_title?.toLowerCase().includes(staffSearchQuery.toLowerCase())
                  )
                  .map((staff, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="staff-cell">
                        <div className="staff-avatar-small">
                          {staff.first_name?.[0]}{staff.last_name?.[0]}
                        </div>
                        {staff.first_name} {staff.last_name}
                      </div>
                    </td>
                    <td>{staff.job_title}</td>
                    <td>
                      <span className="badge">
                        {isMaintenance ? `${staff.active_jobs || 0} jobs` : `${staff.stores_assigned || 0} stores`}
                      </span>
                    </td>
                    <td className="details-cell">{staff.store_names || staff.job_statuses || "N/A"}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditItem(staff)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteItem(staff.employee_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "inventory" && !isMaintenance && (
          <section className="inventory-section scrollable">
            <div className="section-header">
              <h2>Inventory Management</h2>
              <button className="add-button" onClick={handleAddItem}>
                + Add Product
              </button>
            </div>
            <EditableTable 
              data={dashboardData.inventory.map(item => ({
                id: item.item_id,
                name: item.item_name,
                store: item.store_name,
                quantity: item.quantity,
                price: item.price,
                type: item.type
              }))} 
              searchable={true}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          </section>
        )}

        {activeTab === "transactions" && (
          <section className="transactions-section scrollable">
            <div className="section-header mb-8">
              <h2>{isMaintenance ? "Maintenance Jobs" : "Transaction History"}</h2>
              {isMaintenance && (
                <button className="add-button" onClick={handleAddItem}>
                  + New Maintenance Job
                </button>
              )}
            </div>

            {!isMaintenance && (
              <div className="transaction-cards">
                <DashboardCard title="Total Revenue" value={formatCurrency(dashboardData.sales.month)} />
                <DashboardCard 
                  title="Total Transactions" 
                  value={recentTransactions.length} 
                />
                <DashboardCard 
                  title="Average Order" 
                  value={recentTransactions.length > 0 
                    ? formatCurrency(recentTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) / recentTransactions.length)
                    : "$0.00"
                  } 
                />
              </div>
            )}

            <TransactionTable 
              data={recentTransactions.map(trans => ({
                id: trans.store_order_id,
                date: formatDate(trans.order_date),
                customer: trans.store_name,
                total: parseFloat(trans.total_amount || 0),
                status: `${trans.item_count} items`
              }))} 
              searchable={true} 
            />
          </section>
        )}
      </main>

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{showAddModal ? "Add New Item" : "Edit Item"}</h2>
            <p style={{ color: "#66bb6a", marginBottom: "1rem" }}>
              Data entry form will go here - connect to backend later
            </p>
            <button 
              className="add-button"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
            <p style={{ color: "#66bb6a", marginBottom: "1rem" }}>
              Report data from multiple tables will display here
            </p>
            <button 
              className="add-button"
              onClick={() => setShowReportModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPage;