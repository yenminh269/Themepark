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
              
              {/*Customer route */}
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/userinfo" element={<UserInfoPage />} />

              {/*Maintenance employee route */}
              <Route path="/maintenance" element={<EMaintenance />} />

              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminMain />} />
              
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
