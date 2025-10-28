import Input from "../../input/Input"; 
import { CheckIcon } from "@chakra-ui/icons";
import Form from 'react-bootstrap/Form';
import CustomButton from "../../button/CustomButton";
import { FormControl, FormLabel, IconButton } from '@chakra-ui/react';
import Select from 'react-select';
import ItemAdded from "../../card/ItemAdded";
import Loading from "./loading/loading";
import ImageInputToggle from "../../input/imgInput";
import './Add.css';
import { useState, useEffect } from "react";
import { api } from '../../../services/api';

function Add({ store = false }) {
  const [isStore, setStore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemAdded, setItemAdded] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  const [photoPath, setPhotoPath] = useState(null);
  const [useLink, setUseLink] = useState(false);
  const [photoLink, setPhotoLink] = useState("");

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' }
  ];

  const storeType = [
    { value: 'food/drink', label: 'Food & Drink' },
    { value: 'merchandise', label: 'Merchandise' }
  ];

  useEffect(() => setStore(store), [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation logic...
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('open_time', openTime);
    formData.append('close_time', closeTime);
    if (isStore) formData.append('type', type);
    else { formData.append('price', price); formData.append('capacity', capacity); }
    if (useLink) formData.append('photo_url', photoLink);
    else formData.append('photo', photoPath);

    try {
      setLoading(true);
      const response = isStore ? await api.addStore(formData) : await api.addRide(formData);
      isStore ? setItemAdded({name, type, description, status, open_time: openTime, close_time: closeTime, photo_path: useLink ? photoLink : response.photo_path}) 
              : setItemAdded({name, price, capacity, description, status, open_time: openTime, close_time: closeTime, photo_path: useLink ? photoLink : response.photo_path});
    } catch (err) {
      console.error(`Failed to submit the new ${isStore ? 'store' : 'ride'}.`);
    } finally { setLoading(false); }
  };

  if (loading) return <Loading isLoading={loading} />;

  if (itemAdded) return (
    <div className="flex flex-col justify-center items-center min-h-screen -mt-5">
      <p className="mb-1 flex items-center gap-2 text-lg font-semibold">
        New {isStore ? 'store' : 'ride'} added successfully! 
        <IconButton icon={<CheckIcon />} size="md" bg="#1aa7eeff" borderRadius="full" isDisabled/>
      </p>
      <ItemAdded {...itemAdded} />
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Form onSubmit={handleSubmit} className="flex flex-col p-3 rounded w-full max-w-2xl" style={{ boxShadow: '-8px -8px 12px rgba(0,0,0,0.25)' }}>
      
        <div className="flex gap-4 flex-wrap">
          <Input required type="text" label="Name" className="custom-input" labelClassName="custom-form-label" value={name} onChange={e => setName(e.target.value)} />
          {!isStore ? (
            <Input required type="currency" label="Price" className="custom-input" labelClassName="custom-form-label" value={price} onChange={e => setPrice(e.target.value)} />
          ) : (
             <Input required type="text" label="Description" className="custom-input" labelClassName="custom-form-label" value={description} onChange={e => setDescription(e.target.value)} />
          )}
        </div>

         {/* Row 4: Open + Close Time */}
        <div className="flex gap-4 flex-wrap">
          <Input required type="time" label="Open Time" className="custom-input" labelClassName="custom-form-label" value={openTime} onChange={e => setOpenTime(e.target.value)} />
          <Input required type="time" label="Close Time" className="custom-input" labelClassName="custom-form-label" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
        </div>

        {/* Row 2: Capacity + Status */}
        <div className="flex gap-4 flex-wrap">
         
          <FormControl className='mb-4 flex-1' isRequired>
            <FormLabel color="#4B5945" fontWeight="500">{isStore ? "Operational Status" : "Ride Status"}</FormLabel>
            <Select options={statusOptions} placeholder={isStore ? "Select operational status" : "Select ride status"} className="custom-react-select" classNamePrefix="react-select" onChange={option => setStatus(option.value)} />
          </FormControl>
           {!isStore && (
            <Input required type="number" label="Capacity" min={1} max={50} className="mt-4 custom-input" labelClassName="custom-form-label" value={capacity} onChange={e => setCapacity(e.target.value)} />
          )}
           {isStore && (<FormControl className='mb-4' isRequired style={{flex:1}}>
              <FormLabel color="#4B5945" fontWeight="500">Store Type</FormLabel>
              <Select options={storeType} placeholder="Select store type" className="custom-react-select" classNamePrefix="react-select" onChange={option => setType(option.value)} />
            </FormControl>
           )}
        </div>
           
       

        {/* Row 5: Photo */}
        <FormLabel color="#4B5945" fontWeight="500">{isStore ? "Store Photo" : "Ride Photo"}</FormLabel>
        <ImageInputToggle useLink={useLink} setUseLink={setUseLink} photoFile={photoPath} setPhotoFile={setPhotoPath} photoLink={photoLink} setPhotoLink={setPhotoLink} />

        <CustomButton text={isStore ? "Add New Store" : "Add New Ride"} className="custom-button" />
      </Form>
    </div>
  );
}

export default Add;
