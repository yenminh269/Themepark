import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useDisclosure
} from '@chakra-ui/react';

export default function AdminLogout() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Open the modal when the component mounts
    onOpen();
  }, [onOpen]);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);

    // Clear employee_info and other auth data from localStorage
    localStorage.removeItem('employee_info');
    localStorage.removeItem('customer_info');
    localStorage.removeItem('user_token');

    // Redirect to login page
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 500);
  };

  const handleCancel = () => {
    onClose();
    // Navigate back to the previous page or dashboard
    navigate('/admin', { replace: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="#EEEFE0" borderRadius="12px">
        <ModalHeader color="#4B5945" fontSize="xl" fontWeight="bold">
          Confirm Logout
        </ModalHeader>

        <ModalBody>
          <Text color="#4B5945" fontSize="md">
            Are you sure you want to log out? You will need to sign in again to access the admin panel.
          </Text>
        </ModalBody>

        <ModalFooter gap="12px">
          <Button
            variant="outline"
            onClick={handleCancel}
            isDisabled={isLoggingOut}
            borderColor="#8bb289"
            color="#4B5945"
            _hover={{ bg: '#D1D8BE' }}
          >
            Cancel
          </Button>
          <Button
            bg="#8bb289"
            color="white"
            onClick={handleConfirmLogout}
            isLoading={isLoggingOut}
            loadingText="Logging out..."
            _hover={{ bg: '#7a9e78' }}
          >
            Yes, Log Out
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
