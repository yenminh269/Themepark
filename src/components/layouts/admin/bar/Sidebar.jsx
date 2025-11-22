import { Box, Flex, Text, VStack, HStack, Icon, IconButton } from '@chakra-ui/react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { MdLogout, MdCheck, MdClose } from 'react-icons/md';
import { useState, useEffect } from 'react';
import entities from './entities'

const Sidebar = ({ isOpen = true, onToggle, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [managerInfo, setManagerInfo] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const employeeData = localStorage.getItem('employee_info');
    if (employeeData) {
      try {
        const parsed = JSON.parse(employeeData);
        setManagerInfo(parsed);
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
  }, []);

  const handleLogoutClick = () => {
    if (showLogoutConfirm) {
      localStorage.removeItem('employee_info');
      navigate('/login');
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const routes = entities;

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.includes(path); //check if location pathname include any substring from it
  };

  const SidebarContent = () => (
    <Flex direction="column" h="100%" px="14px">
      <Box mb="8px" px="20px" >
        <Flex height='30' alignItems="center" gap="10px">
          <Box color="#A7C1A8">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-roller-coaster-icon lucide-roller-coaster"><path d="M6 19V5"/><path d="M10 19V6.8"/><path d="M14 19v-7.8"/><path d="M18 5v4"/><path d="M18 19v-6"/><path d="M22 19V9"/><path d="M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65"/></svg>
          </Box>
          <Text className='mt-4' fontSize="2xl" fontWeight="bold" color="#A7C1A8">
            Velocity Valley
          </Text>
        </Flex>
        <Text fontSize="18px" color="#EEEFE0" mt="8px">
          Management System
        </Text>
      </Box>

      {/* Navigation Links */}
      <VStack className="sidebar-scrollbar" align="stretch" gap="5px" px="8px" flex="1" overflowY="auto" pb="20px">
        {routes.map((route, index) => {
          if (route.category) {
            return (
              <Text
                key={index}
                fontSize="xs"
                color="#B2C9AD"
                fontWeight="bold"
                mt={index === 0 ? '0px' : '20px'}
                mb="10px"
                px="10px"
              >
                {route.category}
              </Text>
            );
          }

          const isActive = isActiveRoute(route.path);

          return (
            <NavLink key={index} to={route.path} onClick={onClose} style={{ textDecoration: 'none' }}>
              <HStack
                px="8px"
                borderRadius="10px"
                bg={isActive ? '#EEEFE0' : 'transparent'}
                _hover={{transform: isActive? 'translateY(0px)': 'translateY(-15px)'}}
                transition="all 0.2s"
                position="relative"
              >
                <Icon
                  as={route.icon}
                  w="20px"
                  h="20px"
                  color={isActive ? '#8bb289ff' : '#EEEFE0'}
                />
                <Text
                  className='mt-3 pb-0 mr-0'
                  fontSize="m"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  color={isActive ? ' #4B5945' : '#EEEFE0'}
                >
                  {route.name}
                </Text>

                {isActive && (
                  <Box
                    position="absolute"
                    right="0"
                    h="70%"
                    w="4px"
                    bg="#8bb289ff"
                    borderRadius="5px"
                  />
                )}
              </HStack>
            </NavLink>
          );
        })}
      </VStack>
    </Flex>
  );

  return (
    <>
      {/* Hamburger Button */}
      {!isOpen && (
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onToggle}
          position="fixed"
          left="0px"
          top="7px"
          zIndex="1000"
          bg="transparent"
          color="#4B5945"
          _hover={{ bg: 'rgba(10, 13, 9, 0.1)' }}
          display={{ base: 'none', lg: 'flex' }}
          aria-label="Toggle Sidebar"
        />
      )}

      {/* Sidebar */}
      {isOpen && (
        <Flex
          position="fixed"
          h="100vh"
          w="280px"
          bg="#424c3dff"
          display={{ base: 'none', lg: 'flex' }}
          direction="column"
          zIndex="999"
        >
          {/* Close Button */}
          <Flex justify="flex-end" p="8px" flexShrink="0">
            <IconButton
              icon={<CloseIcon />}
              onClick={onToggle}
              bg="transparent"
              color="#EEEFE0"
              _hover={{ bg: 'rgba(238, 239, 224, 0.1)' }}
              size="sm"
              aria-label="Close Sidebar"
            />
          </Flex>

          {/* Sidebar Content */}
          <Box flex="1" overflowY="hidden">
            <SidebarContent />
          </Box>

          {/* Sidebar Footer */}
          {managerInfo && (
            <Box className="sidebar-footer">
              <Box className="sidebar-profile">
                <Box className="profile-avatar">
                  {managerInfo.first_name?.[0]}{managerInfo.last_name?.[0]}
                </Box>
                <Box className="profile-info">
                  <Text className="profile-name">
                    {managerInfo.first_name} {managerInfo.last_name}
                  </Text>
                  <Text className="profile-title">{managerInfo.job_title}</Text>
                </Box>
              </Box>

              {!showLogoutConfirm ? (
                <button className="logout-button" onClick={handleLogoutClick}>
                  <MdLogout size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <Box className="logout-confirm">
                  <Text className="logout-text">Sure you want to logout?</Text>
                  <Box className="logout-actions">
                    <button className="btn-confirm-logout" onClick={handleLogoutClick}>
                      <MdCheck size={18} />
                      Yes
                    </button>
                    <button className="btn-cancel-logout" onClick={() => setShowLogoutConfirm(false)}>
                      <MdClose size={18} />
                      Cancel
                    </button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Flex>
      )}
    </>
  );
};

export default Sidebar;
