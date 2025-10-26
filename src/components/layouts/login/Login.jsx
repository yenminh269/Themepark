import {  useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputLogIn from '../../input/InputLogin';
import CustomButton from '../../button/CustomButton';

import './Login.css';
import InputLogin from '../../input/InputLogin';

function Login({setAdmin}){
    const [isE,setIsE] = useState(false);
    const [validated, setValidated] = useState(false);
    
    const handleSubmit = (event) => {
        const form = event.currentTarget;
            if (form.checkValidity() === false) {
                event.preventDefault();
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
    <div className="min-h-screen bg-[#FFFBDE] flex items-center justify-center">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4 items-center bg-[#EEF5FF] rounded-2xl p-4 w-200 shadow-2xl mx-auto '>
                <h1>Welcome to our Theme Park</h1>
               <p>Log In or <Link to="/signup" className='!no-underline'><span className='hover:outline-dashed font-bold'>Create an account</span></Link></p>
                <div>
                    <InputLogin size="15" type="text" label="Email" feedback="Please provide a valid email." />
                </div>

                <div>
                    <InputLogin size="15" type="password" label="Password" feedback="Password is required." />
                </div>
                <div>
                    <input type="checkbox" className="accent-[#176B87]"  checked={isE}
                        onChange={(e) => setIsE(e.target.checked)}/>Log in as employee
                </div>
                <div> <CustomButton text="Log In"/></div>
            </div>
        </Form>
    </div>
    )
}
export default Login;