import DataTable from '../../../data-table/DataTable';
import { api } from '../../../../services/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import Loading from '../loading/loading';
import { Box, IconButton, HStack, ScaleFade, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Text, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon, WarningIcon } from '@chakra-ui/icons';
import AddE from './AddE';

function Employees() {
  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [addE, showAddE] = useState(false);
  const addFormRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  const EAttr = ['Emp_Id', 'First Name', 'Last Name', 'Gender', 'Email', 'Job Title', 'Phone', 'SSN', 'Hire Date', 'Terminate Date'];
  const columnKeys = ['employee_id', 'first_name', 'last_name', 'gender', 'email', 'job_title', 'phone', 'ssn', 'hire_date', 'terminate_date'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Smooth scroll when showing add form
  useEffect(() => {
    if (addE && addFormRef.current) {
      const timer = setTimeout(() => {
        addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [addE]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getAllEmployees();
      setEmp(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAdd = async (refresh = false, message = null) => {
    showAddE(false);
    if (refresh) {
      await fetchEmployees();
      if (message) {
        toast({
          title: 'Employee added',
          description: message,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return emp;
    const normalizedSearch = searchText.toLowerCase().replace(/\s+/g, '');
    return emp.filter(empObj =>
      columnKeys.some(key => {
        const value = empObj[key]?.toString().toLowerCase().replace(/\s+/g, '');
        return value && value.includes(normalizedSearch);
      })
    );
  }, [emp, searchText]);

  const handleEdit = (id) => {
    setEditingId(id);
    const employee = emp.find(e => e.employee_id === id);
    if (employee) setEditedData({ ...employee });
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      const updateData = { employee_id: id, ...editedData };
      await api.updateEmployee(updateData, id);
      await fetchEmployees();
      setEditingId(null);
      setEditedData({});
      toast({
        title: 'Employee updated',
        description: `${editedData.first_name} ${editedData.last_name} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleInputChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (id, row) => {
    setDeleteTarget({ id, name: `${row[1]} ${row[2]}` });
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    onClose();
    setDeleteTarget(null);
    try {
      setLoading(true);
      await api.deleteEmployee(deleteTarget.id);
      await fetchEmployees();
      toast({
        title: 'Employee deleted',
        description: `${deleteTarget.name} has been removed successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete employee.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEditableRow = (empObj) => {
    return columnKeys.map((key, index) => {
      if (key === 'employee_id') return empObj[key];
      let inputWidth = '170px';
      if (key === 'first_name' || key === 'last_name' || key === 'gender') inputWidth = '120px';

      if (key === 'hire_date' || key === 'terminate_date') {
        return (
          <input
            type="date"
            value={editedData[key]?.slice(0, 10) || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded px-3 py-2 text-sm md:text-base"
            style={{ width: inputWidth }}
          />
        );
      }

      if (key === 'gender') {
        return (
          <select
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded px-3 py-2 text-sm md:text-base"
            style={{ width: inputWidth }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        );
      }

      return (
        <input
          type={key === 'email' ? 'email' : 'text'}
          value={editedData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
          style={{ width: inputWidth }}
          placeholder={EAttr[index]}
        />
      );
    });
  };

  const displayData = filteredData.map(empObj => {
    if (editingId === empObj.employee_id) return renderEditableRow(empObj);
    return columnKeys.map(key => {
      if ((key === 'hire_date' || key === 'terminate_date') && empObj[key]) return empObj[key]?.slice(0, 10);
      return empObj[key] ?? '';
    });
  });

  if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative" p={4}>
      <input
        type="text"
        placeholder="Search employees..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 w-full"
      />

      {!addE && (
        <HStack justify="flex-end" mt={4}>
          <IconButton 
            icon={<AddIcon />}
            size="lg"
            colorScheme="green"
            bg="#3A6F43"
            color="white"
            borderRadius="full"
            boxShadow="lg"
            aria-label="Add Employee"
            onClick={() => showAddE(true)}
            _hover={{ bg: "#2d5734", transform: "scale(1.1)" }}
            _active={{ transform: "scale(0.95)" }}
            transition="all 0.2s"
          />
        </HStack>
      )}

      <DataTable
        title="Employees"
        columns={EAttr}
        data={displayData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSave={editingId ? handleSave : null}
        onCancel={editingId ? handleCancel : null}
        editingId={editingId}
      />

      {addE && (
        <ScaleFade initialScale={0.8} in={addE}>
          <div ref={addFormRef} className="w-full mt-4">
            <AddE onClose={handleCloseAdd} />
          </div>
        </ScaleFade>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <WarningIcon color="red.500" boxSize={5} />
              Delete Employee
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>
                Are you sure you want to delete{' '}
                <Text as="span" fontWeight="bold" color="red.600">
                  {deleteTarget?.name}
                </Text>
                ?
              </Text>
              <Text mt={2} fontSize="sm" color="gray.600">This action cannot be undone.</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} _hover={{ bg: 'red.600' }}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Employees;
