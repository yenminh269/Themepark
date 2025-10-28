import {  useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import CustomButton from '../../button/CustomButton';

import './Login.css';
import InputLogin from '../../input/InputLogin';
import { api } from '../../../services/api';

function Login({setAdmin}){
    const [isE,setIsE] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        setValidated(true);
        setLoading(true);

        try {
            const formData = {
                email: form.elements[0].value,
                password: form.elements[1].value
            };

            if(isE) {
                // Employee login with database check
                const response = await api.employeeLogin(formData);

                // Store employee info in localStorage
                localStorage.setItem('employee', JSON.stringify(response.data));

                alert(`Welcome back, ${response.data.first_name}!`);
                // Set admin state and navigate to admin dashboard
                setAdmin(true);
            } else {
                // Customer login
                const response = await api.customerLogin(formData);

                // Store customer info in localStorage
                localStorage.setItem('customer', JSON.stringify(response.data));

                alert(`Welcome back, ${response.data.first_name}!`);
                // Navigate to customer dashboard or home page
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
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
                <div> <CustomButton text={loading ? "Logging In..." : "Log In"} disabled={loading}/></div>
            </div>
        </Form>
    </div>
    )
}
export default Login;