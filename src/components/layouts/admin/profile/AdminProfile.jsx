import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, Input, FormControl, FormLabel, useToast, VStack, HStack, Divider, Card, CardHeader, CardBody, Grid, GridItem } from '@chakra-ui/react';
import { MdPerson, MdEmail, MdPhone, MdWork, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { api } from '../../../../services/api';
import Loading from '../loading/Loading';

const AdminProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Get employee info from localStorage (set during login)
    const employeeData = localStorage.getItem('employee_info');

    if (!employeeData) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(employeeData);
      setEmployee(parsed);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing employee data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all password fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirmation do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: 'Same password',
        description: 'New password must be different from current password',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Use the verified password change endpoint
      await api.changeEmployeePasswordVerified(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: 'Success!',
        description: 'Password changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);

      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!employee) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="red.500">No employee data found</Text>
      </Box>
    );
  }

  return (
    <Box  mx="auto">
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Employee Information Card */}
        <GridItem>
          <Card bg="white" shadow="md" borderRadius="lg">
            <CardHeader bg="#4B5945" color="white" borderTopRadius="lg">
              <HStack>
                <MdPerson size={24} />
                <Heading mt={2} size="md">My Profile</Heading>
              </HStack>
            </CardHeader>
            
            <CardBody>
              <VStack align="stretch">
                <p className='!text-[#4B5945]'>
                    <strong>Employee ID: </strong> {employee.employee_id}
                </p>
                 <p className='flex !text-[#4B5945]'>
                   <MdPerson className='!mr-2 mt-1' color="#4B5945" />
                   <strong>Full Name: </strong> 
                   <div className='!ml-2'>{employee.first_name} {employee.last_name}</div>
                </p>
                <p className='flex !text-[#4B5945]'>
                  <MdWork  className='!mr-2 mt-1' color="#4B5945" />
                  <strong>Job Title:</strong><div className='!ml-2'>{employee.job_title}</div>
                </p>
                <p className='flex !text-[#4B5945]'>
                  <MdEmail className='!mr-2 mt-1' color="#4B5945" />
                  <strong>Email:</strong><div className='!ml-2'>{employee.email || 'Not provided'}</div>

                </p>
                <p className='flex !text-[#4B5945]'>
                  <MdPhone className='!mr-2 mt-1' color="#4B5945" />
                  <strong>Phone:</strong> <div className='!ml-2'>{employee.phone || 'Not provided'}</div>
                </p>
                 <p className='flex !text-[#4B5945]'>
                  <strong>Gender:</strong> <div className='!ml-2'>{employee.gender || 'Not provided'}</div>
                </p>
                <p className='flex !text-[#4B5945]'>
                  <strong>Hire Date:</strong> <div className='!ml-2'>{employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not provided'}</div>
                </p>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Change Password Card */}
        <GridItem>
          <Card bg="white" shadow="md" borderRadius="lg">
            <CardHeader bg="#4B5945" color="white" borderTopRadius="lg">
              <HStack>
                <MdLock size={24} />
                <Heading mt={2} size="md">Change Password</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordChange}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      Current Password
                    </FormLabel>
                    <HStack>
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        bg="gray.50"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: '#4B5945', boxShadow: '0 0 0 1px #4B5945' }}
                      />
                      <Button
                        onClick={() => togglePasswordVisibility('current')}
                        variant="ghost"
                        size="sm"
                        color="gray.600"
                      >
                        {showPasswords.current ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </Button>
                    </HStack>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      New Password
                    </FormLabel>
                    <HStack>
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min 8 characters)"
                        bg="gray.50"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: '#4B5945', boxShadow: '0 0 0 1px #4B5945' }}
                      />
                      <Button
                        onClick={() => togglePasswordVisibility('new')}
                        variant="ghost"
                        size="sm"
                        color="gray.600"
                      >
                        {showPasswords.new ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </Button>
                    </HStack>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      Confirm New Password
                    </FormLabel>
                    <HStack>
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        bg="gray.50"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: '#4B5945', boxShadow: '0 0 0 1px #4B5945' }}
                      />
                      <Button
                        onClick={() => togglePasswordVisibility('confirm')}
                        variant="ghost"
                        size="sm"
                        color="gray.600"
                      >
                        {showPasswords.confirm ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </Button>
                    </HStack>
                  </FormControl>

                  <Box
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.200"
                    borderRadius="md"
                    p={3}
                  >
                    <Text fontSize="sm" color="blue.800">
                      <strong>Password requirements:</strong>
                      <br />
                      • Minimum 8 characters
                      <br />
                      • Must be different from current password
                    </Text>
                  </Box>

                  <Button
                    type="submit"
                    bg="#4B5945"
                    color="white"
                    size="lg"
                    width="full"
                    isLoading={isChangingPassword}
                    loadingText="Changing Password..."
                    _hover={{ bg: '#5a6b3d' }}
                    _active={{ bg: '#3e4b2b' }}
                  >
                    Change Password
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AdminProfile;
