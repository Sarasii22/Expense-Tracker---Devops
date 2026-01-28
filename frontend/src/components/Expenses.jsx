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
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');

  const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchExpenses();
  }, [user, navigate, categoryFilter, periodFilter]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          period: periodFilter !== 'All' ? periodFilter : undefined,
        },
      });
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
        await axios.put(`/api/expenses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        await axios.post('/api/expenses', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    setCategoryFilter('All');
    setPeriodFilter('All');
  };

  // Calculate total for dashboard
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);

  // Get badge class for category
  const getCategoryBadgeClass = (cat) => `badge badge-${cat.toLowerCase()} text-white`;

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Expenses Dashboard</h2>
      <button className="btn btn-secondary mb-3" onClick={logout}>Logout</button>

      <h3 className="mt-4">{editingId ? 'Update' : 'Add'} Expense</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <select
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <h3>Filters</h3>
      <div className="row mb-3">
        <div className="col-md-4">
          <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-control" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="All">All Periods</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
        <div className="col-md-4">
          <button className="btn btn-outline-primary w-100" onClick={handleViewAll}>View All Expenses</button>
        </div>
      </div>

      <h3>Expense Table</h3>
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Date/Time</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp._id}>
              <td>{new Date(exp.date).toLocaleString()}</td>
              <td>{exp.description}</td>
              <td>${exp.amount}</td>
              <td>
                <span className={getCategoryBadgeClass(exp.category)}>{exp.category}</span>
              </td>
              <td>
                <button className="btn btn-sm btn-warning mr-5" onClick={() => handleEdit(exp)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-expenses">
        Total Expenses: ${totalExpenses}
      </div>
    </div>
  );
};

export default Expenses;