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
    <aside className="flex w-72 flex-col border-r border-brand-200/40 bg-white/50 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-brand-200/40 p-6">
        <h2 className="text-2xl font-bold text-brand-800">ThemePark</h2>
        {managerInfo && (
          <p className="mt-1 text-sm text-gray-600">{getDepartmentName()} Manager</p>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-800 text-white shadow-md'
                  : 'text-gray-700 hover:bg-brand-200/50 hover:text-brand-800'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      {managerInfo && (
        <div className="border-t border-brand-200/40 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-800 font-bold text-white">
              {managerInfo.first_name?.[0]}{managerInfo.last_name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-semibold text-brand-800">
                {managerInfo.first_name} {managerInfo.last_name}
              </p>
              <p className="truncate text-sm text-gray-600">{managerInfo.job_title}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;