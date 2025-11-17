import { useState, useEffect } from "react";
import "./EMaintenance.css";
import { api, SERVER_URL } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

export default function EMaintenance() {
const navigate = useNavigate();
const toast = useToast();
const [maintenanceData, setMaintenanceData] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [searchField, setSearchField] = useState("description");
const [employee, setEmployee] = useState(null);
const [showEmployeeInfo, setShowEmployeeInfo] = useState(false);

// Rain Out Management State
const [rainOuts, setRainOuts] = useState([]);
const [showAddModal, setShowAddModal] = useState(false);
const [showAllRainOuts, setShowAllRainOuts] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [rainOutToClear, setRainOutToClear] = useState(null);
const [newRainOut, setNewRainOut] = useState({
  rain_out_date: '',
  note: ''
});

// Notification state
const [notification, setNotification] = useState(null);

const rowsPerPage = 6;

// Load employee from localStorage
useEffect(() => {
  const storedEmployee = localStorage.getItem("employee");
  if (storedEmployee) {
    const parsedEmployee = JSON.parse(storedEmployee);
    setEmployee(parsedEmployee);
  } else {
    // Redirect to login if no employee data
    navigate("/login");
  }
}, [navigate]);

const handleLogout = () => {
  localStorage.removeItem("employee");
  navigate("/login");
};

// ✅ Fetch maintenance tasks for this specific employee
useEffect(() => {
  if (!employee) return;

  fetch(`${SERVER_URL}/api/employee-maintenances/${employee.employee_id}`)
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(result => {
      const data = result.data || result;
      if (Array.isArray(data)) {
        setMaintenanceData(data);
        setFilteredData(data);
      } else {
        setMaintenanceData([]);
        setFilteredData([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching maintenance:", err);
      setMaintenanceData([]);
      setFilteredData([]);
    });
}, [employee]);

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

// Show notification helper
const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 3000);
};

// complete maintenance task
const handleCompleteTask = async (maintenanceId) => {
  try {
    console.log('Updating maintenance ID:', maintenanceId, 'to status: done');

    const updateResponse = await fetch(`${SERVER_URL}/api/maintenance/${maintenanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'done' }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update maintenance status');
    }

    const updateResult = await updateResponse.json();

    // Refresh the maintenance data for this employee
    const response = await fetch(`${SERVER_URL}/api/employee-maintenances/${employee.employee_id}`);
    const result = await response.json();
    const data = result.data || result;
    console.log('Refreshed maintenance data:', data);

    if (Array.isArray(data)) {
      setMaintenanceData(data);
      setFilteredData(data);
    }

    showNotification('✓ Maintenance task marked as completed!', 'success');
  } catch (err) {
    console.error("Failed to complete task:", err);
    showNotification('✗ Failed to complete task', 'error');
  }
};

const totalPages = Math.ceil(filteredData.length / rowsPerPage);
const currentRows = filteredData.slice(
(currentPage - 1) * rowsPerPage,
currentPage * rowsPerPage
);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
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
      // Include the employee ID when creating rain out
      await api.createRainOut({
        ...newRainOut,
        activate_emp: employee.employee_id
      });

      toast({
        title: 'Rain out activated!',
        description: 'All rides have been closed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      setShowAddModal(false);
      setNewRainOut({ rain_out_date: '', note: '' });
      fetchRainOuts();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create rain out',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  // ✅ Clear rain out (will open all rides automatically via trigger)
  const handleClearRainOut = async (id) => {
    setRainOutToClear(id);
    setShowConfirmModal(true);
  };

  const confirmClearRainOut = async () => {
    try {
      // Include the employee ID when clearing rain out
      await api.updateRainOut(rainOutToClear, {
        status: 'cleared',
        clear_emp: employee.employee_id
      });
      toast({
        title: 'Rain out cleared!',
        description: 'All rides have been reopened.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      fetchRainOuts();
    } catch (err) {
      console.error('Error clearing rain out:', err);
      toast({
        title: 'Error',
        description: 'Failed to clear rain out',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setShowConfirmModal(false);
      setRainOutToClear(null);
    }
  };

  return (
    <div style={{backgroundColor: '#cdd6b9', minHeight: '100vh'}}>
      {/* === Navbar === */}
      <nav style={{
        backgroundColor: '#3e4b2b',
        padding: '15px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <h1 style={{color: 'white', margin: 0, fontSize: '24px', fontWeight: 'bold'}}>
            Maintenance Dashboard
          </h1>
          {employee && (
            <span style={{
              color: '#cdd6b9',
              fontSize: '16px',
              marginLeft: '20px'
            }}>
              Welcome, {employee.first_name} {employee.last_name}
            </span>
          )}
        </div>

        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <button
            onClick={() => setShowEmployeeInfo(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#5a6b3d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#6d8047'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#5a6b3d'}
          >My Information
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* === Main Content === */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 40px 40px'}}>
        {/* Rain Out Management Section */}
        <div className="card" >
            <div className="card !flex flex-row !justify-between" >
              <div>
              <h2 style={{color: '#3e4b2b', marginBottom: '5px'}}>☔ Rain Out Management</h2>
              <p style={{color: '#666', fontSize: '16px'}}>Control park operations during bad weather</p>
              </div>
                <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding:  '0px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >☔ Activate Rain Out
              </button>
            </div>
          {/* Maintenance Tasks */}
          <div className="card mb-3">
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
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((task) => (
                  <tr key={task.maintenance_id}>
                    <td>{task.maintenance_id}</td>
                    <td>{task.ride_name || 'Unknown Ride'}</td>
                    <td>{task.ride_id}</td>
                    <td>{task.description}</td>
                    <td>
                      {new Date(task.scheduled_date).toISOString().split('T')[0]}
                    </td>
                    <td>
                      {task.worked_hour !== null && task.worked_hour !== undefined
                        ? `${task.worked_hour} hrs`
                        : 'Not recorded'}
                    </td>
                    <td>{task.status}</td>
                    <td>
                      {task.status === 'done' ? (
                        <span style={{
                          color: '#28a745',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          ✓ Completed
                        </span>
                      ) : (
                        <button
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#5a6b3d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#6d8047'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#5a6b3d'}
                          onClick={() => handleCompleteTask(task.maintenance_id)}
                        >
                          Complete
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

          {/* Rain Out Records */}
          <div>
            <h3 style={{color: '#3e4b2b', marginBottom: '15px'}}>Rain Out History</h3>
            {rainOuts.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                <p style={{fontSize: '16px'}}>No rain outs recorded. Park is operating normally! ☀️</p>
              </div>
            ) : (
              <>
                <div style={{display: 'grid', gap: '15px'}}>
                  {(showAllRainOuts ? rainOuts : rainOuts.slice(0, 3)).map((rainOut) => (
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

                          {/* Display employee information */}
                          <div style={{marginLeft: '34px', marginTop: '8px'}}>
                            {rainOut.activate_emp_first_name && (
                              <p style={{margin: '4px 0', fontSize: '13px', color: '#777'}}>
                                <strong>Activated by:</strong> {rainOut.activate_emp_first_name} {rainOut.activate_emp_last_name}
                              </p>
                            )}
                            {rainOut.status === 'cleared' && rainOut.clear_emp_first_name && (
                              <p style={{margin: '4px 0', fontSize: '13px', color: '#777'}}>
                                <strong>Cleared by:</strong> {rainOut.clear_emp_first_name} {rainOut.clear_emp_last_name}
                                <strong> At:</strong> {new Date(rainOut.resolved_at).toLocaleString()}
                              </p>
                            )}
                          </div>
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

                {/* Show More / Show Less Button */}
                {rainOuts.length > 3 && (
                  <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <button
                      onClick={() => setShowAllRainOuts(!showAllRainOuts)}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: '#5a6b3d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#6d8047'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#5a6b3d'}
                    >
                      {showAllRainOuts ? 'Show Less' : `Show More (${rainOuts.length - 3} more)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        

        {/* Employee Information Modal */}
        {showEmployeeInfo && employee && (
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
              padding: '18px',
              maxWidth: '400px',
              width: '100%',
              margin: '0 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#3e4b2b', marginBottom: '24px'}}>
                Employee Information
              </h2>

              <div>
                <div>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Employee ID
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.employee_id}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Name
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.first_name} {employee.last_name}
                  </p>
                </div>

                <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Job Title
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.job_title}
                  </p>
                </div>

                <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Email
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.email || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Phone
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.phone || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Gender
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.gender || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Hire Date
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not provided'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEmployeeInfo(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3e4b2b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

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
                    type="date"   min={new Date().toISOString().split("T")[0]}
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

        {/* Confirm Clear Rain Out Modal */}
        {showConfirmModal && (
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
              <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '16px'}}>
                Clear Rain Out?
              </h2>
              <p style={{fontSize: '16px', color: '#666', marginBottom: '24px'}}>
                All closed rides will be reopened. Are you sure you want to continue?
              </p>

              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setRainOutToClear(null);
                  }}
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
                  type="button"
                  onClick={confirmClearRainOut}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Clear Rain Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: notification.type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}