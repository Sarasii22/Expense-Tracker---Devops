import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from '../src/components/Login/Login';
import Signup from '../src/components/Signup/Signup';
import Expenses from '../src/components/Expenses';
import { AuthProvider } from '../src/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/" element={
              <div className="welcome-container">
                <div className="welcome-content">
                  <div className="welcome-icon">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                  <h1 className="welcome-title">Welcome to Expense Tracker!</h1>
                  <p className="welcome-subtitle">Track your finances, achieve your goals, and take control today.</p>
                  <a href="/login" className="welcome-cta">Get Started</a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;