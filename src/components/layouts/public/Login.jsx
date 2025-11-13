import {  useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import './Login.css';
import InputLogin from '../../input/InputLogin';
import { api } from '../../../services/api';
import carnivalImg from '../../../assets/carnival.jpg';

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

                // Update ride statuses based on today's maintenance
                try {
                    await api.updateRideMaintenanceStatus();
                } catch (error) {
                    console.error('Failed to update ride maintenance status:', error);
                    // Don't block login if this fails
                }

                // Store employee info in localStorage
                localStorage.setItem('employee', JSON.stringify(employeeData));
                localStorage.setItem('employee_info', JSON.stringify(employeeData));

                // Set admin state if setAdmin function is provided
                if (setAdmin) {
                    setAdmin(true);
                }

                // Redirect based on job title
                const jobTitle = employeeData.job_title;

                if (jobTitle === 'General Manager') {
                    toast.success(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/admin');
                } else if (jobTitle === 'Store Manager') {
                    // Set department for Store Manager
                    localStorage.setItem('manager_department', 'giftshop');
                    toast.success(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/manager');
                } else if (jobTitle === 'Mechanical Employee') {
                    toast.success(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/maintenance');
                } else if (jobTitle === 'Sales Employee') {
                    toast.success(`Welcome back, ${employeeData.first_name}!`);
                    navigate('/sales');
                } else {
                    // Unknown job title
                    toast.error('Unknown employee role');
                    navigate('/');
                }
            } else {
                // Customer login
                const response = await api.customerLogin(formData);

                // api.customerLogin returns { data: customer }
                const customer = response.data;

                // Update ride statuses based on today's maintenance
                try {
                    await api.updateRideMaintenanceStatus();
                } catch (error) {
                    console.error('Failed to update ride maintenance status:', error);
                    // Don't block login if this fails
                }

                // Store customer info in localStorage using the key AuthContext expects
                localStorage.setItem('themepark_user', JSON.stringify(customer));
                // Notify AuthContext (and other listeners) so UI updates immediately
                try {
                    window.dispatchEvent(new CustomEvent('themepark:auth', { detail: customer }));
                } catch {
                    // ignore if running in environments without CustomEvent
                }

                toast.success(`Welcome back, ${customer.first_name || customer.firstName || 'Customer'}!`);
                // Navigate to customer home page
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return(
    <div className="!min-h-screen !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !flex !items-center !justify-center !p-6">
        {/* Background Image */}
        <div className="!absolute !inset-0 !opacity-20">
            
        </div>

        <div className="!relative !z-10 !w-full !max-w-6xl !grid md:!grid-cols-2 !gap-8 !items-center">
            {/* Left Side - Image & Info */}
            <div className="!hidden md:!block">
                <div className="!bg-white/90 backdrop-blur-md !rounded-3xl !p-8 !shadow-2xl">
                    <div className="!mb-6">
                        <h1 className="!text-4xl !font-black !text-[#176B87] !mb-4">
                            🎢 Welcome Back!
                        </h1>
                        <p className="!text-gray-700 !text-lg">
                            Log in to access your tickets, view order history, and plan your next adventure at VelocityValley!
                        </p>
                    </div>
                    <img
                        src={carnivalImg}
                        alt="Theme Park"
                        className="!w-full !h-80 !object-cover !rounded-2xl !shadow-lg !border-4 !border-[#749BC2]"
                        />

                    <div className="!mt-6 !grid !grid-cols-3 !gap-4 !text-center">
                        <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                            <div className="!text-2xl !font-black !text-[#176B87]">50+</div>
                            <div className="!text-sm !text-gray-600">Rides</div>
                        </div>
                        <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                            <div className="!text-2xl !font-black !text-[#176B87]">1M+</div>
                            <div className="!text-sm !text-gray-600">Visitors</div>
                        </div>
                        <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                            <div className="!text-2xl !font-black !text-[#176B87]">⭐ 4.9</div>
                            <div className="!text-sm !text-gray-600">Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="!bg-white/95 backdrop-blur-md !rounded-3xl !shadow-2xl !p-8 md:!p-12">
                <div className="!mb-8 md:!hidden">
                    <h1 className="!text-3xl !font-black !text-[#176B87]">🎢 Welcome Back!</h1>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <div className='!flex !flex-col !gap-6'>
                        <div className="!text-center md:!text-left">
                            <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-2">Log In</h2>
                            <p className="!text-gray-600">
                                New here? <Link to="/signup" className='!no-underline !text-[#176B87] !font-bold hover:!underline'>Create an account</Link>
                            </p>
                        </div>

                        <div>
                            <InputLogin size="15" type="text" label="Email" feedback="Please provide a valid email." name="email" />
                        </div>

                        <div>
                            <InputLogin size="15" type="password" label="Password" feedback="Password is required." name="password" />
                        </div>

                        <div className="!flex !items-center !gap-2 !bg-[#EEF5FF] !p-4 !rounded-xl">
                            <input
                                type="checkbox"
                                className="!w-4 !h-4 accent-[#176B87]"
                                checked={isE}
                                onChange={(e) => setIsE(e.target.checked)}
                            />
                            <label className="!text-gray-700 !font-medium">Log in as employee</label>
                        </div>

                        <div className="!pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                            >
                                {loading ? '🔄 Logging In...' : '🎢 Log In'}
                            </button>
                        </div>

                        <div className="!text-center !text-sm !text-gray-500">
                            By logging in, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    </div>
    )
}
export default Login;
