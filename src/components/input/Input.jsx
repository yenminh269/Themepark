import { useState, useEffect } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

function Input(props){
    const [internalValue, setInternalValue] = useState(props.value || '');

    // Sync internal value with external prop changes
    useEffect(() => {
        if (props.value !== undefined) {
            setInternalValue(props.value);
        }
    }, [props.value]);

    const handleKeyDown = (e) => {
        // For currency/number inputs, prevent 'e', 'E', '+', '-' keys
        if ((props.type === 'currency' || props.type === 'number') &&
            ['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }

        // For regular number (capacity), also prevent decimal point
        if (props.type === 'number' && e.key === '.') {
            e.preventDefault();
        }
    };

    const formatPhoneNumber = (value) => {
        // Remove all non-digit characters
        const phoneNumber = value.replace(/\D/g, '');

        // Format as XXX-XXX-XXXX
        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 6) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        } else {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const handleInput = (e) => {
        // For currency inputs, validate decimal format
        if (props.type === 'currency') {
            const value = e.target.value;
            const regex = /^\d{0,4}(\.\d{0,2})?$/;
            if (!regex.test(value)) {
                e.target.setCustomValidity('Please enter in a valid form(e.g, 9.99)');
            } else {
                e.target.setCustomValidity('');
            }
        }

        // For regular number (capacity), validate integer only
        if (props.type === 'number') {
    const value = Number(e.target.value);
    const min = Number(props.min);
    const max = Number(props.max);

    if (value < min) {
        e.target.setCustomValidity(`The capacity is too low (${min}-${max})`);
    } else if (value > max) {
        e.target.setCustomValidity(`The capacity is too high (${min}-${max})`);
    } else {
        e.target.setCustomValidity(''); // clear any previous error
    }
}

    };

    const handleChange = (e) => {
        // Check if this is a phone input field (identified by label)
        if (props.label && props.label.toLowerCase().includes('phone')) {
            const formatted = formatPhoneNumber(e.target.value);
            setInternalValue(formatted);

            // Call the parent's onChange with the formatted value
            if (props.onChange) {
                e.target.value = formatted;
                props.onChange(e);
            }
        } else {
            setInternalValue(e.target.value);
            if (props.onChange) {
                props.onChange(e);
            }
        }
    };

    const getInputProps = () => {
    // Destructure to remove custom props that shouldn't be passed to DOM
    const { labelClassName, feedback, size, label, ...domProps } = props;

    // Check if this is a phone field
    const isPhoneField = label && label.toLowerCase().includes('phone');

    const baseProps = {
        ...domProps,
        onKeyDown: handleKeyDown,
        onInput: handleInput,
        onChange: handleChange,
        // For phone fields, use internal controlled value
        ...(isPhoneField && { value: internalValue })
    };

    // Add decimal validation for currency type
    if (props.type === 'currency') {
        return {
            ...baseProps,
            type: 'number',
            step: props.step || '0.01',
            min: props.min || '0',
            max: props.max || '9999.99'
        };
    }
    
    // For regular number (capacity), use step 1 for integers only
    if (props.type === 'number') {
        return {
            ...baseProps,
            step: props.step || '1'
        };
    }
    
    // For file inputs, remove onKeyDown and onInput handlers
    if (props.type === 'file') {
        return {
            required: props.required,
            type: 'file',
            className: props.className,
            accept: props.accept || 'image/*',
            onChange: props.onChange
        };
    }

    return baseProps;
} ;

    // File inputs don't work well with FloatingLabel, so handle separately
    if (props.type === 'file') {
        return (
            <Form.Group as={Col} md={props.size} className="mb-3">
                <Form.Label className={props.labelClassName}>{props.label}</Form.Label>
                <Form.Control
                    {...getInputProps()}
                />
                <Form.Control.Feedback type="invalid">
                    {props.feedback || 'Please select a file.'}
                </Form.Control.Feedback>
            </Form.Group>
        );
    }

    return (
        <Form.Group as={Col} md={props.size} >
            <FloatingLabel label={props.label} className={props.labelClassName}>
                <Form.Control
                    {...getInputProps()}
                />
                <Form.Control.Feedback type="invalid">
                    {props.feedback || 'Please provide a valid input.'}
                </Form.Control.Feedback>
            </FloatingLabel>
        </Form.Group>
    )
}
export default Input;