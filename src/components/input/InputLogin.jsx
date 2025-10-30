import { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

function InputLogin(props) {
  const [phoneValue, setPhoneValue] = useState("");
  const isPasswordField = props.type === "password";
  const isPhoneField = props.type === "tel";

  const formatPhoneNumber = (value) => {
    // Remove all non-digit character
    const phoneNumber = value.replace(/\D/g, "");

    // Format as XXX-XXX-XXXX when complete
    if (phoneNumber.length === 10) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else {
      return phoneNumber;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneValue(formatted);

    // Update the actual input value
    e.target.value = formatted;
  };

  return (
    <Form.Group as={Col} md={props.size} style={{ position: "relative" }}>
      <FloatingLabel label={props.label}>
        <Form.Control
          required
          type={isPasswordField ? "password" : props.type}
          placeholder={props.placeholder || " "}
          pattern={isPhoneField ? "[0-9]{3}-[0-9]{3}-[0-9]{4}" : props.pattern}
          name={props.name}
          onChange={isPhoneField ? handlePhoneChange : undefined}
          value={isPhoneField ? phoneValue : undefined}
          maxLength={isPhoneField ? 10 : undefined}
        />
        <Form.Control.Feedback type="invalid">
          {props.feedback}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form.Group>
  );
}
export default InputLogin;
