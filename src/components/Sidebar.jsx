import React from "react";
import { MdDashboard, MdPeople, MdInventory, MdReceipt } from "react-icons/md";

const Sidebar = ({ activeTab, setActiveTab, managerInfo }) => {
  const isMaintenance = managerInfo?.department === "maintenance";
  
  const tabs = [
    { id: "overview", label: "Overview", icon: MdDashboard },
    { id: "staff", label: "Staff", icon: MdPeople },
    ...(isMaintenance ? [] : [{ id: "inventory", label: "Inventory", icon: MdInventory }]),
    { 
      id: "transactions", 
      label: isMaintenance ? "Maintenance" : "Transactions", 
      icon: MdReceipt 
    },
  ];

  const getDepartmentName = () => {
    if (!managerInfo) return "";
    const dept = managerInfo.department;
    if (dept === "giftshop") return "Gift Shop";
    if (dept === "foodanddrinks") return "Food & Beverages";
    if (dept === "maintenance") return "Maintenance";
    return dept;
  };

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">ThemePark</h2>
        {managerInfo && (
          <p className="sidebar-subtitle">{getDepartmentName()} Manager</p>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
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