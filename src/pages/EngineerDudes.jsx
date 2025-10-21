import React, { useState } from 'react';
import './EngineerDudes.css'; // import the stylesheet

export default function App() {
  const [maintenanceData, setMaintenanceData] = useState([
    {
      maintenanceId: 1,
      rideId: 101,
      description: 'Check brakes',
      date: '2025-10-20',
      status: 'Pending',
    },
    {
      maintenanceId: 2,
      rideId: 102,
      description: 'Lubricate gears',
      date: '2025-10-18',
      status: 'In Progress',
    },
    {
      maintenanceId: 3,
      rideId: 103,
      description: 'Replace seats',
      date: '2025-10-19',
      status: 'Completed',
    },
  ]);

  const handleLogout = () => {
    alert('Logging out!');
    // Add your logout logic here
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-title">Theme Park</div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </aside>

      <main className="main-content">
        <div className="card">
          <h2>Maintenance Tasks</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Maintenance ID</th>
                  <th>Ride ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData.map((task) => (
                  <tr key={task.maintenanceId}>
                    <td>{task.maintenanceId}</td>
                    <td>{task.rideId}</td>
                    <td>{task.description}</td>
                    <td>{task.date}</td>
                    <td>{task.status}</td>
                    <td>
                      <button className="edit-button">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}