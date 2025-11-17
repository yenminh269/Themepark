import DataTable from '../../../data-table/DataTable';
import { api } from '../../../../services/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import Loading from '../loading/Loading';
import { Box, IconButton, HStack, ScaleFade, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Text, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon, WarningIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AddE from './AddE';

function Employees() {
  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [addE, showAddE] = useState(false);
  const [showActive, setShowActive] = useState(true); // true = active, false = terminated
  const [visibleSSNs, setVisibleSSNs] = useState(new Set()); // Track which employee SSNs are visible
  const [visibleEditSSNs, setVisibleEditSSNs] = useState(new Set()); // Track visible SSNs in edit mode
  const addFormRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  const allEAttr = ['Emp_Id', 'First Name', 'Last Name', 'Gender', 'Email', 'Job Title', 'Phone', 'SSN', 'Hire Date', 'Terminate Date'];
  const allColumnKeys = ['employee_id', 'first_name', 'last_name', 'gender', 'email', 'job_title', 'phone', 'ssn', 'hire_date', 'terminate_date'];

  // Dynamic columns based on active/terminated filter
  const EAttr = useMemo(() => {
    if (showActive) {
      // Exclude "Terminate Date" for active employees
      return allEAttr.filter(attr => attr !== 'Terminate Date');
    }
    return allEAttr;
  }, [showActive]);

  const columnKeys = useMemo(() => {
    if (showActive) {
      // Exclude "terminate_date" for active employees
      return allColumnKeys.filter(key => key !== 'terminate_date');
    }
    return allColumnKeys;
  }, [showActive]);

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
    // First filter by active/terminated status
    let filtered = emp.filter(empObj => {
      if (showActive) {
        // Show only active employees (terminate_date is null)
        return empObj.terminate_date === null || empObj.terminate_date === '';
      } else {
        // Show only terminated employees (terminate_date is not null)
        return empObj.terminate_date !== null && empObj.terminate_date !== '';
      }
    });

    // Then apply search filter
    if (!searchText) return filtered;
    const normalizedSearch = searchText.toLowerCase().replace(/\s+/g, '');
    return filtered.filter(empObj =>
      columnKeys.some(key => {
        const value = empObj[key]?.toString().toLowerCase().replace(/\s+/g, '');
        return value && value.includes(normalizedSearch);
      })
    );
  }, [emp, searchText, showActive]);

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
    setVisibleEditSSNs(new Set());
  };

  const handleInputChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSSNVisibility = (employeeId) => {
    setVisibleSSNs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const toggleEditSSNVisibility = (employeeId) => {
    setVisibleEditSSNs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
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
      if (key === 'first_name' || key === 'last_name' || key === 'gender') inputWidth = '100px';

      if (key === 'hire_date' || key === 'terminate_date') {
        return (
          <input
            type="date"
            value={editedData[key]?.slice(0, 10) || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded px-3 py-2 text-sm md:text-base"
            style={{ width: '150px' }}
          />
        );
      }

      if (key === 'gender') {
        return (
          <select
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded px-2 py-2 text-sm md:text-base"
            style={{ width: inputWidth }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        );
      }
      
      if (key === 'job_title') {
        return  (
          <select
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded px-2 py-2 text-sm md:text-base"
            style={{ width: inputWidth }}
          >
            <option value="General Manager">General Manager</option>
            <option value="Store Manager">Store Manager</option>
            <option value="Sales Employee">Sales Employee</option>
            <option value="Mechanical Employee">Mechanical Employee</option>
          </select>
        );
      }

      if(key === 'ssn'){
        const isVisible = visibleEditSSNs.has(editingId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type={isVisible ? 'text' : 'password'}
              value={editedData[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border rounded px-2 py-2 text-sm md:text-base"
              pattern="\d{9}"
              maxLength={9}
              feedback="SSN must be exactly 9 digits."
              style={{ width: '100px'}}
            />
            <button
              type="button"
              onClick={() => toggleEditSSNVisibility(editingId)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isVisible ? 'Hide SSN' : 'Show SSN'}
            >
              {isVisible ? <ViewOffIcon boxSize={4} /> : <ViewIcon boxSize={4} />}
            </button>
          </div>
        );
      }

      if(key === 'phone'){
        return (
          <input
            type="text"
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, formatPhoneNumber(e.target.value))}
            className="border rounded px-2 py-2 text-sm md:text-base"
            maxLength={12}
            style={{ width: '120px' }}
          />
        );
      }

      return (
        <input
          type={key === 'email' ? 'email' : 'text'}
          value={editedData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="border rounded px-2 py-2 text-sm md:text-base"
          style={key === 'email' ? { width: '240px' } : { width: inputWidth }}
          placeholder={EAttr[index]}
        />
      );
    });
  };

  const displayData = filteredData.map(empObj => {
    if (editingId === empObj.employee_id) return renderEditableRow(empObj);
    return columnKeys.map(key => {
      if ((key === 'hire_date' || key === 'terminate_date') && empObj[key]) return empObj[key]?.slice(0, 10);

      // Handle SSN display with click-to-reveal
      if (key === 'ssn') {
        const isVisible = visibleSSNs.has(empObj.employee_id);
        return (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleSSNVisibility(empObj.employee_id);
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              padding: '3px 0px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title={isVisible ? 'Click to hide' : 'Click to reveal SSN'}
          >
            {isVisible ? empObj[key] : '••••••'}
          </span>
        );
      }
      return empObj[key] ?? '';
    });
  });

  if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative">
      <input
        type="text"
        placeholder="Search employees..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 w-full"
      />

      <HStack justify="space-between" mt={4}>
        {/* Toggle button for active/terminated filter */}
        <HStack spacing={2}>
          <Button
            size="sm"
            bg={showActive ? "#4682A9":"transparent"}   // your custom green
            color={showActive ? "white" : "black"}
            border={showActive ? "none" : "1px solid black"}
            _hover={{ bg: showActive ? "#145A6B" : "gray.300" }}
            onClick={() => setShowActive(true)}
            variant="solid"
          >
            Active ({emp.filter(e => e.terminate_date === null || e.terminate_date === '').length})
          </Button>

          <Button
            size="sm"
            bg={!showActive ? "#E74C3C" : "transparent"} 
            color={!showActive ? "white" : "black"}
            border={!showActive ? "none" : "1px solid black"}
            _hover={{ bg: !showActive ? "#C0392B" : "gray.200" }}
            onClick={() => setShowActive(false)}
            variant="solid"
          >
            Terminated ({emp.filter(e => e.terminate_date !== null && e.terminate_date !== '').length})
        </Button>

        </HStack>

        {!addE && (
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
        )}
      </HStack>

      <DataTable
        title="Manage Employees"
        columns={EAttr}
        data={displayData}
        onEdit={showActive? handleEdit:null}
        onDelete={showActive? handleDelete:null}
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
