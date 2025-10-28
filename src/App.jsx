import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from "./components/layouts/customer/AuthContext.jsx";
import { CartProvider } from "./components/layouts/customer/CartContext.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './components/layouts/login/Signup.jsx';
import Login from './components/layouts/login/Login.jsx';
import AdminMain from './components/layouts/admin/AdminMain.jsx';
import EMaintenance from './components/layouts/employee-maintenance/EMaintenance.jsx';
import HomePage from './components/layouts/customer/HomePage.jsx';
import TicketsPage from './components/layouts/customer/TicketsPage.jsx';
import CheckoutPage from './components/layouts/customer/CheckoutPage.jsx';
import ConfirmationPage from './components/layouts/customer/ConfirmationPage.jsx';
import UserInfoPage from './components/layouts/customer/UserInfoPage.jsx';
import ManagerPage from './components/layouts/Manager/ManagerPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/*Customer routes - Protected */}
              <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
              <Route path="/userinfo" element={<ProtectedRoute><UserInfoPage /></ProtectedRoute>} />

              {/*Maintenance employee route */}
              <Route path="/maintenance" element={<EMaintenance />} />

              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminMain />} />

              {/*Maintenance employee route */}
              <Route path="/manager" element={<ManagerPage />} />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
