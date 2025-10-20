import {  useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Input from '../ui/Input';
import ButtonSignUp from '../ui/button/ButtonSignUp';
import { Zoom } from '@mui/material';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './Login.css';
function Login({setAdmin}){
    const [isE,setIsE] = useState(false);
    const [validated, setValidated] = useState(false);
    
    const handleSubmit = (event) => {
        const form = event.currentTarget;
            if (form.checkValidity() === false) {
            event.stopPropagation();
            }else{
                if(isE) {setAdmin(true)}
                else{
                    alert("Non-employee login not implemented yet");
                }
            }
            setValidated(true);
    };

  
    return(
    <div className='bg-[#EEF5FF] rounded-2xl p-8 shadow-md mx-auto mt-10'>
        <h1>Welcome to our Theme Park</h1>
        <p>Log In or <Link to="/signup">Create an account</Link></p>
        <Form  noValidate validated={validated} onSubmit={handleSubmit}>
            <div className='divChild'>
                <Input size="7" type="text" label="Email" feedback="Please provide a valid email." />
            </div>

            <div className='divChild'>
                <Input size="7" type="password" label="Password" feedback="Password is required." />
            </div>

            <label className="flex items-center gap-2">
                <input type="checkbox"  className="accent-[#176B87]"  checked={isE}
                    onChange={(e) => setIsE(e.target.checked)} /> Log in as employee
            </label>        

             <Zoom in={isE}>
                <div className='divChild'>
                    <Input size="4" type="text" label="Employee ID" feedback="Employee ID is required."/>
                </div>
            </Zoom> 
            <div className='divChild'> <ButtonSignUp text="Log In"/></div>
           
        </Form>
    </div>
    )
}
export default Login;