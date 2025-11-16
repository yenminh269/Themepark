import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';
import { completeCustomerProfile } from '../../../services/api';
import carnivalImg from '../../../assets/carnival.jpg';

function CompleteProfile() {
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    // Get customer from localStorage
    const customerData = localStorage.getItem('themepark_user');
    const customer = customerData ? JSON.parse(customerData) : null;

    // If no customer or profile is already complete, redirect
    if (!customer) {
        navigate('/login');
        return null;
    }

    // Format phone number as user types (XXX-XXX-XXXX)
    const handlePhoneChange = (e) => {
        let input = e.target.value.replace(/\D/g, ''); // Remove all non-digits

        // Limit to 10 digits
        if (input.length > 10) {
            input = input.slice(0, 10);
        }

        // Format as XXX-XXX-XXXX
        let formatted = '';
        if (input.length > 0) {
            formatted = input.slice(0, 3);
        }
        if (input.length > 3) {
            formatted += '-' + input.slice(3, 6);
        }
        if (input.length > 6) {
            formatted += '-' + input.slice(6, 10);
        }

        setPhone(formatted);
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
            const profileData = {
                dob: form.elements.dob.value,
                phone: form.elements.phone.value,
                gender: form.elements.gender.value
            };

            // Validate age: must be at least 18
            const dob = new Date(profileData.dob);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const dayDiff = today.getDate() - dob.getDate();
            const isAdult = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

            if (!isAdult) {
                toast.error('You must be at least 18 years old to use this service.');
                setLoading(false);
                return;
            }

            // Complete customer profile
            const updatedCustomer = await completeCustomerProfile(customer.customer_id, profileData);

            // Update localStorage
            localStorage.setItem('themepark_user', JSON.stringify(updatedCustomer));

            // Notify AuthContext
            try {
                window.dispatchEvent(new CustomEvent('themepark:auth', { detail: updatedCustomer }));
            } catch {
                // ignore if running in environments without CustomEvent
            }

            toast.success('Profile completed successfully!');
            navigate('/');
        } catch (error) {
            console.error('Complete profile error:', error);
            toast.error(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="!min-h-screen !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !flex !items-center !justify-center !p-6">
            <div className="!relative !z-10 !w-full !max-w-6xl !grid md:!grid-cols-2 !gap-8 !items-center">
                {/* Left Side - Image & Info */}
                <div className="!hidden md:!block">
                    <div className="!bg-white/90 backdrop-blur-md !rounded-3xl !p-8 !shadow-2xl">
                        <div className="!mb-6">
                            <h1 className="!text-4xl !font-black !text-[#176B87] !mb-4">
                                🎉 Welcome to VelocityValley!
                            </h1>
                            <p className="!text-gray-700 !text-lg">
                                We're excited to have you! Please complete your profile to get started with exclusive rides, special offers, and personalized experiences.
                            </p>
                        </div>
                        <img
                            src={carnivalImg}
                            alt="Theme Park"
                            className="!w-full !h-80 !object-cover !rounded-2xl !shadow-lg !border-4 !border-[#749BC2]"
                        />
                    </div>
                </div>

                {/* Right Side - Complete Profile Form */}
                <div className="!bg-white/95 backdrop-blur-md !rounded-3xl !shadow-2xl !p-8 md:!p-12">
                    <div className="!mb-8">
                        <h2 className="!text-3xl !font-black !text-[#176B87] !mb-2">Complete Your Profile</h2>
                        <p className="!text-gray-600">
                            Hello, <strong>{customer.first_name} {customer.last_name}</strong>! Just a few more details to get started.
                        </p>
                    </div>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <div className="!flex !flex-col !gap-6">
                            {/* Date of Birth */}
                            <FloatingLabel label="Date of Birth" className="!text-gray-600">
                                <Form.Control
                                    type="date"
                                    name="dob"
                                    required
                                    className="!border-2 !border-gray-300 !rounded-xl focus:!border-[#176B87] focus:!ring-2 focus:!ring-[#176B87]/20"
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid date of birth.
                                </Form.Control.Feedback>
                            </FloatingLabel>
                             <small className="!text-gray-600 !text-sm !mt-1 !block">Note: Date of birth cannot be changed after account creation.</small>

                            {/* Phone Number */}
                            <FloatingLabel label="Phone Number" className="!text-gray-600">
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    required
                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={12}
                                    placeholder="000-000-0000"
                                    className="!border-2 !border-gray-300 !rounded-xl focus:!border-[#176B87] focus:!ring-2 focus:!ring-[#176B87]/20"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid phone number in format: 000-000-0000
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            {/* Gender */}
                            <FloatingLabel label="Gender" className="!text-gray-600">
                                <Form.Select
                                    name="gender"
                                    required
                                    className=" !border-2 !border-gray-300 !rounded-xl focus:!border-[#176B87] focus:!ring-2 focus:!ring-[#176B87]/20"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select your gender.
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            {/* Submit Button */}
                            <div className="!pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                >
                                    {loading ? '🔄 Saving...' : '✨ Complete Profile'}
                                </button>
                            </div>

                            <div className="!text-center !text-sm !text-gray-500">
                                All fields are required to access the theme park features
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default CompleteProfile;
