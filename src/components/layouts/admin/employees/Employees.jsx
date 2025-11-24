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

  // For permanent delete confirmation
  const { isOpen: isOpenPermanent, onOpen: onOpenPermanent, onClose: onClosePermanent } = useDisclosure();
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const cancelPermanentRef = useRef();

  // For reset password modal
  const { isOpen: isOpenResetPassword, onOpen: onOpenResetPassword, onClose: onCloseResetPassword } = useDisclosure();
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [newTempPassword, setNewTempPassword] = useState(null);
  const cancelResetPasswordRef = useRef();

  const allEAttr = ['Emp_Id', 'First Name', 'Last Name', 'Gender', 'Email', 'Job Title', 'Phone', 'SSN', 'Salary', 'Hire Date', 'Terminate Date'];
  const allColumnKeys = ['employee_id', 'first_name', 'last_name', 'gender', 'email', 'job_title', 'phone', 'ssn', 'salary', 'hire_date', 'terminate_date'];

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
        title: 'Employee terminated',
        description: `${deleteTarget.name} has been terminated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to terminate employee.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeTermination = async (id, row) => {
    try {
      setLoading(true);
      await api.revokeEmployeeTermination(id);
      await fetchEmployees();
      toast({
        title: 'Termination revoked',
        description: `${row[1]} ${row[2]} has been reinstated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to revoke termination.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = (id, row) => {
    setPermanentDeleteTarget({ id, name: `${row[1]} ${row[2]}` });
    onOpenPermanent();
  };

  const confirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    onClosePermanent();
    const targetName = permanentDeleteTarget.name;
    setPermanentDeleteTarget(null);
    try {
      setLoading(true);
      await api.permanentDeleteEmployee(permanentDeleteTarget.id);
      await fetchEmployees();
      toast({
        title: 'Employee deleted permanently',
        description: `${targetName} has been permanently deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to permanently delete employee.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id, row) => {
    try {
      setLoading(true);
      const result = await api.resetEmployeePassword(id);
      setNewTempPassword(result.temporaryPassword);
      setResetPasswordTarget({ id, name: `${row[1]} ${row[2]}`, email: row[4] });
      onOpenResetPassword();

      toast({
        title: 'Password Reset',
        description: `Password has been reset for ${row[1]} ${row[2]}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset password.',
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

      if(key === 'salary'){
        return (
          <input
            type="number"
            step="0.01"
            min="0"
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="border rounded  py-2 text-sm md:text-base"
            style={{ width: '80px' }}
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

      // Format salary as currency
      if (key === 'salary') {
        const salary = parseFloat(empObj[key]);
        return !isNaN(salary) ? `$${salary.toFixed(2)}` : '$0.00';
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

      <HStack justify="space-between" mt={4} mb={3}>
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
            Terminated ({emp.filter(e => e.terminate_date !== null).length})
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
        onRevoke={!showActive ? handleRevokeTermination : null}
        onPermanentDelete={!showActive ? handlePermanentDelete : null}
        onResetPassword={!showActive ? handleResetPassword : null}
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
              Terminate Employee
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>
                Are you sure you want to terminate{' '}
                <Text as="span" fontWeight="bold" color="red.600">
                  {deleteTarget?.name}
                </Text>
                ?
              </Text>
              <Text mt={2} fontSize="sm" color="gray.600">This will set their termination date to today.</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} _hover={{ bg: 'red.600' }}>Terminate</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isOpenPermanent}
        leastDestructiveRef={cancelPermanentRef}
        onClose={onClosePermanent}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <WarningIcon color="red.500" boxSize={5} />
              Delete Employee Permanently
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>
                Are you sure you want to permanently delete{' '}
                <Text as="span" fontWeight="bold" color="red.600">
                  {permanentDeleteTarget?.name}
                </Text>
                ?
              </Text>
              <Text mt={2} fontSize="sm" color="red.600" fontWeight="semibold">
                This action cannot be undone. All employee data will be permanently removed.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelPermanentRef} onClick={onClosePermanent} variant="ghost">Cancel</Button>
              <Button colorScheme="red" onClick={confirmPermanentDelete} ml={3} _hover={{ bg: 'red.700' }}>
                Delete Forever
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isOpenResetPassword}
        leastDestructiveRef={cancelResetPasswordRef}
        onClose={() => {
          onCloseResetPassword();
          setResetPasswordTarget(null);
          setNewTempPassword(null);
        }}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              🔑 Password Reset Successfully
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                The password for{' '}
                <Text as="span" fontWeight="bold" color="blue.600">
                  {resetPasswordTarget?.name}
                </Text>
                {' '}has been reset.
              </Text>

              <Box bg="orange.50" p={4} borderRadius="md" border="2px solid" borderColor="orange.300" mb={3}>
                <Text fontSize="sm" fontWeight="bold" color="orange.800" mb={2}>
                  ⚠️ Temporary Password (shown only once):
                </Text>
                <Text
                  bg="white"
                  p={3}
                  borderRadius="md"
                  fontFamily="monospace"
                  fontSize="lg"
                  fontWeight="bold"
                  className='!text-black'
                  border="1px solid"
                  borderColor="orange.200"
                  textAlign="center"
                  userSelect="all"
                >
                  {newTempPassword}
                </Text>
                <Text fontSize="xs" color="orange.700" mt={2}>
                  Click the password above to copy it. Share this with the employee securely.
                </Text>
              </Box>

              <Box bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <strong>📧 Email:</strong> {resetPasswordTarget?.email || 'N/A'}
                </Text>
                <Text fontSize="sm" color="blue.800" mt={1}>
                  <strong>Note: </strong> The employee will be required to change this password on their first login.
                </Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelResetPasswordRef}
                onClick={() => {
                  onCloseResetPassword();
                  setResetPasswordTarget(null);
                  setNewTempPassword(null);
                }}
                colorScheme="blue"
                _hover={{ bg: 'blue.600' }}
              >
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Employees;
