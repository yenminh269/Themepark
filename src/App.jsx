import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./components/layouts/customer/AuthContext.jsx";
import { CartProvider } from "./components/layouts/customer/CartContext.jsx";
import Navbar from './components/layouts/public/Navbar.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './components/layouts/public/Signup.jsx';
import Login from './components/layouts/public/Login.jsx';
import Logout from './components/layouts/public/Logout.jsx';
import ChangePassword from './components/layouts/public/ChangePassword.jsx';
import AdminMain from './components/layouts/admin/AdminMain.jsx';
import EMaintenance from './components/layouts/employee-maintenance/EMaintenance.jsx';
import HomePage from './components/layouts/customer/HomePage.jsx';
import TicketsPage from './components/layouts/customer/TicketsPage.jsx';
import CheckoutPage from './components/layouts/customer/CheckoutPage.jsx';
import ConfirmationPage from './components/layouts/customer/ConfirmationPage.jsx';
import UserInfoPage from './components/layouts/customer/UserInfoPage.jsx';
import StoresPage from './components/layouts/customer/StoresPage.jsx';
import StorePage from './components/layouts/customer/StorePage.jsx';
import ManagerPage from './components/layouts/Manager/ManagerPage.jsx';
import EmployeeDashboard from './components/layouts/employee/EmployeeDashboard.jsx';
import ProtectedRoute from './components/layouts/public/ProtectedRoute.jsx';

// Component to conditionally render Navbar based on route
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/admin') || location.pathname === '/manager' ||
  location.pathname === '/sales' || location.pathname === '/maintenance' || location.pathname === '/change-password';

 return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* ===== PUBLIC ROUTES (No Authentication Required) ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* ===== CUSTOMER ROUTES (Require Customer Authentication) ===== */}
        {/* Store browsing (public) */}
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/store/:storeId" element={<StorePage />} />

        {/* Protected customer features */}
        <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
        <Route path="/userinfo" element={<ProtectedRoute><UserInfoPage /></ProtectedRoute>} />
        {/* Redirect old store-checkout route to unified checkout */}
        <Route path="/store-checkout" element={<Navigate to="/checkout" replace />} />

        {/* ===== EMPLOYEE ROUTES (Require Employee Authentication) ===== */}
        <Route path="/sales" element={<ProtectedRoute type="employee" allowedRoles={['Sales Employee']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute type="employee" allowedRoles={['Mechanical Employee']}><EMaintenance /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute type="employee" allowedRoles={['Store Manager', 'General Manager']}><ManagerPage /></ProtectedRoute>} />

        {/* ===== General Manager ROUTES (Protected by AdminMain component internally) ===== */}
        <Route path="/admin/*" element={<ProtectedRoute type="employee" allowedRoles={['General Manager']}><AdminMain /></ProtectedRoute>} />

        {/* ===== CATCH-ALL ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
            position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          />
</>
);
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
