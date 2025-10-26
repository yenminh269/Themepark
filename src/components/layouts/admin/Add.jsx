import Input from "../../input/Input";
import Form from 'react-bootstrap/Form';
import CustomButton from "../../button/CustomButton";
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';
import './Add.css'
import { useState, useEffect } from "react";

function Add({store=false}){
    const [isStore, setStore] = useState(false);
    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' }
    ];
    const storeType = [
        { value: 'food/drink', label: 'Food & Drink'},
        { value: 'merchandise', label: 'Merchandise'}
    ];
    
    useEffect(() => {
        setStore(store);
    }, [store]);

    return (
    <div className="flex justify-center items-center min-h-screen">
        <Form className="flex flex-col p-3 rounded shadow-lg w-full max-w-md">
            <Input required 
                type="text" 
                label="Name" 
                className="custom-input"
                labelClassName="custom-form-label"
                />
            {!isStore && (
            <>
            <Input required 
                type="currency" 
                label="Price" 
                className="custom-input"
                labelClassName="custom-form-label"
            />
            <Input required 
                type="number" 
                label={"Capacity"}
                className="custom-input"
                labelClassName="custom-form-label"
                min={2 } max={50}
                />
            <Input required 
                type="text" 
                label="Description" 
                className="custom-input"
                labelClassName="custom-form-label"
                />
            </>
            )}
            <Input required 
                type="time" 
                label="Open Time" 
                className="custom-input"
                labelClassName="custom-form-label"
                    />
            <Input 
                type="time" 
                label="Close Time" 
                required 
                className="custom-input"
                labelClassName="custom-form-label"
                />
            <FormControl className='mb-4' isRequired>
                <FormLabel color="#4B5945" fontWeight="500">{isStore ? "Store Type" : "Ride Status"}</FormLabel>
                <Select
                    options={isStore ? storeType : statusOptions}
                    placeholder={isStore?"Store type:" : "Select ride status"}
                    className="custom-react-select"
                    classNamePrefix="react-select"
                />
            </FormControl>
            <Input 
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