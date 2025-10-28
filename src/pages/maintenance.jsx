import React, { useState, useEffect } from "react";
import "./maintenance.css";
import { api, SERVER_URL } from "../services/api";

export default function Maintenance() {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [rides, setRides] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("description");

  const rowsPerPage = 6;

  // ✅ Fetch maintenance tasks
  useEffect(() => {
    api.getAllMaintenances()
      .then((data) => {
        setMaintenanceData(data);
        setFilteredData(data);
      })
      .catch((err) => console.error("Error fetching maintenance:", err));
  }, []);

  // ✅ Fetch rides list for sidebar
  useEffect(() => {
    api.getAllRides()
      .then((data) => setRides(data))
      .catch((err) => console.error("Error fetching rides:", err));
  }, []);

  // ✅ Filter data by search
  useEffect(() => {
    const filtered = maintenanceData.filter((item) =>
      item[searchField]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, searchField, maintenanceData]);

  const handleLogout = () => alert("Logging out!");

  const handleEditClick = (task) => {
    setEditId(task.maintenanceId);
    setEditFormData({ ...task });
  };

  const handleCancelClick = () => {
    setEditId(null);
    setEditFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save edits to DB
  const handleSaveClick = async () => {
    try {
      await fetch(`${SERVER_URL}/api/maintenance/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const updated = await api.getAllMaintenances();
      setMaintenanceData(updated);
      setEditId(null);
      setEditFormData({});
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    setEditId(null);
  };

  return (
    <div className="app-container">
      {/* === Sidebar === */}
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-header-fixed">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            ☰
          </button>
          {sidebarOpen && <div className="sidebar-title">Theme Park</div>}
        </div>

        {sidebarOpen && (
          <>
            <div className="ride-table">
              <h4>Rides</h4>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride) => (
                    <tr key={ride.id}>
                      <td>{ride.id}</td>
                      <td>{ride.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sidebar-bottom">
              <div className="user-info">Username: RandomUser123</div>
              <button className="logout-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </>
        )}
      </aside>

      {/* === Main Content === */}
      <main className="main-content">
        <div className="card">
          <h2>Maintenance Tasks</h2>

          {/* Search Bar */}
          <div className="search-bar">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="description">Description</option>
              <option value="rideId">Ride ID</option>
              <option value="status">Status</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchField}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
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
                {currentRows.map((task) => (
                  <tr key={task.maintenanceId}>
                    <td>{task.maintenanceId}</td>
                    <td>
                      {editId === task.maintenanceId ? (
                        <input
                          type="number"
                          name="rideId"
                          value={editFormData.rideId}
                          onChange={handleFormChange}
                        />
                      ) : (
                        task.rideId
                      )}
                    </td>
                    <td>
                      {editId === task.maintenanceId ? (
                        <input
                          type="text"
                          name="description"
                          value={editFormData.description}
                          onChange={handleFormChange}
                        />
                      ) : (
                        task.description
                      )}
                    </td>
                    <td>
                      {editId === task.maintenanceId ? (
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleFormChange}
                        />
                      ) : (
                        task.date
                      )}
                    </td>
                    <td>
                      {editId === task.maintenanceId ? (
                        <select
                          name="status"
                          value={editFormData.status}
                          onChange={handleFormChange}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        task.status
                      )}
                    </td>
                    <td>
                      {editId === task.maintenanceId ? (
                        <>
                          <button className="save-button" onClick={handleSaveClick}>
                            Save
                          </button>
                          <button className="cancel-button" onClick={handleCancelClick}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="edit-button"
                          onClick={() => handleEditClick(task)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={currentPage === pageNum ? "active" : ""}
                disabled={currentPage === pageNum}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
