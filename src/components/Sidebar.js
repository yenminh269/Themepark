import React from "react";
import "../styles/Sidebar.css";
import { BarChart3, Package, CreditCard, Users, FileText, Search, PlusCircle } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, managerInfo }) => {
  const isMaintenance = managerInfo?.department === "maintenance";
  
  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={20} /> },
    { id: "staff", label: "Staff", icon: <Users size={20} /> },
    ...(isMaintenance ? [] : [{ id: "inventory", label: "Inventory", icon: <Package size={20} /> }]),
    { 
      id: "transactions", 
      label: isMaintenance ? "Maintenance" : "Transactions", 
      icon: <CreditCard size={20} /> 
    },
    { id: "forms", label: "Data Entry", icon: <PlusCircle size={20} /> },
    { id: "queries", label: "Queries", icon: <Search size={20} /> },
    { id: "reports", label: "Reports", icon: <FileText size={20} /> },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">ThemePark</h2>
        {managerInfo && (
          <p className="sidebar-subtitle">
            {managerInfo.department === "giftshop" ? "Gift Shop" : 
             managerInfo.department === "foodanddrinks" ? "Food & Beverages" : 
             "Maintenance"} Manager
          </p>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {managerInfo && (
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
      )}
    </aside>
  );
};

export default Sidebar;