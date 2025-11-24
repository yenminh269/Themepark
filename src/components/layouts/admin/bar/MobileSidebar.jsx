import { Box, VStack, Text, HStack, Icon } from "@chakra-ui/react"
import { NavLink, useLocation } from "react-router-dom"
import entities from './entities'

export default function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const routes = entities;

  const isActiveRoute = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.includes(path)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <Box position="fixed" top="0"
        left="0" w="100vw"  h="100vh"
        bg="blackAlpha.600"
        zIndex="998"
        onClick={onClose}
      />

      {/* Dropdown Content */}
      <Box position="fixed"
        top="72px" left="0"
        right="0" bg="#424c3dff"
        zIndex="999" maxH="calc(100vh - 72px)"
        overflowY="auto" boxShadow="lg"
        borderBottomRadius="xl" p="20px"
        animation="slideDown 0.3s ease"
      >
        <VStack align="stretch" gap="5px">
          {routes.map((route, index) => {
            if (route.category) {
              return (
                <Text  key={index}
                  fontSize="xs"
                  color="#B2C9AD"
                  fontWeight="bold"
                  mt={index === 0 ? "0px" : "20px"}  mb="10px"
                  px="10px"
                >{route.category}
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
                  _hover={{ bg: isActive ? "#EEEFE0" : "whiteAlpha.200" }}
                  transition="all 0.2s"
                >
                  <Icon
                    as={route.icon}
                    w="20px"
                    h="20px"
                    color={isActive ? "#8bb289ff" : "#EEEFE0"} />
                  <Text fontSize="md" fontWeight={isActive ? "bold" : "normal"}
                    color={isActive ? "#4B5945" : "#EEEFE0"}
                    flex="1" className="p-0 m-0"
                  >{route.name}
                  </Text>
                </HStack>
              </NavLink>
            )
          })}
        </VStack>
      </Box>
    </>
  )
}
