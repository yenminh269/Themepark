import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './components/layouts/login/Signup.jsx';
import Login from './components/layouts/login/Login.jsx';
import AdminMain from './components/layouts/admin/AdminMain.jsx';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useState } from 'react';
import EMaintenance from './components/layouts/employee-maintenance/EMaintenance.jsx'
function App() {
  const [isAdmin, setAdmin] = useState(true); // force admin for testing

  return (
    <Router>
      {isAdmin ? (
        <ChakraProvider value={defaultSystem}>
          <AdminMain/>
        </ChakraProvider>
      ) : (
        <Routes>
          <Route path="/admin" element={<Login setAdmin={setAdmin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
