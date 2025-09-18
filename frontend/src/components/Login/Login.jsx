import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      setMessage('Login successful! Token: ' + res.data.token);
      // Store token: localStorage.setItem('token', res.data.token);
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