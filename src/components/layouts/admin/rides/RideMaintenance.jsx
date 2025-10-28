import { useState, useEffect } from "react";
import { useToast } from '@chakra-ui/react';
import Input from "../../../input/Input";
import Form from "react-bootstrap/Form";
import CustomButton from "../../../button/CustomButton";
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
    'Ride Id', 'Ride Name', 'Price', 'Capacity', 'Description',
    'Status', 'Open Time', 'Close Time', 'Date Added'
  ];
  const columnRideKeys = [
    'ride_id', 'name', 'price', 'capacity', 'description', 'status',
    'open_time', 'close_time', 'created_at'
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
    'Scheduled Date', 'Status'
  ];
  const maintenanceKeys = [
    'maintenance_id', 'ride_name', 'employee_name', 'description',
    'scheduled_date', 'completion_status'
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
      if ((key === 'open_time' || key === 'close_time') && rideObj[key]) {
        const [hour, minute] = rideObj[key].split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:${minute} ${ampm}`;
      }
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
  const employeeName = `${maintObj.first_name} ${maintObj.last_name}`;
  return maintenanceKeys.map(key => {
    if (key === 'employee_name') return employeeName;
    if (key === 'scheduled_date' && maintObj[key])
      return new Date(maintObj[key]).toLocaleDateString();
    if (key === 'completion_status') {
      return maintObj[key] === 'done' ? '✓ Completed' : 
             maintObj[key] === 'in process' ? '⟳ In Progress' : 
             '📅 Scheduled';
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
  const handleSubmit = async (e) => {
  e.preventDefault();
  
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

  console.log('=== Submitting Maintenance ===');
  console.log('Payload:', newMaintenance);

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
    <div className="flex flex-col gap-4 p-4">

     {/* Header Section */}
<div className="flex justify-between items-center mb-2">
  <h1 className="text-2xl font-bold text-[#4682A9]">Ride Maintenance Management</h1>
  {!showForm && (
    <button
      onClick={handleAddMaintenance}
      className="custom-button px-4 py-2 bg-[#4682A9] text-white rounded hover:bg-[#3a6b8a] transition-colors"
    >
      + Schedule New Maintenance
    </button>
  )}
</div>
      {/* Main Content Layout */}
      <div className="flex flex-wrap gap-4">
        {/* Left Side - Tables */}
        <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
          {/* Maintenance Schedule Table - Now at the top */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-3 text-[#4682A9]">
              Scheduled Maintenance ({maintenanceSchedules.length})
            </h2>
            {maintenanceSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No maintenance schedules yet.</p>
                <p className="text-sm mt-2">Click "Schedule New Maintenance" to add one.</p>
              </div>
            ) : (
              <DataTable
                title=""
                columns={MaintenanceAttr}
                data={formattedMaintenanceData}
              />
            )}
          </div>

          {/* Rides Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-3 text-[#4682A9]">Available Rides</h2>
            <DataTable
              title=""
              columns={RideAttr}
              data={formattedRideData}
              onRowSelect={handleRideSelect}
            />
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-3 text-[#4682A9]">Maintenance Staff</h2>
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
          <div className="w-full md:w-[400px]" id="maintenance-form">
            <ScaleFade initialScale={0.9} in={showForm}>
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#4682A9]">
                    Schedule Maintenance
                  </h2>
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
                    <CustomButton 
                      text="Schedule Maintenance" 
                      className="custom-button flex-1"
                      type="submit"
                    />
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
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