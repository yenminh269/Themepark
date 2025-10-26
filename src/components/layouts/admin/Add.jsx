import Input from "../../input/Input";
import Form from 'react-bootstrap/Form';
import CustomButton from "../../button/CustomButton";
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';
import Ride from "./rides/Ride";
import Loading from "./loading/loading";
import './Add.css'
import { useState, useEffect } from "react";
import { api } from '../../../services/api'

function Add({store=false}){
    const [isStore, setStore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rideAdded, setRideAdded] = useState(null);

    const [name, setName]= useState("");
    const [price, setPrice]= useState("");
    const [capacity, setCapacity]= useState("");
    const [status, setStatus]= useState("");
    const [description, setDescription] = useState("");
    const [openTime, setOpenTime]= useState("");
    const [closeTime, setCloseTime]= useState("");
    const [photoPath, setPhotoPath] = useState(null);

   

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'closed', label: 'Closed' }
    ];
    const storeType = [
        { value: 'food/drink', label: 'Food & Drink'},
        { value: 'merchandise', label: 'Merchandise'}
    ];
    
    useEffect(() => {
        setStore(store);
    }, [store]);

    const handleSubmit = async (e) => {
        e.preventDefault();
          console.log({
        name,
        price,
        status,
        capacity,
        description,
        openTime,
        closeTime,
        photoPath
    });
        if(!name || !price || !status || !capacity || !description || !openTime || !closeTime || !photoPath){
            alert("Please fill out all fields!");
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('capacity', capacity);
        formData.append('description', description);
        formData.append('status', status);
        formData.append('open_time', openTime);
        formData.append('close_time', closeTime);
        formData.append('photo', photoPath); 
        
        try{
            setLoading(true);
            const response = await api.addRide(formData);
            console.log("Ride added:", response);
            setRideAdded({
                name,
                price,
                capacity,
                description,
                status,
                open_time: openTime,
                close_time: closeTime,
                photo_path: response.photo_path
            });
        }catch(err) {
            console.log('Failed to submit the new ride. Please make sure the backend server is running.');
        } finally {
            setLoading(false);
        }

    }
   // Show loading spinner while fetching data
    if (loading) return <Loading isLoading={loading} />;

    if (rideAdded) return (
        <div className="flex justify-center items-center min-h-screen">
            <Ride {...rideAdded} />
            <p>New ride added successfully!✔️</p>
        </div>
    );


    return (
    <div className="flex justify-center items-center min-h-screen">
        <Form onSubmit={handleSubmit} className="flex flex-col p-3 rounded shadow-lg w-full max-w-md">
            <Input required type="text" 
                label="Name" 
                className="custom-input"
                labelClassName="custom-form-label"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />

            {!isStore && (
            <>
            <Input required  type="currency" 
                label="Price" 
                className="custom-input"
                labelClassName="custom-form-label"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <Input required  type="number" 
                label={"Capacity"}
                className="custom-input"
                labelClassName="custom-form-label"
                min={1} max={50}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                />
            <Input required type="text" 
                label="Description" 
                className="custom-input"
                labelClassName="custom-form-label"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
            </>
            )}

            <Input required type="time" 
                label="Open Time" 
                className="custom-input"
                labelClassName="custom-form-label"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                    />

            <Input 
                type="time" 
                label="Close Time" required 
                className="custom-input"
                labelClassName="custom-form-label"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                />

            <FormControl className='mb-4' isRequired>
                <FormLabel color="#4B5945" fontWeight="500">{isStore ? "Store Type" : "Ride Status"}</FormLabel>
                <Select
                    options={isStore ? storeType : statusOptions}
                    placeholder={isStore?"Store type:" : "Select ride status"}
                    className="custom-react-select"
                    classNamePrefix="react-select"
                    onChange={(option) => setStatus(option.value)}

                />
            </FormControl>

            <Input onChange={(e) => {
                console.log("File selected:", e.target.files[0]); // Debug line
        setPhotoPath(e.target.files[0]);
    }}
                type="file" 
                label={isStore ? "Store Photo" :"Ride Photo"}
                required 
                className="custom-input"
                labelClassName="custom-form-label"
                accept="image/png, image/jpeg, image/jpg"
                feedback="Please select an image file (PNG, JPG, JPEG)"
            />
             <CustomButton text={isStore ? "Add New Store" : "Add New Ride"} className="custom-button" />
        </Form>
    </div>
)
}
export default Add;