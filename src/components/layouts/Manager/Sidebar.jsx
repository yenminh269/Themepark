import React from "react";
import "./ManagerPage.css"
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
      icon: MdReceipt,
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
    <aside className="flex w-72 flex-col border-r border-[#DDE5D9] bg-white/70 shadow-md backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-[#DDE5D9] p-8">
        <h2 className="text-2xl font-bold text-[#2F4F4F]">ThemePark</h2>
        {managerInfo && (
          <p className="mt-1 text-sm text-[#384B3A]">{getDepartmentName()} Manager</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-5 py-3 text-base font-medium transition-all ${
                isActive
                  ? "bg-[#8FB996] text-white shadow-md"
                  : "text-[#2F4F4F] hover:bg-[#CFE3D3]/50 hover:text-[#2F4F4F]"
              }`}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      {managerInfo && (
        <div className="border-t border-[#DDE5D9] p-6">
          <div className="flex items-center gap-4 rounded-2xl bg-[#F8FAF8] p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8FB996] font-bold text-white">
              {managerInfo.first_name?.[0]}
              {managerInfo.last_name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-semibold text-[#2F4F4F]">
                {managerInfo.first_name} {managerInfo.last_name}
              </p>
              <p className="truncate text-sm text-[#384B3A]">{managerInfo.job_title}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;