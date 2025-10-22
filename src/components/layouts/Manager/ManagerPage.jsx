// src/components/layouts/manager/ManagerPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../login/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardCard from "./DashboardCard";
import EditableTable from "./EditableTable";
import TransactionTable from "./TransactionTable";

const ManagerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const managerEmail = user?.email || "giftshop.manager@themepark.com";
  
  const [managerInfo, setManagerInfo] = useState(null);
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
  const [error, setError] = useState(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportType, setReportType] = useState("");

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchManagerInfo();
  }, []);

  useEffect(() => {
    if (managerInfo && managerInfo.department) {
      fetchAllData();
    }
  }, [managerInfo]);

  const fetchManagerInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/manager-info/${managerEmail}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      setManagerInfo(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching manager info:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!managerInfo) return;
    
    setLoading(true);
    const dept = managerInfo.department;
    
    try {
      const [dashRes, staffRes, transRes, stockRes, topRes] = await Promise.all([
        fetch(`${API_BASE}/manager/${dept}`),
        fetch(`${API_BASE}/manager/${dept}/staff-details`),
        fetch(`${API_BASE}/manager/${dept}/recent-transactions`),
        fetch(`${API_BASE}/manager/${dept}/low-stock`),
        fetch(`${API_BASE}/manager/${dept}/top-items`)
      ]);

      const dashData = await dashRes.json();
      const staffData = await staffRes.json();
      const transData = await transRes.json();
      const stockData = await stockRes.json();
      const topData = await topRes.json();

      setDashboardData(dashData);
      setStaffDetails(staffData);
      setRecentTransactions(transData);
      setLowStock(stockData);
      setTopItems(topData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddItem = () => setShowAddModal(true);
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    alert("Delete functionality - connect to backend API");
    fetchAllData();
  };
  const handleGenerateReport = (type) => {
    setReportType(type);
    setShowReportModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-200">
        <p className="text-lg text-brand-800">Loading manager information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-200">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error Loading Manager Data</h2>
          <p className="mb-2">Error: {error}</p>
          <p className="mb-4 text-sm text-gray-600">Email used: {managerEmail}</p>
          <button 
            onClick={() => navigate("/")}
            className="rounded-lg bg-brand-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!managerInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-200">
        <div className="text-center">
          <p className="mb-4">No manager found with email: {managerEmail}</p>
          <button 
            onClick={() => navigate("/")}
            className="rounded-lg bg-brand-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isMaintenance = managerInfo.department === "maintenance";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-50 to-brand-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} managerInfo={managerInfo} />
      
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "overview" && (
          <>
            <header className="mb-8 rounded-2xl border border-brand-200/40 bg-white/50 p-6 shadow-lg backdrop-blur-md">
              <h1 className="text-3xl font-bold text-brand-800">{getDepartmentName()} Manager Dashboard</h1>
              <p className="mt-1 text-gray-600">Welcome back, {managerInfo.first_name}</p>
            </header>

            <section>
              {/* Metrics Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <div className="mb-8 rounded-2xl border border-brand-200/40 bg-white/50 p-6 shadow-lg backdrop-blur-md">
                <h3 className="mb-2 text-xl font-bold text-brand-800">Data Reports</h3>
                <p className="mb-4 text-sm text-gray-600">Generate formatted reports from multiple database tables</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <button 
                    className="rounded-lg bg-brand-300 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
                    onClick={() => handleGenerateReport("sales")}
                  >
                    Sales Report
                  </button>
                  <button 
                    className="rounded-lg bg-brand-300 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
                    onClick={() => handleGenerateReport("inventory")}
                  >
                    Inventory Status Report
                  </button>
                  <button 
                    className="rounded-lg bg-brand-300 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
                    onClick={() => handleGenerateReport("staff")}
                  >
                    Staff Performance Report
                  </button>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {!isMaintenance && topItems.length > 0 && (
                  <div className="rounded-2xl border border-brand-200/40 bg-white/50 p-6 shadow-lg backdrop-blur-md">
                    <h3 className="mb-4 text-xl font-bold text-brand-800">Top Selling Items</h3>
                    <div className="space-y-3">
                      {topItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-white/60 p-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-brand-800">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.total_sold} units sold</p>
                            </div>
                          </div>
                          <span className="font-bold text-brand-800">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-brand-200/40 bg-white/50 p-6 shadow-lg backdrop-blur-md">
                  <h3 className="mb-4 text-xl font-bold text-brand-800">Staff Overview</h3>
                  <div className="space-y-3">
                    {staffDetails.slice(0, 5).map((staff, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white/60 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 font-bold text-white">
                            {staff.first_name?.[0]}{staff.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-800">{staff.first_name} {staff.last_name}</p>
                            <p className="text-sm text-gray-600">{staff.job_title}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {isMaintenance ? `${staff.active_jobs || 0} jobs` : `${staff.stores_assigned || 0} stores`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {!isMaintenance && lowStock.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 shadow-lg backdrop-blur-md">
                  <h3 className="mb-4 text-xl font-bold text-red-600">⚠️ Low Stock Alert</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lowStock.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-white p-4 shadow">
                        <p className="font-semibold text-brand-800">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.store_name}</p>
                        <p className="mt-2 font-bold text-red-600">Only {item.quantity} left</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "staff" && (
          <section className="rounded-2xl border border-brand-200/40 bg-white/50 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-brand-200/40 p-6">
              <h2 className="text-2xl font-bold text-brand-800">Staff Management</h2>
              <button 
                className="rounded-lg bg-brand-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-800/90"
                onClick={handleAddItem}
              >
                + Add Staff
              </button>
            </div>
            <div className="border-b border-brand-200/40 p-6">
              <input
                type="text"
                placeholder="Search staff by name or job title..."
                className="w-full rounded-lg border border-brand-200 bg-white px-4 py-2 outline-none focus:border-brand-800 focus:ring-2 focus:ring-brand-800/20"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand-200/40 bg-brand-800/5">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-brand-800">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-800">Job Title</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-800">
                      {isMaintenance ? "Active Jobs" : "Assigned Stores"}
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-800">Details</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-200/30">
                  {staffDetails
                    .filter(staff => 
                      `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                      staff.job_title?.toLowerCase().includes(staffSearchQuery.toLowerCase())
                    )
                    .map((staff, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-brand-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 font-bold text-white">
                            {staff.first_name?.[0]}{staff.last_name?.[0]}
                          </div>
                          <span className="font-semibold">{staff.first_name} {staff.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{staff.job_title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-brand-200 px-3 py-1 text-sm font-semibold text-brand-800">
                          {isMaintenance ? `${staff.active_jobs || 0} jobs` : `${staff.stores_assigned || 0} stores`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.store_names || staff.job_statuses || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            className="rounded bg-brand-300 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                            onClick={() => handleEditItem(staff)}
                          >
                            Edit
                          </button>
                          <button 
                            className="rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-600"
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
            </div>
          </section>
        )}

        {activeTab === "inventory" && !isMaintenance && (
          <section className="rounded-2xl border border-brand-200/40 bg-white/50 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-brand-200/40 p-6">
              <h2 className="text-2xl font-bold text-brand-800">Inventory Management</h2>
              <button 
                className="rounded-lg bg-brand-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-800/90"
                onClick={handleAddItem}
              >
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
          <section className="rounded-2xl border border-brand-200/40 bg-white/50 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-brand-200/40 p-6">
              <h2 className="text-2xl font-bold text-brand-800">
                {isMaintenance ? "Maintenance Jobs" : "Transaction History"}
              </h2>
              {isMaintenance && (
                <button 
                  className="rounded-lg bg-brand-800 px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-800/90"
                  onClick={handleAddItem}
                >
                  + New Maintenance Job
                </button>
              )}
            </div>

            {!isMaintenance && (
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
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

            {isMaintenance ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-brand-200/40 bg-brand-800/5">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Job ID</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Ride</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Description</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Start Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">End Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-brand-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-200/30">
                    {recentTransactions.map((job, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-brand-50/50">
                        <td className="px-6 py-4 font-semibold">#{job.maintenance_id}</td>
                        <td className="px-6 py-4">{job.ride_name || "N/A"}</td>
                        <td className="px-6 py-4 max-w-xs truncate text-sm">{job.description}</td>
                        <td className="px-6 py-4">{formatDate(job.start_date)}</td>
                        <td className="px-6 py-4">{job.end_date ? formatDate(job.end_date) : "Ongoing"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            job.status === 'completed' ? 'bg-green-100 text-green-700' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {job.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              className="rounded bg-brand-300 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                              onClick={() => handleEditItem(job)}
                            >
                              Edit
                            </button>
                            <button 
                              className="rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                              onClick={() => handleDeleteItem(job.maintenance_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
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
            )}
          </section>
        )}
      </main>

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-brand-200/40 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-2xl font-bold text-brand-800">
              {showAddModal ? "Add New Item" : "Edit Item"}
            </h2>
            <p className="mb-6 text-gray-600">
              Data entry form will go here - connect to backend API
            </p>
            <button 
              className="w-full rounded-lg bg-brand-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800/90"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="w-full max-w-4xl rounded-2xl border border-brand-200/40 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-2xl font-bold text-brand-800 capitalize">
              {reportType} Report
            </h2>
            <p className="mb-6 text-gray-600">
              Report data from multiple tables will display here
            </p>
            <button 
              className="w-full rounded-lg bg-brand-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800/90"
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