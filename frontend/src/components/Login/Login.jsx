import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from 'C:/EC5207 DevOps Engineering/New folder/Expense-Tracker---Devops/frontend/src/AuthContext.js';
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
    <div className="card p-4">
      <h2 className="mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" name="password" className="form-control" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      {message && <p className="mt-3 alert alert-info">{message}</p>}
      <p className="mt-3">New user? <a href="/signup">Signup</a></p>
    </div>
  );
};

export default Login;