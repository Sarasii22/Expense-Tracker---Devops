import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Expenses = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchExpenses();
  }, [user, navigate]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/expenses', { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingId) {
        await axios.put(`/api/expenses/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        setEditingId(null);
      } else {
        await axios.post('/api/expenses', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchExpenses();
      setFormData({ description: '', amount: '', category: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense) => {
    setFormData({ description: expense.description, amount: expense.amount, category: expense.category });
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Expenses</h2>
      <button className="btn btn-danger mb-3" onClick={logout}>Logout</button>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="form-control mb-2" />
        <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required className="form-control mb-2" />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Expense</button>
      </form>
      <ul className="list-group">
        {expenses.map(exp => (
          <li key={exp._id} className="list-group-item d-flex justify-content-between">
            {exp.description} - ${exp.amount} ({exp.category}) - {new Date(exp.date).toLocaleDateString()}
            <div>
              <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(exp)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;