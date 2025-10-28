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
      // Extract form data
      const formData = {
        email: form.elements[0].value,
        password: form.elements[1].value,
        first_name: form.elements[2].value,
        last_name: form.elements[3].value,
        dob: form.elements[4].value,
        phone: form.elements[5].value,
        gender: form.elements[6].value
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
  <div className="min-h-screen bg-[#FFFBDE] flex items-center justify-center">
    <Form className='ml-20'noValidate validated={validated} onSubmit={handleSubmit}>
      <div  className='flex flex-col items-center'>
        <h1 className='text-[#176B87] p-4'>Sign up now to reserve tickets and skip the lines!</h1>  

        <Row className="mb-3">
          <InputLogin size="5" type="text" label="Email" feedback="Please provide a valid email." />
          <InputLogin size="5" type="password" label="Password" feedback="Password is required." />
          <p className='text-left text-[#176B87]'>This email and password will be used to log into your account.</p>
        </Row>

        <div className='w-225 gap-4 flex '>
          <InputLogin size="4" type="text" label="First Name" feedback="Please provide a valid first name." />
          <InputLogin size="4" type="text" label="Last Name" feedback="Please provide a valid last name." />
        </div>

      <Row className='w-230 gap-4 flex mt-5 '>
            <InputLogin className="" size="2" type="date" label="Date of birth" feedback="Please provide a valid birthdate." />
            <InputLogin size="4" type="tel" label="Phone Number (000-000-0000)" placeholder="123-456-7890" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number in format: 000-000-0000" />
          
          <Form.Group as={Col} md="3" controlId="validationCustom07">
            <FloatingLabel label="Gender">
              <Form.Select className='select-hover' required>
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                    Please pick a valid option
              </Form.Control.Feedback>
            </FloatingLabel>
          </Form.Group>
          <p className='text-left text-[#176B87]'>Your date of birth is used to calculate your age.</p>
        </Row>
      
        <Form.Group className="my-3">
            <Form.Check className='text-[#176B87]'
              required
              label="Agree to terms and conditions"
              feedback="You must agree before submitting."
              feedbackType="invalid"/>
        </Form.Group>

        <div><CustomButton text={loading ? "Signing Up..." : "Sign Up"} disabled={loading}/></div>
      </div>
    </Form>
  </div>
  );
}

export default SignUp;