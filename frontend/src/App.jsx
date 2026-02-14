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
        <div className="container mt-5">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/" element={<h1>Welcome to personal expense tracker! <a href="/login">Login</a> </h1>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;