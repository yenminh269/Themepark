import { useState } from "react";
import Input from "../../input/Input";
import Form from "react-bootstrap/Form";
import CustomButton from "../../button/CustomButton";
import { FormControl, FormLabel, ScaleFade } from '@chakra-ui/react';
import Select from 'react-select';
import "./Add.css";
import List from "./List";

function RideMaintenance() {
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ];
  const today = new Date().toISOString().split("T")[0];

  const [selectedRideId, setSelectedRideId] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [description, setDescription] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleRideSelect = (rideId) => {
    setSelectedRideId(rideId);
  };

  const handleEmpSelect = (empId) => {
    setSelectedEmpId(empId);
  };

  const handleAddMaintenance = () => {
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRideId || !selectedEmpId || !description || !maintenanceDate) {
      alert("Please fill out all fields and select both a ride and an employee!");
      return;
    }
    const newMaintenance = {
      ride_id: selectedRideId,
      employee_id: selectedEmpId,
      description,
      date: maintenanceDate,
    };
    console.log("Maintenance Schedule Submitted:", newMaintenance);
    alert("Maintenance schedule created successfully!");
    
    // Reset form and hide it
    setSelectedRideId("");
    setSelectedEmpId("");
    setDescription("");
    setMaintenanceDate("");
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="flex flex-wrap">
      <div className="flex flex-col gap-1 w-full md:w-2/3"> 
        {/* Rides Table */}
        <List schedule={true} ride={true} onRideSelect={handleRideSelect} />
        {/* Employees Table with Add Maintenance Button */}
        <List 
          maintenance="Maintenance Employee" 
          schedule={true} 
          employee={true} 
          onRideSelect={handleEmpSelect}
          onAddMaintenance={handleAddMaintenance}
        />
      </div>

      {/* Maintenance Form with ScaleFade Animation */}
      <div className="flex justify-center items-start w-full md:w-1/3 p-4">
        {showForm && (
          <ScaleFade initialScale={0.8} in={showForm}>
            <div className="w-full">
              <Form
                className="flex flex-col p-3 rounded shadow-lg w-full max-w-md bg-transparent"
                onSubmit={handleSubmit}
              >
                <div className="flex justify-end items-center mb-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                  >
                    X
                  </button>
                </div>
                
                <p className="text-[#4682A9] text-md mb-2">
                  Please click on a ride and an employee in the tables to fill their IDs below.
                </p>
        
                <Input
                  required
                  type="number"
                  label="Ride ID"
                  className="custom-input"
                  labelClassName="custom-form-label"
                  value={selectedRideId}
                  readOnly
                />

                <Input
                  required
                  type="number"
                  label="Employee ID"
                  className="custom-input"
                  labelClassName="custom-form-label"
                  value={selectedEmpId}
                  readOnly
                />

                <Input
                  required
                  type="text"
                  label="Description"
                  className="custom-input"
                  labelClassName="custom-form-label"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                  required
                  type="date"
                  label="Maintenance Date"
                  className="custom-input"
                  labelClassName="custom-form-label"
                  min={today}
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                />

                <CustomButton text="Add Maintenance Schedule" className="custom-button" />
              </Form>
            </div>
          </ScaleFade>
        )}
      </div>
    </div>
  );
}

export default RideMaintenance;