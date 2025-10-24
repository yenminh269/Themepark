import { Routes, Route } from "react-router-dom";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import RideList from "./RideList.jsx";
import Sidebar from "./Sidebar.jsx";
import MobileSidebar from "./MobileSidebar.jsx";
import AddNewRide from "./AddNewRide.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import './AdminMain.css'

function AdminMain() {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  function toggleDropdown() {
    setIsExpanded((prev) => !prev);
  }

  if (!isMobile && isExpanded) setIsExpanded(false);

  return (
    <Flex h="100vh"  w="100vw" overflow="hidden" bg="#D1D8BE">
      {/* Sidebar */}
      <Box
        w={{ base: "0", lg: "280px" }}
        bg="#4B5945"
        color="white"
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        display={{ base: "none", lg: "block" }}
      >
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box
        ml={{ base: 0, lg: "280px" }}
        w={{ base: "100%", lg: "calc(100% - 280px)" }}
        h="100vh"
        overflowY="auto"
        className="custom-scrollbar"
      >
        {/* Mobile Header */}
        {isMobile && (
          <Box
            display="flex"
            position="sticky"
            top="0"
            bg="#4B5945"
            p="16px"
            zIndex="10"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Box fontSize="2xl" fontWeight="bold" color="#A7C1A8">
                Theme Park
              </Box>
              <Box fontSize="14px" color="#EEEFE0">
                Management System
              </Box>
            </Box>

            <button onClick={toggleDropdown}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A7C1A8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m16 10-4 4-4-4" />
              </svg>
            </button>
          </Box>
        )}

        {isMobile && (
          <MobileSidebar
            isOpen={isExpanded}
            onClose={() => setIsExpanded(false)}
          />
        )}

        {/* ✅ Routed content scrolls inside this area */}
        <Box p="40px">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="rides/add" element={<AddNewRide />} />
            <Route path="rides/list" element={<RideList />} />
            <Route path="maintenance/add" element={<Box>Add Maintenance Page</Box>} />
            <Route path="employees" element={<Box>Manage Employees Page</Box>} />
          </Routes>
        </Box>
      </Box>
    </Flex>
  );
}

export default AdminMain;
