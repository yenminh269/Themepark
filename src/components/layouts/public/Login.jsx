import {  useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import './Login.css';
import InputLogin from '../../input/InputLogin';
import { api, SERVER_URL } from '../../../services/api';
import carnivalImg from '../../../assets/carnival.jpg';

function Login(){
    const [isE,setIsE] = useState(false);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle Google OAuth callback
    useEffect(() => {
        const token = searchParams.get('token');
        const customerData = searchParams.get('customer');
        const error = searchParams.get('error');

        if (error) {
            if (error === 'google_auth_failed') {
                toast.error('Google authentication failed. Please try again.');
            } else if (error === 'auth_failed') {
                toast.error('Authentication failed. Please try again.');
            }
            // Clear error from URL
            navigate('/login', { replace: true });
            return;
        }

        if (token && customerData) {
            try {
                const customer = JSON.parse(decodeURIComponent(customerData));

                // Store customer token
                localStorage.setItem('customer_token', token);

                // Store customer info in localStorage using the key AuthContext expects
                localStorage.setItem('themepark_user', JSON.stringify(customer));

                // Notify AuthContext (and other listeners) so UI updates immediately
                try {
                    window.dispatchEvent(new CustomEvent('themepark:auth', { detail: customer }));
                } catch {
                    // ignore if running in environments without CustomEvent
                }

                // Update ride statuses based on today's maintenance
                try {
                    api.RideStatusCheck();
                } catch (error) {
                    console.error('Failed to update ride maintenance status:', error);
                    // Don't block login if this fails
                }

                // Check if profile is incomplete (Google OAuth default values)
                const isIncompleteProfile =
                    customer.phone === '0' ||
                    customer.dob === '1000-01-01' ||
                    !customer.phone ||
                    !customer.dob;

                if (isIncompleteProfile) {
                    toast.info('Please complete your profile to continue');
                    navigate('/complete-profile', { replace: true });
                } else {
                    toast.success(`Welcome, ${customer.first_name || 'Customer'}!`);
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Error processing Google login:', error);
                toast.error('Failed to complete Google login. Please try again.');
                navigate('/login', { replace: true });
            }
        }
    }, [searchParams, navigate]);

    const handleGoogleSignIn = async () => {
        if (isE) {
            toast.error('Google Sign In is only available for customers');
            return;
        }
        setLoading(true);
        try {
            // Redirect to Google OAuth endpoint
            window.location.href = `${SERVER_URL}/api/customer/auth/google`;
        } catch (error) {
            console.error('Google Sign In error:', error);
            toast.error('Failed to initiate Google Sign In');
            setLoading(false);
        }
    };

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
                    await api.RideStatusCheck();
                } catch (error) {
                    console.error('Failed to update ride maintenance status:', error);
                    // Don't block login if this fails
                }

                // Store employee info in localStorage
                localStorage.setItem('employee', JSON.stringify(employeeData));
                localStorage.setItem('employee_info', JSON.stringify(employeeData));

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
                    await api.RideStatusCheck();
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
    <div className="!min-h-screen !bg-[#B4D4FF] !flex !items-center !justify-center !p-5">
        {/* Background Image */}
        <div className="!absolute !inset-0 ">
            
        </div>

        <div className="!relative !z-10 !w-full !max-w-8xl !grid md:!grid-cols-2 !gap-5 !items-center">
            {/* Left Side - Image & Info */}
            <div className="md:!block">
                <div className="!bg-white/90 backdrop-blur-md !rounded-3xl !p-8 ">
                    <div className="!mb-4">
                        <h1 className="!text-4xl !font-black !text-[#176B87] ">
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
            <div className="!bg-white/95 !rounded-3xl !p-7">
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <div className='!flex !flex-col !gap-3'>
                        <div className="!text-center md:!text-left">
                            <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-2">Log In</h2>
                            <p className=" mb-0 !text-gray-600">
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

                        <div className="!flex !items-center !gap-4">
                            <div className="!flex-1 !h-px !bg-gray-300"></div>
                            <span className="!text-gray-500 !text-sm">OR</span>
                            <div className="!flex-1 !h-px !bg-gray-300"></div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading || isE}
                                className="!w-full !py-4 !bg-white !text-gray-700 !text-lg !font-bold !rounded-xl !border-2 !border-gray-300 hover:!shadow-xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-3"
                            >
                                <svg className="!w-6 !h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Sign In with Google
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
