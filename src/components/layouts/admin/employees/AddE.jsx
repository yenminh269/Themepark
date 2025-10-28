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
        {value: 'Sales Employee', label: 'Sales Employee'},
        {value:'Concession Manager', label:'Concession Manager'},
        {value: 'Concession Employee',label:'Concession Employee'}
    ];

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [egender, setGender] = useState('');
    const [ephone, setPhone] = useState('');
    const[essn, setSSN] = useState('');
    const[hireDate, setHireDate] = useState('');
    const [loading, setLoading] = useState(false);
    
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
            setFirstName("");
            setLastName("");
            setJobTitle("");
            setPhone("");
            setGender("");
            setSSN("");
            setHireDate("");

            // Close form after successful submission
            onClose(true, `${newEmp.first_name} ${newEmp.last_name} has been added.`);
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
    </div>
    )
}