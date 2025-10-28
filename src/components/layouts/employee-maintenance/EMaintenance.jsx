import React, { useState, useEffect } from "react";
import "./EMaintenance.css";
import { api, SERVER_URL } from "../../../services/api";

export default function EMaintenance() {
const [maintenanceData, setMaintenanceData] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [editId, setEditId] = useState(null);
const [editFormData, setEditFormData] = useState({});
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [searchField, setSearchField] = useState("description");

// Rain Out Management State
const [rainOuts, setRainOuts] = useState([]);
const [showAddModal, setShowAddModal] = useState(false);
const [newRainOut, setNewRainOut] = useState({
  rain_out_date: '',
  note: ''
});

const rowsPerPage = 6;

// Remove sidebar-related state
const handleLogout = () => alert("Logging out!");

// ✅ Fetch maintenance tasks
useEffect(() => {
// Test direct API call
fetch('http://localhost:3001/maintenances')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(result => {
    console.log('Raw API response:', result);
    const data = result.data || result;
    console.log('Extracted data:', data);
    console.log('Data type:', typeof data);
    console.log('Data length:', data?.length);
    if (Array.isArray(data)) {
      setMaintenanceData(data);
      setFilteredData(data);
    } else {
      console.error('Data is not an array:', data);
      setMaintenanceData([]);
      setFilteredData([]);
    }
  })
  .catch((err) => {
    console.error("Error fetching maintenance:", err);
    setMaintenanceData([]);
    setFilteredData([]);
  });
}, []);

  // Remove ride fetching for sidebar

  // ✅ Fetch rain outs
  useEffect(() => {
    api.getAllRainOuts()
      .then((data) => setRainOuts(data))
      .catch((err) => console.error("Error fetching rain outs:", err));
  }, []);

// ✅ Filter data by search
useEffect(() => {
const filtered = maintenanceData.filter((item) =>
item[searchField]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
);
setFilteredData(filtered);
setCurrentPage(1);
}, [searchQuery, searchField, maintenanceData]);

const handleEditClick = (task) => {
setEditId(task.maintenance_id);
setEditFormData({
  maintenance_id: task.maintenance_id,
  ride_id: task.ride_id,
  description: task.description,
  scheduled_date: new Date(task.scheduled_date).toISOString().split('T')[0],
  status: task.status
});
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
    setEditFormData({});
  };

  // ✅ Fetch rain outs
  const fetchRainOuts = async () => {
    try {
      const data = await api.getAllRainOuts();
      setRainOuts(data);
    } catch (err) {
      console.error('Error fetching rain outs:', err);
    }
  };

  // ✅ Create new rain out (will close all rides automatically via trigger)
  const handleCreateRainOut = async (e) => {
    e.preventDefault();
    try {
      await api.createRainOut(newRainOut);
      alert('Rain out activated! All rides have been closed.');
      setShowAddModal(false);
      setNewRainOut({ rain_out_date: '', note: '' });
      fetchRainOuts();
    } catch (err) {
      console.error('Error creating rain out:', err);
      alert(err.message || 'Failed to create rain out');
    }
  };

  // ✅ Clear rain out (will open all rides automatically via trigger)
  const handleClearRainOut = async (id) => {
    if (!confirm('Clear this rain out? All closed rides will be reopened.')) return;

    try {
      await api.updateRainOut(id, { status: 'cleared' });
      alert('Rain out cleared! All rides have been reopened.');
      fetchRainOuts();
    } catch (err) {
      console.error('Error clearing rain out:', err);
      alert('Failed to clear rain out');
    }
  };

  return (
    <div style={{padding: '40px', backgroundColor: '#cdd6b9', minHeight: '100vh'}}>
      {/* === Main Content === */}
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        {/* Rain Out Management Section */}
        <div className="card" style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <div>
              <h2 style={{color: '#3e4b2b', marginBottom: '5px'}}>☔ Rain Out Management</h2>
              <p style={{color: '#666', fontSize: '14px'}}>Control park operations during bad weather</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              ☔ Activate Rain Out
            </button>
          </div>

          {/* Rain Out Records */}
          <div>
            <h3 style={{color: '#3e4b2b', marginBottom: '15px'}}>Rain Out History</h3>

            {rainOuts.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                <p style={{fontSize: '16px'}}>No rain outs recorded. Park is operating normally! ☀️</p>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '15px'}}>
                {rainOuts.map((rainOut) => (
                  <div
                    key={rainOut.rain_out_id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: rainOut.status === 'active' ? '#dc3545' : '#28a745',
                      backgroundColor: rainOut.status === 'active' ? '#ffe6e6' : '#e8f5e8'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                          <span style={{fontSize: '24px'}}>
                            {rainOut.status === 'active' ? '☔' : '☀️'}
                          </span>
                          <div>
                            <h4 style={{margin: '0', color: '#333', fontSize: '18px', fontWeight: 'bold'}}>
                              {new Date(rainOut.rain_out_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h4>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                color: 'white',
                                backgroundColor: rainOut.status === 'active' ? '#dc3545' : '#28a745'
                              }}
                            >
                              {rainOut.status === 'active' ? '🔴 ACTIVE - Rides Closed' : '✅ Cleared - Rides Open'}
                            </span>
                          </div>
                        </div>

                        {rainOut.note && (
                          <p style={{margin: '8px 0', color: '#555', marginLeft: '34px'}}>
                            <strong>Note:</strong> {rainOut.note}
                          </p>
                        )}

                        {rainOut.resolved_at && (
                          <p style={{margin: '4px 0', fontSize: '12px', color: '#777', marginLeft: '34px'}}>
                            Cleared at: {new Date(rainOut.resolved_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {rainOut.status === 'active' && (
                        <button
                          onClick={() => handleClearRainOut(rainOut.rain_out_id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          ☀️ Clear Rain Out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Tasks Section */}
        <div className="card">
          <h2>Maintenance Tasks</h2>

          {/* Search Bar */}
          <div className="search-bar">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="description">Description</option>
              <option value="ride_id">Ride ID</option>
              <option value="status">Status</option>
              <option value="ride_name">Ride Name</option>
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
                  <th>Ride Name</th>
                  <th>Ride ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Assigned Employees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((task) => (
                  <tr key={task.maintenance_id}>
                    <td>{task.maintenance_id}</td>
                    <td>{task.ride_name || 'Unknown Ride'}</td>
                    <td>
                      {editId === task.maintenance_id ? (
                        <input
                          type="number"
                          name="ride_id"
                          value={editFormData.ride_id}
                          onChange={handleFormChange}
                        />
                      ) : (
                        task.ride_id
                      )}
                    </td>
                    <td>
                      {editId === task.maintenance_id ? (
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
                      {editId === task.maintenance_id ? (
                        <input
                          type="date"
                          name="scheduled_date"
                          value={editFormData.scheduled_date}
                          onChange={handleFormChange}
                        />
                      ) : (
                        new Date(task.scheduled_date).toISOString().split('T')[0]
                      )}
                    </td>
                    <td>
                      {task.assigned_employees || 'No employees assigned'}
                    </td>
                    <td>
                      {editId === task.maintenance_id ? (
                        <select
                          name="status"
                          value={editFormData.status}
                          onChange={handleFormChange}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in process">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      ) : (
                        task.status
                      )}
                    </td>
                    <td>
                      {editId === task.maintenance_id ? (
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

        {/* Add Rain Out Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              margin: '0 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '24px'}}>☔ Activate Rain Out</h2>

              <form onSubmit={handleCreateRainOut}>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px'}}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newRainOut.rain_out_date}
                    onChange={(e) => setNewRainOut({ ...newRainOut, rain_out_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px'}}>
                    Note (optional)
                  </label>
                  <textarea
                    value={newRainOut.note}
                    onChange={(e) => setNewRainOut({ ...newRainOut, note: e.target.value })}
                    placeholder="Heavy rain expected..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    rows="3"
                  />
                </div>

                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{fontSize: '14px', color: '#856404', fontWeight: 'bold', margin: 0}}>
                    ⚠️ Warning: This will automatically close ALL rides in the park!
                  </p>
                </div>

                <div style={{display: 'flex', gap: '12px'}}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Activate Rain Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}