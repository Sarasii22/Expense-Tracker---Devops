import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      login(res.data.token);
      setMessage('Login successful!');
      navigate('/expenses');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-header">
          <div className="login-icon">
            <i className="fas fa-sign-in-alt text-white"></i>
          </div>
          <h2 className="mb-0">Welcome Back</h2>
          <p className="login-subtitle">Securely access your dashboard</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-envelope me-2"></i>Email
              </label>
              <input 
                type="email" 
                name="email" 
                className="form-control form-control-lg" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-lock me-2"></i>Password
              </label>
              <input 
                type="password" 
                name="password" 
                className="form-control form-control-lg" 
                onChange={handleChange} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              <i className="fas fa-arrow-right me-2"></i>Sign In
            </button>
          </form>
          {message && <div className={`mt-3 alert alert-${message.includes('successful') ? 'success' : 'danger'}`} role="alert">{message}</div>}
          <div className="mt-4 text-center">
            <p>New user? <a href="/signup" className="text-primary fw-semibold">Create Account</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;