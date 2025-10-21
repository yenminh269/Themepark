import Button from 'react-bootstrap/Button';
import './CustomButton.css'
function ButtonSignUp(props){
    return (
        <Button className='btn-custom mb-4' type="submit">{props.text}</Button>
    )
}
export default ButtonSignUp;