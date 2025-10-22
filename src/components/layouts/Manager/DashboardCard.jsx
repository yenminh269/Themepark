// src/components/layouts/manager/DashboardCard.jsx
import React from "react";

const DashboardCard = ({ title, value, badge, alert }) => (
  <div className={`dashboard-card glass ${alert ? 'alert-card' : ''}`}>
    {badge && <span className="card-badge">{badge}</span>}
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default DashboardCard;