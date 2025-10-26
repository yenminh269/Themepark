import DataTable from '../../data-table/DataTable';
import {api} from '../../../services/api';

function Employees(){
    const EAttr = ['Emp_Id', 'First Name', 'Last Name', 'Gender', 'Email', 'Password', 'Job Title', 'Phone','SSN', 'Hire Date', 'Terminate Date'];
    const rideDetailed = [
    ['1','abc','$0.05', 5, 'abc', 'Approved', '8:00am', '10:00'],
    ['2','abc','$0.05', 5, 'abc', 'Pending', '8:00am', '12:00']
  ];
  
    return (
    <DataTable
        title="Employees"
        columns={EAttr}
        data={rideDetailed}
    />
    )
}
export default Employees;