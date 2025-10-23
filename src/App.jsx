import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/layouts/login/Signup.jsx';
import Login from './components/layouts/login/Login.jsx';
import AdminMain from './components/layouts/admin/AdminMain.jsx';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useState } from 'react';
import EMaintenance from './components/layouts/employee-maintenance/EMaintenance.jsx'
function App() {
  return (
    <Router>
      <ChakraProvider value={defaultSystem}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminMain />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/maintenance" element={<EMaintenance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ChakraProvider>
    </Router>

  );
}

export default App;
