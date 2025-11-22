import { Box, VStack, Text, HStack, Icon } from "@chakra-ui/react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { MdLogout, MdCheck, MdClose } from 'react-icons/md'
import { useState, useEffect } from 'react'
import entities from './entities'

export default function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [managerInfo, setManagerInfo] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const employeeData = localStorage.getItem('employee_info')
    if (employeeData) {
      try {
        const parsed = JSON.parse(employeeData)
        setManagerInfo(parsed)
      } catch (error) {
        console.error('Error parsing employee data:', error)
      }
    }
  }, [])

  const handleLogoutClick = () => {
    if (showLogoutConfirm) {
      localStorage.removeItem('employee_info')
      navigate('/login')
    } else {
      setShowLogoutConfirm(true)
    }
  }

  const routes = entities;

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.includes(path)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        bg="blackAlpha.600"
        zIndex="998"
        onClick={onClose}
      />

      {/* Dropdown Content */}
      <Box
        position="fixed"
        top="72px"
        left="0"
        right="0"
        bg="#424c3dff"
        zIndex="999"
        maxH="calc(100vh - 72px)"
        overflowY="auto"
        boxShadow="lg"
        borderBottomRadius="xl"
        p="20px"
        animation="slideDown 0.3s ease"
      >
        <VStack align="stretch" gap="5px">
          {routes.map((route, index) => {
            if (route.category) {
              return (
                <Text
                  key={index}
                  fontSize="xs"
                  color="#B2C9AD"
                  fontWeight="bold"
                  mt={index === 0 ? "0px" : "20px"}
                  mb="10px"
                  px="10px"
                >
                  {route.category}
                </Text>
              )
            }

            const isActive = isActiveRoute(route.path)

            return (
              <NavLink
                key={index}
                to={route.path}
                onClick={onClose}
                style={{ textDecoration: "none" }}
              >
                <HStack
                  py="10px"
                  px="15px"
                  borderRadius="10px"
                  bg={isActive ? "#EEEFE0" : "transparent"}
                  _hover={{ bg: isActive ? "#EEEFE0" : "whiteAlpha.100" }}
                  transition="all 0.2s"
                >
                  <Icon
                    as={route.icon}
                    w="20px"
                    h="20px"
                    color={isActive ? "#8bb289ff" : "#EEEFE0"}
                  />
                  <Text
                    fontSize="md"
                    fontWeight={isActive ? "bold" : "normal"}
                    color={isActive ? "#4B5945" : "#EEEFE0"}
                    flex="1"
                  >
                    {route.name}
                  </Text>
                </HStack>
              </NavLink>
            )
          })}
        </VStack>

        {/* Sidebar Footer */}
        {managerInfo && (
          <Box className="sidebar-footer" mt="20px">
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
      </Box>
    </>
  )
}
