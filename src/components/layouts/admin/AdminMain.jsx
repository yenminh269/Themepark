import { Routes, Route } from "react-router-dom";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import Sidebar from "./bar/Sidebar.jsx";
import MobileSidebar from "./bar/MobileSidebar.jsx";
import Add from "./Add.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import RideMaintenance from "./rides/RideMaintenance.jsx";
import Employees from "./employees/Employees.jsx";
import RideLists from "./rides/RideList.jsx";
import StoreLists from "./stores/StoreLists.jsx";
import MerchandiseLists from "./merchandise/MerchandiseLists.jsx";
import StoreInventoryLists from "./StoreInventoryLists.jsx";
import RainHistory from "./RainHistory.jsx";
import CustomerSummary from "./reports/CustomerSum.jsx";
import RideReport from "./reports/RideReport.jsx";
import MerchandiseReport from "./reports/Merchandise.jsx";
import AdminProfile from "./profile/AdminProfile.jsx";
import AdminLogout from "./AdminLogout.jsx";
import ZoneAssign from "./zone/ZoneAssign.jsx";
import RideExpansion from "./rides/RideExpansion.jsx";
import './AdminMain.css'

function AdminMain() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  function toggleDropdown() {
    setIsExpanded((prev) => !prev);
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  if (!isMobile && isExpanded) setIsExpanded(false);

  return (
    <Flex h="100vh"  w="100vw" overflow="hidden" bg="#D1D8BE">
      {/* Desktop Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onClose={closeSidebar}
      />

      {/* Main content area */}
      <Box
        ml={{ base: 0, lg: sidebarOpen ? "280px" : "0" }}
        w={{ base: "100%", lg: sidebarOpen ? "calc(100% - 280px)" : "100%" }}
        h="100vh"
        overflowY="auto"
        className="custom-scrollbar"
        transition="all 0.3s ease"
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
                Velocity Valley
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

        {/* Routed content scrolls inside this area */}
        <Box p="40px">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {/* Analysis Section */}
            <Route path="merchandise-report" element={<MerchandiseReport />} />
            <Route path="customer-summary" element={<CustomerSummary />} />
            <Route path="ride-report" element={<RideReport />} />
             {/* Rides Section */}
            <Route path="add/ride" element={<Add />} />
            <Route path="list/rides" element={<RideLists />} />
            {/* Stores Section */}
            <Route path="add/store" element={<Add store={true} />} />
            <Route path="list/stores" element={<StoreLists />} />
            {/* Merchandise Section */}
            <Route path="list/merchandise" element={<MerchandiseLists />} />
            <Route path="list/store-inventory" element={<StoreInventoryLists />} />
            <Route path="ride-maintenance" element={<RideMaintenance />} />
            {/* Rain Out Management */}
            <Route path="rain-out" element={<RainHistory />} />
            {/* Ride Expansion History */}
            <Route path="ride-expansion" element={<RideExpansion />} />
            {/* Zone Management */}
            <Route path="zone-assign" element={<ZoneAssign />} />
            {/* Employee Section */}
            <Route path="/employees" element={<Employees />} />
            {/* Profile Section */}
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/logout" element={<AdminLogout />} />
          </Routes>
        </Box>
      </Box>
    </Flex>
  );
}

export default AdminMain;
