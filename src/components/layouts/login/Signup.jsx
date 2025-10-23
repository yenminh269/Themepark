import {  useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel'; 
import Input from '../../input/Input';
import CustomButton from '../../button/CustomButton';
import './Signup.css'
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
    <Form className='ml-20'noValidate validated={validated} onSubmit={handleSubmit}>
      <div  className='flex flex-col items-center'>
      <p className='header text-[#176B87] p-4'>Sign up now to reserve tickets and skip the lines!</p>  

      <Row className="mb-3">
        <Input size="5" type="text" label="Email" feedback="Please provide a valid email." />
        <Input size="5" type="password" label="Password" feedback="Password is required." />
        <p className='text-left text-[#176B87]'>This email and password will be used to log into your account.</p>
      </Row>
      <div className='w-225 gap-4 flex '>
        <Input size="4" type="text" label="First Name" feedback="Please provide a valid first name." />
        <Input size="4" type="text" label="Last Name" feedback="Please provide a valid last name." />
      </div>

     <Row className='w-230 gap-4 flex mt-4 '>
          <Input className="" size="2" type="date" label="Date of birth" feedback="Please provide a valid birthdate." />
          <Input size="3" type="tel" label="Phone Number" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" feedback="Please enter a valid phone number (123-456-7890)" />
         
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
        <p className='text-left text-[#176B87]'>Your date of birth is used to calculate your age.</p>
      </Row>
     
      <Form.Group className="my-3">
          <Form.Check className='text-[#176B87]'
            required
            label="Agree to terms and conditions"
            feedback="You must agree before submitting."
            feedbackType="invalid"/>
      </Form.Group>

      <div><CustomButton text="Sign Up"/></div>
      </div>
    </Form>
  );
}

export default SignUp;