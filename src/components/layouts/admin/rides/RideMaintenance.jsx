import { useState, useEffect } from "react";
import { useToast } from '@chakra-ui/react';
import Input from "../../../input/Input";
import Form from "react-bootstrap/Form";
import { ScaleFade } from '@chakra-ui/react';
import "../Add.css";
import Loading from "../loading/Loading";
import { api } from '../../../../services/api';
import DataTable from '../../../data-table/DataTable';
import '../../../button/CustomButton.css' 
function RideMaintenance() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRideId, setSelectedRideId] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [description, setDescription] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [workedHours, setWorkedHours] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [emp, setEmp] = useState([]);
  const [rides, setRides] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const toast = useToast();

  const RideAttr = [
    'Ride Id', 'Ride Name', 'Capacity', 'Description',
    'Status', 'Date Added'
  ];
  const columnRideKeys = [
    'ride_id', 'name', 'capacity', 'description', 'status', 'created_at'
  ];
  
  const EMAttr = [
    'Emp_Id', 'First Name', 'Last Name', 'Gender', 
    'Email', 'Job Title', 'Phone', 'Hire Date'
  ];
  const columnKeys = [
    'employee_id', 'first_name', 'last_name', 'gender', 
    'email', 'job_title', 'phone', 'hire_date'
  ];

  const MaintenanceAttr = [
    'Maintenance ID', 'Ride Name', 'Employee', 'Description',
    'Scheduled Date', 'Status', 'Actions'
  ];
  const maintenanceKeys = [
    'maintenance_id', 'ride_name', 'employee_name', 'description',
    'scheduled_date', 'status', 'actions'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  setInitialLoading(true); // Changed from setLoading
  try {
    await Promise.all([
      fetchMaintEmp(),
      fetchRide(),
      fetchMaintenanceSchedules()
    ]);
  } catch (err) {
    console.error('Failed to load data:', err);
  } finally {
    setInitialLoading(false); // Changed from setLoading
  }
};

  const fetchMaintEmp = async () => {
    try {
      const data = await api.getMaintEmployees();
      setEmp(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const fetchRide = async () => {
    try {
      const response = await api.getAllRides();
      setRides(response);
    } catch (err) {
      console.error('Failed to load rides:', err);
      alert('Failed to load rides. Please check backend connection.');
    }
  };

  const fetchMaintenanceSchedules = async () => {
    try {
      const response = await api.getAllMaintenances();
      setMaintenanceSchedules(response);
    } catch (err) {
      console.error('Failed to load maintenance schedules:', err);
    }
  };

  const formattedRideData = rides.map(rideObj =>
    columnRideKeys.map(key => {
      if (key === 'created_at' && rideObj[key])
        return new Date(rideObj[key]).toLocaleDateString();
      return rideObj[key] ?? '';
    })
  );

  const formattedEmpData = emp.map(empObj =>
    columnKeys.map(key => {
      if (key === 'hire_date' && empObj[key])
        return new Date(empObj[key]).toLocaleDateString();
      return empObj[key] ?? '';
    })
  );

 const formattedMaintenanceData = maintenanceSchedules.map(maintObj => {
  const employeeName = maintObj.assigned_employees || 'No employees assigned';
  return maintenanceKeys.map(key => {
    if (key === 'employee_name') return employeeName;
    if (key === 'scheduled_date' && maintObj[key])
      return new Date(maintObj[key]).toLocaleDateString();
    if (key === 'status') {
      if (maintObj[key] === 'done') return '✓ Completed';
      if (maintObj[key] === 'cancelled') return '✖ Cancelled';
      return '📅 Scheduled';
    }
    return maintObj[key] ?? '';
  });
});

  const handleRideSelect = (rideId) => {
    setSelectedRideId(rideId);
  };

  const handleEmpSelect = (empId) => {
    setSelectedEmpId(empId);
  };

  const handleAddMaintenance = () => {
    setShowForm(true);
  };

  const handleCancelMaintenance = async (maintenanceId) => {
    try {
      await api.updateMaintenance(maintenanceId, { status: 'cancelled' });
      await fetchMaintenanceSchedules();

      toast({
        title: 'Maintenance Cancelled',
        description: 'The maintenance schedule has been cancelled successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Error cancelling maintenance:', err);
      toast({
        title: 'Failed to Cancel Maintenance',
        description: err.message || 'An error occurred while cancelling the maintenance.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Prevent duplicate submissions
  if (submitting) return;

  if (!selectedRideId || !selectedEmpId || !description || !maintenanceDate || !workedHours) {
    toast({
      title: 'Missing Information',
      description: 'Please fill out all fields and select both a ride and an employee!',
      status: 'warning',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
    return;
  }

  const newMaintenance = {
  ride_id: selectedRideId,
  employee_id: selectedEmpId,
  description,
  date: maintenanceDate,
  hour: workedHours,
};

  try {
    setSubmitting(true);
    const response = await api.scheduleRideMaint(newMaintenance);
    console.log('API Response:', response);
    
    await fetchMaintenanceSchedules();
    
    const selectedRide = rides.find(r => r.ride_id === parseInt(selectedRideId));
    const selectedEmployee = emp.find(e => e.employee_id === parseInt(selectedEmpId));
    
    toast({
      title: 'Maintenance Scheduled Successfully',
      description: `${selectedEmployee?.first_name} ${selectedEmployee?.last_name} assigned to ${selectedRide?.name} on ${new Date(maintenanceDate).toLocaleDateString()}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });

    setShowForm(false);
    setSelectedRideId("");
    setSelectedEmpId("");
    setDescription("");
    setMaintenanceDate("");
    setWorkedHours("");
  } catch (err) {
    console.error('=== Error Details ===');
    console.error('Error object:', err);
    toast({
      title: 'Failed to Schedule Maintenance',
      description: err.response?.data?.message || err.message || 'An error occurred while scheduling maintenance.',
      status: 'error',
      duration: 4000,
      isClosable: true,
      position: 'top',
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRideId("");
    setSelectedEmpId("");
    setDescription("");
    setMaintenanceDate("");
    setWorkedHours("");
  };

  if (initialLoading) { // Changed from loading
  return <Loading />;
}

  return (
    <div className="flex flex-col gap-4">
        {/* Header Section */}
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-2xl font-bold text-[#4682A9]">Ride Maintenance Management</h1>
      {!showForm && (
        <button
          onClick={handleAddMaintenance}
          className="btn-custom text-[#819A91] rounded hover:bg-[#3a6b8a] transition-colors"
        >
          + Schedule New Maintenance
        </button>
      )}
    </div>
      {/* Main Content Layout */}
      <div className="flex flex-wrap gap-4">
        {/* Left Side - Tables */}
        <div className="flex flex-col gap-4 flex-1 min-w-[400px]">
          {/* Maintenance Schedule Table - Now at the top */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-3 text-[#4682A9]">
              Scheduled Maintenance ({maintenanceSchedules.length})
            </h3>
            {maintenanceSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No maintenance schedules yet.</p>
                <p className="text-sm mt-2">Click "Schedule New Maintenance" to add one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      {MaintenanceAttr.map((header, idx) => (
                        <th key={idx} className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceSchedules.map((maintObj, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm">{maintObj.maintenance_id}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{maintObj.ride_name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{maintObj.assigned_employees || 'No employees assigned'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{maintObj.description}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {maintObj.scheduled_date ? new Date(maintObj.scheduled_date).toLocaleDateString() : ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {maintObj.status === 'done' ? '✓ Completed' : maintObj.status === 'cancelled' ? '✖ Cancelled' : '📅 Scheduled'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                          {(maintObj.status !== 'done' && maintObj.status !== 'cancelled') && (
                            <button
                              onClick={() => handleCancelMaintenance(maintObj.maintenance_id)}
                              className="px-3 py-1 !bg-red-600 text-white rounded hover:bg-red-600 transition-colors text-xs"
                            >
                              Cancel
                            </button>
                          )}
                          {(maintObj.status === 'done' || maintObj.status === 'cancelled') && (
                            <span className="text-gray-400 text-xs">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rides Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-[#4682A9]">Available Rides</h3>
            <DataTable
              title=""
              columns={RideAttr}
              data={formattedRideData}
              onRowSelect={handleRideSelect}
            />
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-[#4682A9]">Maintenance Employees</h3>
            <DataTable
              title=""
              columns={EMAttr}
              data={formattedEmpData}
              onRowSelect={handleEmpSelect}
            />
          </div>
        </div>

        {/* Right Side - Form */}
        {showForm && (
          <div className="w-full md:w-[300px]" id="maintenance-form">
            <ScaleFade initialScale={0.9} in={showForm}>
              <div className="rounded-lg p-4 shadow-lg p-6 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded border-l-4 border-[#4682A9]">
                  💡 Click on a ride and an employee in the tables below to select them.
                </p>
        
                <Form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="number"
                    label="Ride ID"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={selectedRideId}
                    placeholder="Click a ride to select"
                    readOnly
                  />

                  <Input
                    type="number"
                    label="Employee ID"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={selectedEmpId}
                    placeholder="Click an employee to select"
                    readOnly
                  />
                  <Input
                    type="text"
                    label="Description"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={description}
                    placeholder="e.g., Regular inspection and repair"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Maintenance Date"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    min={new Date().toISOString().split("T")[0]}
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Estimated Hours"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={workedHours}
                    placeholder="e.g., 2.5"
                    min="0"
                    step="0.5"
                    onChange={(e) => setWorkedHours(e.target.value)}
                  />
                  <div className="flex gap-2 mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-custom flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Scheduling...' : 'Schedule Maintenance'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      disabled={submitting}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </ScaleFade>
          </div>
        )}
      </div>
    </div>
  );
}

export default RideMaintenance;