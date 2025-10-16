import Button from 'react-bootstrap/Button';
import './ButtonSignUp.css'
function ButtonSignUp(props){
    return (
        <Button className='btn-custom mb-4' type="submit">{props.text}</Button>
    )
}
export default ButtonSignUp;