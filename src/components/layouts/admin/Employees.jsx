import DataTable from '../../data-table/DataTable';
import { Box } from '@chakra-ui/react';
import { api } from '../../../services/api';
import { useState, useEffect, useMemo } from 'react';

function Employees() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emp, setEmp] = useState([]);
  const [searchText, setSearchText] = useState('');

  const EAttr = ['Emp_Id', 'First Name', 'Last Name', 'Gender', 'Email', 'Password', 
                 'Job Title', 'Phone','SSN', 'Hire Date', 'Terminate Date'];
  const columnKeys = [
  'employee_id', 'first_name', 'last_name', 'gender', 'email', 'password',
  'job_title', 'phone', 'ssn', 'hire_date', 'terminate_date'
];

  useEffect(() => {
    const fetchEmp = async () => {
      try {
        setLoading(true);
        const data = await api.getAllEmployees();
        console.log(data)
        setEmp(data);
        setError(null);
      } catch(err) {
        setError('Failed to load employees. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmp();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchText) return emp;
    return emp.filter(empObj =>
      EAttr.some(key =>
        empObj[key]?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [emp, searchText]);

  const formattedData = filteredData.map(empObj =>
  columnKeys.map(key => {
    if ((key === 'hire_date' || key === 'terminate_date') && empObj[key]) {
      return new Date(empObj[key]).toISOString().slice(0, 10); // YYYY-MM-DD
    }
    return empObj[key] ?? '';
  })
);



  const handleEdit = (id, row) => {
    console.log('Edit clicked for ID:', id);
    console.log('Full row data:', row);
  };

  const handleDelete = (id, row) => {
    console.log('Delete clicked for ID:', id);
    if (window.confirm(`Are you sure you want to delete ${row[1]}?`)) {
      // Implement delete logic here
    }
  };

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <Box position="relative" p={4}>
      <input
        type="text"
        placeholder="Search employees..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 mb-4 w-full"
      />
      <DataTable
        title="Employees"
        columns={EAttr}
        data={formattedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
}

export default Employees;
