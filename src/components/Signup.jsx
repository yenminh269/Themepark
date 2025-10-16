import {  useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel'; 
import Input from './Input';
import ButtonSignUp from './ButtonSignUp';

function SignUp() {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <p className='font-bold text-3xl text-[#176B87] p-4'>Sign up now to reserve tickets and skip the lines!</p>  
      
      <Row className="mb-3">
        <Input size="5" type="text" label="Email" feedback="Please provide a valid email." />
        <Input size="5" type="password" label="Password" feedback="Password is required." />
        <p className='text-left text-[#176B87]'>This email and password will be used to log into your account.</p>
      </Row>

      <Row className="mb-4">
        <Input size="5" type="text" label="First Name" feedback="Please provide a valid first name." />
        <Input size="5" type="text" label="Last Name" feedback="Please provide a valid last name." />
      </Row>

      <Row className="mb-4">
        <div className='mb-2'>
          <Input size="5" type="date" label="Date of birth" feedback="Please provide a valid birthdate." />
          <p className='text-left text-[#176B87]'>Your date of birth is used to calculate your age.</p>
        </div>
        <Form.Group as={Col} md="4" controlId="validationCustom07">
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
        <Input type="tel" label="Phone Number" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number (123-456-7890)" />
      </Row>

      <Form.Group className="mb-4">
          <Form.Check className='text-[#176B87]'
            required
            label="Agree to terms and conditions"
            feedback="You must agree before submitting."
            feedbackType="invalid"/>
      </Form.Group>

      <ButtonSignUp text="Sign Up"/>
    </Form>
  );
}

export default SignUp;