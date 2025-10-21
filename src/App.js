import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ManagerPage from "./pages/ManagerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ManagerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
