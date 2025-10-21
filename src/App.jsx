// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import TicketsPage from "./pages/TicketsPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import UserInfoPage from "./pages/UserInfoPage"; // ✅ new import

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/userinfo" element={<UserInfoPage />} /> {/* ✅ new route */}
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
