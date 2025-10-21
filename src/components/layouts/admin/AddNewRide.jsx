import Input from "../../ui/Input";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import ButtonSignUp from "../../ui/button/ButtonSignUp";

function AddNewRide(){
    return (
        <div>
             <Form className="p-3 rounded shadow-sm">
                <Input type="text" label="Name"  required/>
                <Input type="currency" label="Price"  required/>
                <Input type="text" label="Capacity"  required/>
                <FloatingLabel label="Ride Status">
                <Form.Select className='select-hover' required>
                    <option value="">Select ride status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </Form.Select>
                </FloatingLabel>
                <Input type="text" label="Description"  required/>
                <Input type="time" label="Open Time"  required/>
                <Input type="time" label="Close Time"  required/>
                <Input type="time" label="Close Time"  required/>
                <ButtonSignUp text="Add New Ride" />
            </Form>
        </div>
    )
}
export default AddNewRide;