import {  useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputLogin from '../../input/InputLogin';
import { api } from '../../../services/api';
import { useToast } from "@chakra-ui/react";

function SignUp() {
  const toast = useToast();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    // Validate password requirements (min 8 chars, alpha and non-alpha)
    const passwordValue = form.elements.password.value;
    const hasAlpha = /[a-zA-Z]/.test(passwordValue);
    const hasNonAlpha = /[^a-zA-Z]/.test(passwordValue);

    if (passwordValue.length < 8 || !hasAlpha || !hasNonAlpha) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters and include both alphabetic and non-alphabetic characters.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      setValidated(true);
      return;
    }

    // Validate passwords match
    if (passwordValue !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both password fields match.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      setValidated(true);
      return;
    }

    // Validate email domain - cannot use @velocityvalley.com
    const emailValue = form.elements.email.value;
    if (emailValue.toLowerCase().endsWith('@velocityvalley.com')) {
      toast({
        title: 'Invalid Email Domain',
        description: 'Email addresses with @velocityvalley.com domain are reserved. Please use a different domain email address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setValidated(true);
      return;
    }

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

      // Validate age: must be at least 18
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      const isAdult = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
      if (!isAdult) {
        toast({
          title: 'Age Restriction',
          description: 'You must be at least 18 years old to create an account.',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      // Call signup API - returns { data: customer }
      const response = await api.customerSignup(formData);
      const customer = response.data;

      // Auto-login: store customer info and token
      localStorage.setItem('customer_info', JSON.stringify(customer));

      // Notify AuthContext
      try {
        window.dispatchEvent(new CustomEvent('themepark:auth', { detail: customer }));
      } catch (authError) {
        console.error('Auth notification error:', authError);
      }

      toast({
        title: 'Account created successfully!',
        description: `Welcome, ${customer.first_name}! Your account has been created successfully.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Failed to create account. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!min-h-screen bg-[#EEF5FF] !via-50% !to-[#4682A9] !to-100% !flex !items-center !justify-center !flex-wrap !p-6 !relative">
      <div className=" backdrop-blur-md !rounded-3xl !p-5 !shadow-2xl">
            <div className="!mt-6 !grid  !gap-4 !text-center">
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
      {/*Signup Form */}
      <div className="backdrop-blur-md !rounded-3xl !shadow-2xl !p-5 md:!p-12 !w-full md:!w-[60vw] !mx-auto">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className='!flex !flex-col !flex-wrap !gap-6'>
              <div className="!text-center md:!text-left">
                 <h1 className="!text-3xl !font-black !text-[#176B87] !mb-4">Join the Fun</h1>
                  <p className="!text-gray-700 mb-0">Create an account to reserve tickets, manage orders, and skip the lines!</p>
              </div>

              <div>
                <InputLogin size="15" type="text" label="Email" name="email" feedback="Please provide a valid email." />
                <small className="!text-gray-700 !text-sm !mt-1 !block">
                  The email address you provide will be used to log in to your account. 
                  It cannot be changed after the account is created.</small>
              </div>

              <div>
                <FloatingLabel label="Password">
                  <Form.Control
                    required
                    type="password"
                    name="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    pattern="^(?=.*[a-zA-Z])(?=.*[^a-zA-Z]).{8,}$"
                    title="Password must be at least 8 characters and include both alphabetic and non-alphabetic characters"
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must be at least 8 characters and include both alphabetic and non-alphabetic characters.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </div>

              <div>
                <FloatingLabel label="Confirm Password">
                  <Form.Control
                    required
                    type="password"
                    name="confirmPassword"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    pattern="^(?=.*[a-zA-Z])(?=.*[^a-zA-Z]).{8,}$"
                    title="Password must be at least 8 characters and include both alphabetic and non-alphabetic characters"
                    autoComplete="new-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please confirm your password.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </div>

              <div className='!w-full !flex !gap-4'>
                <InputLogin size="6" type="text" label="First Name" name="firstName" feedback="Please provide a valid first name (at least 2 characters)." />
                <InputLogin size="6" type="text" label="Last Name" name="lastName" feedback="Please provide a valid last name (at least 2 characters)." />
              </div>

              <div className='!w-full !flex !gap-4'>
                <InputLogin size="6" type="date" label="Date of birth" name="dob" feedback="Please provide a valid birthdate." />
                <InputLogin size="6" type="tel" label="Phone Number" maxLength="10" name="phone"  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number in format: 000-000-0000" />
              </div>
              <small className="!text-gray-700 !text-sm !mt-1 !block">Note: Date of birth cannot be changed after account creation.</small>

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
                <Form.Check className='!text-[#176B87]'
                required label={<span className='!ml-2'> I agree to the <button type="button" 
                className="text-blue-600 underline" onClick={() => setShowTerms(!showTerms)}>Terms and Conditions</button> and consent to the use of my personal information.</span>} feedback="You must agree before submitting." feedbackType="invalid" />
                  {showTerms && (
                    <div className="mt-2 p-3 bg-transparent rounded text-sm text-gray-700">
                      <p><strong>By creating an account, you agree to the following:</strong></p>
                      <ul className="list-disc list-inside mt-1">
                        <li><strong>Data Collection:</strong> We collect your name, email, phone, and DOB for account management, tickets, and notifications.</li>
                        <li><strong>Use of Data:</strong> Info used to personalize experience, send updates, and notify about events/promotions.</li>
                        <li><strong>Privacy:</strong> Personal info kept private and not shared without consent.</li>
                        <li><strong>Accuracy:</strong> You confirm provided info is true and accurate.</li>
                        <li><strong>Consent:</strong> By checking the box, you consent to data collection and use.</li>
                      </ul>
                    </div>
                  )}
              </Form.Group>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="!w-full !py-4 !bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !text-white !text-lg !font-bold !rounded-xl hover:!shadow-2xl hover:!scale-[1.02] !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                >
                  {loading ? '🔄 Signing Up...' : '🎫 Create Account'}
                </button>
              </div>
            </div>
          </Form>
      </div>
    </div>
  );
}

export default SignUp;