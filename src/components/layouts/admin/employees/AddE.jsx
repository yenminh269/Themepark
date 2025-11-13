import '../Add.css'
import Input from '../../../input/Input';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';
import CustomButton from '../../../button/CustomButton';
import Loading from "../loading/Loading";
import { api } from '../../../../services/api';

export default function AddE({onClose}){
    const genderOption = [
        {value: "Male", label: "Male"},
        {value: "Female", label: "Female"},
        {value: "Other", label: "Other"}
    ];
    const jobTitleOption = [
        {value: 'Store Manager', label:'Store Manager'},
        {value: 'Mechanical Employee', label:'Mechanical Employee'},
        {value: 'Sales Employee', label: 'Sales Employee'}
    ];

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [egender, setGender] = useState('');
    const [ephone, setPhone] = useState('');
    const[essn, setSSN] = useState('');
    const[hireDate, setHireDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [newEmployeeCredentials, setNewEmployeeCredentials] = useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !jobTitle || !egender || !ephone || !essn || !hireDate) {
            alert("Please fill out all fields to hire a new employee!");
            return;
        }

        const newEmp = {
            first_name: firstName,
            last_name: lastName,
            job_title: jobTitle,
            gender: egender,
            phone: ephone,
            ssn: essn,
            hire_date: hireDate,
        };

        try {
            setLoading(true);
            const response = await api.addEmployee(newEmp);
            console.log("Employee Submitted:", response.message);

            // Store credentials and show modal
            if (response.email && response.temporaryPassword) {
                setNewEmployeeCredentials({
                    firstName: newEmp.first_name,
                    lastName: newEmp.last_name,
                    email: response.email,
                    password: response.temporaryPassword
                });
                setShowCredentials(true);
            }

            // Clear form fields
            setFirstName("");
            setLastName("");
            setJobTitle("");
            setPhone("");
            setGender("");
            setSSN("");
            setHireDate("");
        } catch (err) {
            console.error("Failed to submit the new employee. Please make sure the backend server is running.");
        } finally {
            setLoading(false);
        }
        };

    if (loading) return <Loading isLoading={loading} />;
    
    return(
    <div className="mt-2 flex justify-center items-start w-full">
        <Form onSubmit={handleSubmit}  style={{ boxShadow: '-8px -8px 12px rgba(0,0,0,0.25)' }}
            className="flex flex-col p-4 rounded  w-full max-w-6xl">
            <div className="flex justify-end items-center mb-2">
            <button type="button" onClick={() => onClose(false)}>X</button>
            </div>

            <div className="flex gap-4 mb-3">
            <div className="flex-1">
                <Input
                required
                type="text"
                label="First Name"
                className="custom-input"
                labelClassName="custom-form-label"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                />
            </div>

            <div className="flex-1">
                <Input
                required
                type="text"
                label="Last Name"
                className="custom-input"
                labelClassName="custom-form-label"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                />
            </div>

            <div className="flex-1">
                <Input
                required
                type="date"
                label="Hire Date"
                className="custom-input"
                labelClassName="custom-form-label"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                />
            </div>

            <div className="flex-1">
                <FormControl isRequired>
                <FormLabel color="#4B5945" fontWeight="500">Job Title</FormLabel>
                <Select
                    options={jobTitleOption}
                    placeholder="Select job title"
                    className="custom-react-select"
                    classNamePrefix="react-select"
                    onChange={(option) => setJobTitle(option.value)}
                />
                </FormControl>
            </div>
            </div>

            <div className="flex gap-4">
            <div className="flex-1">
                <Input
                required
                type="text"
                label="Phone"
                className="custom-input"
                labelClassName="custom-form-label"
                value={ephone}
                onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className="flex-1">
                <Input
                required
                type="password"
                label="SSN"
                className="custom-input"
                labelClassName="custom-form-label"
                value={essn}
                onChange={(e) => setSSN(e.target.value)}
                pattern="\d{9}"
                maxLength={9}
                feedback="SSN must be exactly 9 digits."
                />
            </div>

            <div className="flex-1">
                <FormControl isRequired>
                <FormLabel color="#4B5945" fontWeight="500">Gender</FormLabel>
                <Select
                    options={genderOption}
                    placeholder="Select gender"
                    className="custom-react-select"
                    classNamePrefix="react-select"
                    onChange={(option) => setGender(option.value)}
                />
                </FormControl>
            </div>

            <div className="flex-1 flex items-end">
                <CustomButton text={"Add New Employee"} className="custom-button w-full" />
            </div>
            </div>
        </Form>

        {/* Credentials Modal */}
        {showCredentials && newEmployeeCredentials && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              margin: '0 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#3e4b2b', marginBottom: '16px'}}>
                Employee Added Successfully!
              </h2>

              <p style={{fontSize: '16px', color: '#666', marginBottom: '24px'}}>
                Please provide these credentials to <strong>{newEmployeeCredentials.firstName} {newEmployeeCredentials.lastName}</strong>:
              </p>

              <div style={{backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px', marginBottom: '24px'}}>
                <div style={{marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold'}}>
                    Email Address
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '4px'}}>
                    {newEmployeeCredentials.email}
                  </p>
                </div>

                <div>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold'}}>
                    Temporary Password
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '4px'}}>
                    {newEmployeeCredentials.password}
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px'
              }}>
                <p style={{fontSize: '14px', color: '#856404', margin: 0}}>
                  <strong>Note:</strong> The employee will be required to change this password upon first login.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCredentials(false);
                  setNewEmployeeCredentials(null);
                  onClose(true, `${newEmployeeCredentials.firstName} ${newEmployeeCredentials.lastName} has been added.`);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3e4b2b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2d3e20'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3e4b2b'}
              >
                Close
              </button>
            </div>
          </div>
        )}
    </div>
    )
}