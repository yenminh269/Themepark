import Button from 'react-bootstrap/Button';
import './CustomButton.css'

function CustomButton(props){
    return (
        <Button 
            className={`btn-custom mb-4 ${props.className || ''}`} 
            type="submit"
        >
            {props.text}
        </Button>
    )
}
export default CustomButton;