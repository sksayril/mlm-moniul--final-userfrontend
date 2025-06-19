import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Check for token in localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={() => setIsAuthenticated(true)} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Registration onRegister={() => setIsAuthenticated(true)} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard onLogout={() => setIsAuthenticated(false)} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;