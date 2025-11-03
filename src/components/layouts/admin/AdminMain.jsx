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
import RideGalleryWrapper from "./rides/RideGalleryWrapper.jsx";
import RainHistory from "./RainHistory.jsx";
import MostRiddenRide from "./reports/MostRidden.jsx";
import CustomerSummary from "./reports/CustomerSum.jsx";
import RideMaint from "./reports/RideMaint.jsx";
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
        w={{ base: "0", lg: "280px" }} bg="#4B5945"
        color="white" position="fixed"top="0"
        left="0" h="100vh"
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

        {/* Routed content scrolls inside this area */}
        <Box p="40px">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {/* Analysis Section */}
            <Route path="most-frequently-ridden-rides" element={<MostRiddenRide />} />
            <Route path="customer-summary" element={<CustomerSummary />} />
            <Route path="ride-report" element={<RideMaint />} />
             {/* Rides Section */}
            <Route path="add/ride" element={<Add />} />
            <Route path="view/rides" element={<RideGalleryWrapper />}/>
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
            {/* Employee Section */}
            <Route path="/employees" element={<Employees />} />
          </Routes>
        </Box>
      </Box>
    </Flex>
  );
}

export default AdminMain;
