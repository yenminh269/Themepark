// src/components/layouts/manager/ManagerPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardCard from "./DashboardCard";
import EditableTable from "./EditableTable";
import TransactionTable from "./TransactionTable";
import "./ManagerPage.css";

const ManagerPage = () => {
  const navigate = useNavigate();
  
  // Hardcoded manager info - NO BACKEND NEEDED
  const [managerInfo] = useState({
    first_name: "Sarah",
    last_name: "Johnson",
    job_title: "Manager",
    department: "giftshop",
    email: "sarah.johnson@themepark.com"
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hardcoded dashboard data
  const [dashboardData] = useState({
    staff: [],
    inventory: [
      { item_id: 1, item_name: "Theme Park T-Shirt", store_name: "Main Gift Shop", quantity: 45, price: 24.99, type: "Apparel" },
      { item_id: 2, item_name: "Plush Mascot", store_name: "Main Gift Shop", quantity: 15, price: 34.99, type: "Toys" },
      { item_id: 3, item_name: "Water Bottle", store_name: "West Gift Shop", quantity: 78, price: 12.99, type: "Accessories" },
      { item_id: 4, item_name: "Keychain Set", store_name: "Main Gift Shop", quantity: 5, price: 8.99, type: "Accessories" },
      { item_id: 5, item_name: "Baseball Cap", store_name: "East Gift Shop", quantity: 32, price: 22.00, type: "Apparel" },
      { item_id: 6, item_name: "Souvenir Mug", store_name: "Main Gift Shop", quantity: 67, price: 15.99, type: "Drinkware" },
    ],
    sales: { today: 2847.50, week: 18290.75, month: 74382.20 }
  });
  
  const [staffDetails] = useState([
    { employee_id: 1, first_name: "Emily", last_name: "Chen", job_title: "Sales Associate", stores_assigned: 2, store_names: "Main Gift Shop, West Gift Shop" },
    { employee_id: 2, first_name: "Michael", last_name: "Brown", job_title: "Cashier", stores_assigned: 1, store_names: "Main Gift Shop" },
    { employee_id: 3, first_name: "Jessica", last_name: "Davis", job_title: "Stock Clerk", stores_assigned: 3, store_names: "Main Gift Shop, West Gift Shop, East Gift Shop" },
    { employee_id: 4, first_name: "David", last_name: "Wilson", job_title: "Sales Associate", stores_assigned: 1, store_names: "East Gift Shop" },
    { employee_id: 5, first_name: "Amanda", last_name: "Taylor", job_title: "Supervisor", stores_assigned: 2, store_names: "Main Gift Shop, West Gift Shop" },
    { employee_id: 6, first_name: "Ryan", last_name: "Martinez", job_title: "Cashier", stores_assigned: 1, store_names: "West Gift Shop" },
    { employee_id: 7, first_name: "Sophie", last_name: "Anderson", job_title: "Sales Associate", stores_assigned: 2, store_names: "East Gift Shop, Main Gift Shop" },
  ]);
  
  const [recentTransactions] = useState([
    { store_order_id: 1001, order_date: "2025-10-22", store_name: "Main Gift Shop", total_amount: 89.97, item_count: 3 },
    { store_order_id: 1002, order_date: "2025-10-22", store_name: "West Gift Shop", total_amount: 124.50, item_count: 5 },
    { store_order_id: 1003, order_date: "2025-10-23", store_name: "Main Gift Shop", total_amount: 45.98, item_count: 2 },
    { store_order_id: 1004, order_date: "2025-10-23", store_name: "East Gift Shop", total_amount: 67.95, item_count: 4 },
    { store_order_id: 1005, order_date: "2025-10-23", store_name: "Main Gift Shop", total_amount: 156.89, item_count: 7 },
    { store_order_id: 1006, order_date: "2025-10-23", store_name: "West Gift Shop", total_amount: 78.45, item_count: 3 },
  ]);
  
  const [lowStock] = useState([
    { name: "Keychain Set", store_name: "Main Gift Shop", quantity: 5 },
    { name: "Plush Mascot", store_name: "Main Gift Shop", quantity: 15 },
  ]);
  
  const [topItems] = useState([
    { name: "Theme Park T-Shirt", total_sold: 342, revenue: 8544.58 },
    { name: "Plush Mascot", total_sold: 189, revenue: 6608.11 },
    { name: "Water Bottle", total_sold: 267, revenue: 3468.33 },
    { name: "Baseball Cap", total_sold: 156, revenue: 3432.00 },
    { name: "Keychain Set", total_sold: 423, revenue: 3802.77 },
  ]);
  
  const [loading] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportType, setReportType] = useState("");

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