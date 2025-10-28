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
                email: form.elements.email.value,
                password: form.elements.password.value
            };

            if(isE) {
                // Employee login with database check
                // api.employeeLogin returns the employee data directly (fetchAPI extracts .data)
                const employeeData = await api.employeeLogin(formData);

                // Store employee info in localStorage
                localStorage.setItem('employee', JSON.stringify(employeeData));

                // Set admin state if setAdmin function is provided
                if (setAdmin) {
                    setAdmin(true);
                }

                // Redirect based on job title
                const jobTitle = employeeData.job_title;

                if (jobTitle === 'General Manager' || jobTitle === 'Manager') {
                    alert(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/admin');
                } else if (jobTitle === 'Mechanical Employee') {
                    alert(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/maintenance');
                } else {
                    alert(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/admin');
                }
            } else {
                // Customer login
                const response = await api.customerLogin(formData);

                // api.customerLogin returns { data: customer }
                const customer = response.data;

                // Store customer info in localStorage using the key AuthContext expects
                localStorage.setItem('themepark_user', JSON.stringify(customer));
                // Notify AuthContext (and other listeners) so UI updates immediately
                try {
                    window.dispatchEvent(new CustomEvent('themepark:auth', { detail: customer }));
                } catch {
                    // ignore if running in environments without CustomEvent
                }

                alert(`Welcome back, ${customer.first_name || customer.firstName || 'Customer'}!`);
                // Navigate to customer home page
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
                    <InputLogin size="15" type="text" label="Email" feedback="Please provide a valid email." name="email" />
                </div>

                <div>
                    <InputLogin size="15" type="password" label="Password" feedback="Password is required." name="password" />
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