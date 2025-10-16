import FloatingLabel from 'react-bootstrap/FloatingLabel'; 
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
function Input(props){
    return (
        <Form.Group as={Col} md="4" >
            <FloatingLabel label={props.label}>
                <Form.Control
                    required
                    type={props.type}
                    placeholder=" "
                    pattern={props.pattern}
                />
                <Form.Control.Feedback type="invalid">
                    {props.feedback}
                </Form.Control.Feedback>
            </FloatingLabel>
        </Form.Group>
        
    )
}
export default Input;