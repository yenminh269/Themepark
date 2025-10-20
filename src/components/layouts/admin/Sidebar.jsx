import { Box, Flex, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import entities from '../../docs/entities'

const Sidebar = () => {
  const location = useLocation();

  const routes = entities;

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.includes(path); //check if location pathname include any substring from it
  };

  const SidebarContent = () => (
    <Flex direction="column" h="100%" pt="25px" px="14px">
      <Box mb="10px" px="20px">
        <Flex alignItems="center" gap="10px">
          <Box color="#A7C1A8">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-roller-coaster-icon lucide-roller-coaster"><path d="M6 19V5"/><path d="M10 19V6.8"/><path d="M14 19v-7.8"/><path d="M18 5v4"/><path d="M18 19v-6"/><path d="M22 19V9"/><path d="M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65"/></svg>
          </Box>
          <Text className="mt-2" fontSize="3xl" fontWeight="bold" color="#A7C1A8">
            Theme Park
          </Text>
        </Flex>
        <Text fontSize="16px" color="#EEEFE0" mt="5px">
          Management System
        </Text>
      </Box>

      {/* Navigation Links */}
      <VStack align="stretch" gap="5px" px="10px" flex="1" overflowY="auto" pb="20px">
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
            <NavLink key={index} to={route.path} style={{ textDecoration: 'none' }}>
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
                  className='mt-3'
                  fontSize="m"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  color={isActive ? ' #4B5945' : '#EEEFE0'}
                  flex="1"
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
    <Box
      position="fixed"
      h="100vh"
      w="280px"
      bg=" #424c3dff"
      display={{ base: 'none', lg: 'block' }}>
      <SidebarContent />
    </Box>
  );
};

export default Sidebar;
