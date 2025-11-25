import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import './Login.css';
import InputLogin from '../../input/InputLogin';
import { api } from '../../../services/api';

function ChangePassword() {
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

        const currentPassword = form.elements.currentPassword.value;
        const newPassword = form.elements.newPassword.value;
        const confirmPassword = form.elements.confirmPassword.value;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Check password strength (at least 8 characters)
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long!');
            return;
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            toast.error('New password must be different from current password!');
            return;
        }

        setValidated(true);
        setLoading(true);

        try {
            // Get employee data from localStorage
            const employeeData = JSON.parse(localStorage.getItem('employee_info'));

            if (!employeeData || !employeeData.employee_id) {
                toast.error('Session expired. Please log in again.');
                navigate('/login');
                return;
            }

            // Call API to change password with current password verification
            const response = await api.changeEmployeePasswordVerified(currentPassword, newPassword);

            // Update employee info in localStorage with new data
            if (response.data) {
                localStorage.setItem('employee_info', JSON.stringify(response.data));
            }

            toast.success('Password changed successfully!');

            // Redirect to appropriate dashboard based on job title
            const jobTitle = response.data?.job_title || employeeData.job_title;

            if (jobTitle === 'General Manager') {
                navigate('/admin');
            } else if (jobTitle === 'Store Manager') {
                navigate('/manager');
            } else if (jobTitle === 'Mechanical Employee') {
                navigate('/maintenance');
            } else if (jobTitle === 'Sales Employee') {
                navigate('/sales');
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error('Change password error:', error);
            toast.error(error.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="!min-h-screen !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !flex !items-center !justify-center !p-6">
            <div className="!relative !z-10 !w-full !max-w-md">
                <div className="!bg-white/95 backdrop-blur-md !rounded-3xl !shadow-2xl !p-8 md:!p-12">
                    <div className="!mb-8">
                        <h1 className="!text-3xl !font-black !text-[#176B87] !mb-4">🔒 Change Password</h1>
                        <p className="!text-gray-600">
                            This is your first login. Please enter your temporary password and set a new password to continue.
                        </p>
                    </div>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <div className='!flex !flex-col !gap-6'>
                            <div>
                                <InputLogin
                                    size="15"
                                    type="password"
                                    label="Current Password"
                                    feedback="Please enter your current password."
                                    name="currentPassword"
                                    required
                                />
                                <small className="!text-gray-500 !text-xs">
                                    Enter the temporary password provided to you
                                </small>
                            </div>

                            <div>
                                <InputLogin
                                    size="15"
                                    type="password"
                                    label="New Password"
                                    feedback="Password must be at least 8 characters."
                                    name="newPassword"
                                    minLength={8}
                                />
                                <small className="!text-gray-500 !text-xs">
                                    Password must be at least 8 characters long
                                </small>
                            </div>

                            <div>
                                <InputLogin
                                    size="15"
                                    type="password"
                                    label="Confirm New Password"
                                    feedback="Please confirm your password."
                                    name="confirmPassword"
                                    minLength={8}
                                />
                            </div>

                            <div className="!pt-2 !flex !flex-col !gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                >
                                    {loading ? '🔄 Changing Password...' : '🔒 Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    disabled={loading}
                                    className="!w-full !py-4 !bg-gray-500 !text-white !text-lg !font-bold !rounded-xl hover:!bg-gray-600 hover:!shadow-xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="!text-center !text-sm !text-gray-500">
                                After changing your password, you will be redirected to your dashboard.
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
