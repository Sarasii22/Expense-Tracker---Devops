import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signup', formData);
      login(res.data.token);
      setMessage('Signup successful!');
      navigate('/expenses');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error signing up');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="card-header">
          <div className="signup-icon">
            <i className="fas fa-user-plus text-white"></i>
          </div>
          <h2 className="mb-0">Join Us Today</h2>
          <p className="signup-subtitle">Start tracking your expenses effortlessly</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-user me-2"></i>Username
              </label>
              <input 
                type="text" 
                name="username" 
                className="form-control form-control-lg" 
                onChange={handleChange} 
                required 
              />
            </div>
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
                minLength="6" 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              <i className="fas fa-rocket me-2"></i>Get Started
            </button>
          </form>
          {message && <div className={`mt-3 alert alert-${message.includes('successful') ? 'success' : 'danger'}`} role="alert">{message}</div>}
          <div className="mt-4 text-center">
            <p>Already have an account? <a href="/login" className="text-primary fw-semibold">Sign In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;