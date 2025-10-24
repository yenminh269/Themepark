// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./components/layouts/login/AuthContext.jsx";
import { CartProvider } from "./components/layouts/customer/CartContext.jsx";
import './App.css';
import HomePage from "./components/layouts/customer/HomePage.jsx";
import LoginPage from "./components/layouts/login/LoginPage.jsx";
import TicketsPage from "./components/layouts/customer/TicketsPage.jsx";
import CheckoutPage from "./components/layouts/customer/CheckoutPage.jsx";
import ConfirmationPage from "./components/layouts/customer/ConfirmationPage.jsx";
import UserInfoPage from "./components/layouts/customer/UserInfoPage.jsx";
import SignUp from './components/layouts/login/Signup.jsx';
import Login from './components/layouts/login/Login.jsx';
import AdminMain from './components/layouts/admin/AdminMain.jsx';
import ManagerPage from  "./components/layouts/Manager/ManagerPage.jsx";
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export default function App() {
  const [isAdmin, setAdmin] = useState(false);

  // Temporary debug - remove after testing
  console.log("App component rendering, isAdmin:", isAdmin);

  return (
    <AuthProvider>
      <CartProvider>
        <ChakraProvider value={defaultSystem}>
          <Router>
            {isAdmin ? (
              <Routes>
                <Route path="/admin/*" element={<AdminMain/>} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/manager" element={<ManagerPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="/userinfo" element={<UserInfoPage />} />
                <Route path="/admin" element={<Login setAdmin={setAdmin} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </Router>
        </ChakraProvider>
      </CartProvider>
    </AuthProvider>
  );
}