import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import './Login.css';
import InputLogin from '../../input/InputLogin';
import { api } from '../../../services/api';

function ForgetPassword() {
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        const emailValue = form.elements.email.value;
        setEmail(emailValue);
        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        setLoading(true);

        try {
            const response = await api.forgotPassword(email);

            toast.success(response.message || 'A temporary password has been sent to your email!');
            toast.info('You will be required to change your password upon next login');

            // Navigate to home page after successful reset
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
            setShowConfirmation(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setEmail('');
    };

    return (
        <div className="!min-h-screen !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !flex !items-center !justify-center !p-6">
            <div className="!relative !z-10 !w-full !max-w-md">
                <div className="!bg-white/95 backdrop-blur-md !rounded-3xl !shadow-2xl !p-8 md:!p-12">
                    {!showConfirmation ? (
                        <>
                            <div className="!mb-8">
                                <h1 className="!text-3xl !font-black !text-[#176B87] !mb-4">= Forgot Password</h1>
                                <p className="!text-gray-600">
                                    Enter your email address and we'll send you a temporary password to reset your account.
                                </p>
                            </div>

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <div className='!flex !flex-col !gap-6'>
                                    <div>
                                        <InputLogin
                                            size="15"
                                            type="email"
                                            label="Email Address"
                                            feedback="Please provide a valid email address."
                                            name="email"
                                            required
                                        />
                                        <small className="!text-gray-500 !text-xs">
                                            Enter the email associated with your account
                                        </small>
                                    </div>

                                    <div className="!pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                        >
                                            = Send Reset Email
                                        </button>
                                    </div>

                                    <div className="!text-center">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="!text-[#176B87] !font-semibold hover:!underline !bg-transparent !border-none !cursor-pointer"
                                        >
                                            ê Back to Login
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        </>
                    ) : (
                        <div className="!text-center">
                            <div className="!mb-6">
                                <div className="!text-6xl !mb-4">=Á</div>
                                <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-4">Confirm Password Reset</h2>
                                <p className="!text-gray-700 !mb-2">
                                    We will send a temporary password to:
                                </p>
                                <p className="!text-lg !font-bold !text-[#176B87] !mb-4">
                                    {email}
                                </p>
                                <div className="!bg-yellow-50 !border !border-yellow-200 !rounded-lg !p-4 !mb-6">
                                    <p className="!text-sm !text-yellow-800">
                                        † <strong>Important:</strong> You will be required to change your password upon next login for security purposes.
                                    </p>
                                </div>
                            </div>

                            <div className="!flex !gap-3">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="!flex-1 !py-3 !bg-gray-300 !text-gray-700 !font-bold !rounded-lg hover:!bg-gray-400 !transition disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="!flex-1 !py-3 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !font-bold !rounded-lg hover:!shadow-xl !transition disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                                >
                                    {loading ? '= Sending...' : ' Confirm'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgetPassword;
