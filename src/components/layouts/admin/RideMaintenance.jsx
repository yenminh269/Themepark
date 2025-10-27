import { useState } from "react";
import Input from "../../input/Input";
import Form from 'react-bootstrap/Form';
import CustomButton from "../../button/CustomButton";
import './Add.css';
import List from "./List";

function RideMaintenance() {
    const today = new Date().toISOString().split('T')[0];

    // State for selected ride
    const [selectedRideId, setSelectedRideId] = useState('');

    // Handler when a ride is selected
    const handleRideSelect = (rideId) => {
        setSelectedRideId(rideId);
    };

    return (
        <div>
            {/* Pass a handler to the List so it can notify which ride was selected */}
            <List 
                schedule={true} 
                ride={true} 
                onRideSelect={handleRideSelect} 
            />

            <div className="flex justify-center items-center min-h-screen">
                <Form className="flex flex-col p-3 rounded shadow-lg w-full max-w-md">
                    
                    <Input
                        required
                        type="number"
                        label="Selected Ride ID"
                        className="custom-input"
                        labelClassName="custom-form-label"
                        value={selectedRideId}
                        readOnly
                    />

                    <Input
                        required
                        type="text"
                        label="Description"
                        className="custom-input"
                        labelClassName="custom-form-label"
                    />

                    <Input
                        required
                        type="date"
                        label="Maintenance Date"
                        className="custom-input"
                        labelClassName="custom-form-label"
                        min={today}
                    />

                    <CustomButton text="Add Ride Schedule" className="custom-button" />
                </Form>
            </div>
        </div>
    );
}

export default RideMaintenance;
