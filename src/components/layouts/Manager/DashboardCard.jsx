import React from "react";

const DashboardCard = ({ title, value, badge }) => {
  return (
    <div className="w-70 h-20 rounded-3xl bg-white/80 p-8 shadow-md backdrop-blur-md transition hover:shadow-lg hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2F4F4F]">{title}</h3>
        {badge && (
          <span className="rounded-full bg-[#8FB996] px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-6 text-4xl font-bold text-[#8FB996]">{value}</p>
    </div>
  );
};

export default DashboardCard;