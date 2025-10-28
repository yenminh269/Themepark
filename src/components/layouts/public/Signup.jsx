import {  useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputLogin from '../../input/InputLogin';
import CustomButton from '../../button/CustomButton';
import { api } from '../../../services/api';

function SignUp() {
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
      // Extract form data using named elements
      const formData = {
        email: form.elements.email.value,
        password: form.elements.password.value,
        first_name: form.elements.firstName.value,
        last_name: form.elements.lastName.value,
        dob: form.elements.dob.value,
        phone: form.elements.phone.value,
        gender: form.elements.gender.value
      };

      // Call signup API - returns { data: customer }
      const response = await api.customerSignup(formData);
      const customer = response.data;

      // Auto-login: store customer info and token
      localStorage.setItem('themepark_user', JSON.stringify(customer));

      // Notify AuthContext
      try {
        window.dispatchEvent(new CustomEvent('themepark:auth', { detail: customer }));
      } catch {
        // ignore if running in environments without CustomEvent
      }

      alert(`Welcome, ${customer.first_name}! Your account has been created successfully.`);
      navigate('/');

    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !flex !items-center !justify-center !p-6">
      {/* Decorative background image */}
      <div className="!absolute !inset-0 !opacity-20">
        <img
          src="https://images.unsplash.com/photo-1570993492903-ba4c3088f100?w=1920&h=1080&fit=crop&q=80"
          alt="Theme Park"
          className="!w-full !h-full !object-cover"
        />
      </div>

      <div className="!relative !z-10 !w-full !max-w-6xl !grid md:!grid-cols-2 !gap-8 !items-center">
        {/* Left info panel (hidden on small screens) */}
        <div className="!hidden md:!block">
          <div className="!bg-white/90 backdrop-blur-md !rounded-3xl !p-8 !shadow-2xl">
            <h1 className="!text-3xl !font-black !text-[#176B87] !mb-4">Join the Fun</h1>
            <p className="!text-gray-700 !mb-6">Create an account to reserve tickets, manage orders, and skip the lines!</p>
            <img
              src="https://images.unsplash.com/photo-1594739584670-1e9be48f6ec3?w=800&h=600&fit=crop&q=80"
              alt="Rides"
              className="!w-full !h-64 !object-cover !rounded-2xl !shadow-lg"
            />
            <div className="!mt-6 !grid !grid-cols-3 !gap-4 !text-center">
              <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                <div className="!text-2xl !font-black !text-[#176B87]">Access</div>
                <div className="!text-sm !text-gray-600">Exclusive deals</div>
              </div>
              <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                <div className="!text-2xl !font-black !text-[#176B87]">Fast</div>
                <div className="!text-sm !text-gray-600">Skip the lines</div>
              </div>
              <div className="!bg-[#EEF5FF] !rounded-xl !p-4">
                <div className="!text-2xl !font-black !text-[#176B87]">Secure</div>
                <div className="!text-sm !text-gray-600">Safe payments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Signup Form */}
        <div className="!bg-white/95 backdrop-blur-md !rounded-3xl !shadow-2xl !p-8 md:!p-12">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className='!flex !flex-col !gap-6'>
              <div className="!text-center md:!text-left">
                <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-2">Create Account</h2>
                <p className="!text-gray-600">Sign up now to reserve tickets and skip the lines!</p>
              </div>

              <div>
                <InputLogin size="15" type="text" label="Email" name="email" feedback="Please provide a valid email." />
              </div>

              <div>
                <InputLogin size="15" type="password" label="Password" name="password" feedback="Password is required." />
              </div>

              <div className='!w-full !flex !gap-4'>
                <InputLogin size="6" type="text" label="First Name" name="firstName" feedback="Please provide a valid first name." />
                <InputLogin size="6" type="text" label="Last Name" name="lastName" feedback="Please provide a valid last name." />
              </div>

              <div className='!w-full !flex !gap-4'>
                <InputLogin size="6" type="date" label="Date of birth" name="dob" feedback="Please provide a valid birthdate." />
                <InputLogin size="6" type="tel" label="Phone Number" name="phone" placeholder="123-456-7890" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number in format: 000-000-0000" />
              </div>

              <Form.Group>
                <FloatingLabel label="Gender">
                  <Form.Select className='select-hover' name="gender" required>
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Please pick a valid option</Form.Control.Feedback>
                </FloatingLabel>
              </Form.Group>

              <Form.Group className="my-3">
                <Form.Check className='text-[#176B87]' required label="Agree to terms and conditions" feedback="You must agree before submitting." feedbackType="invalid" />
              </Form.Group>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                >
                  {loading ? '🔄 Signing Up...' : '🎟️ Create Account'}
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;