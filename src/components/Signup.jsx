import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel'; 
import Input from './Input';
import './SignUp.css'
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
    <Form.Label> Sign Up</Form.Label>  
    <Row className="mb-3">
        <Input type="text" label="First Name" feedback="Please provide a valid first name." />
        <Input type="text" label="Last Name" feedback="Please provide a valid last name." />
    </Row>

    <Row className="mb-3">
        <Input type="text" label="Email" feedback="Please provide a valid email." />
        <Input type="password" label="Password" />
        <Input type="tel" label="Phone Number"  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number (123-456-7890)" />
    </Row>
    <Row>
        <Input type="date" label="Date of Birth" feedback="Please pick a valid date" />
        <Form.Group as={Col} md="4" controlId="validationCustom07">
             <FloatingLabel label="Gender">
            <Form.Select className='select-hover' required>
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </Form.Select></FloatingLabel>
        </Form.Group>

    </Row>
      <Form.Group className="mb-3">
        <Form.Check
          required
          label="Agree to terms and conditions"
          feedback="You must agree before submitting."
          feedbackType="invalid"
        />
      </Form.Group>
      <Button className='btn-custom' type="submit">Sign Up</Button>
</Form>
  );
}

export default SignUp;