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
      <div className="dashboard-header">
        <div className="header-left">
          <i className="fas fa-wallet me-2 text-white"></i>
          <h2 className="mb-0 text-white">Expense Tracker - Dashboard</h2>
        </div>
        <button className="btn btn-outline-secondary" onClick={logout}>
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>

      <div className="expense-card">
        <div className="card-header">
          <h3 className="mb-0"><i className="fas fa-plus-circle me-2"></i>{editingId ? 'Update' : 'Add'} Expense</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <input
                  className="form-control form-control-lg"
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <input
                  className="form-control form-control-lg"
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <select
                  className="form-control form-control-lg"
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
              <div className="col-md-2 mb-3">
                <button type="submit" className="btn btn-primary btn-lg w-100">
                  <i className="fas fa-save me-2"></i>{editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="filters-card">
        <div className="card-header">
          <h3 className="mb-0"><i className="fas fa-filter me-2"></i>Filters</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-2">
              <select className="form-control form-control-lg" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <select className="form-control form-control-lg" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                <option value="All">All Periods</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <button className="btn btn-outline-primary btn-lg w-100" onClick={handleViewAll}>
                <i className="fas fa-eye me-2"></i>View All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3 className="mb-0"><i className="fas fa-table me-2"></i>Expense Table</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
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
                    <td className="fw-bold text-white">${exp.amount}</td> {/* White amount */}
                    <td>
                      <span className={getCategoryBadgeClass(exp.category)}>{exp.category}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(exp)}>
                        <i className="fas fa-edit me-1"></i>Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp._id)}>
                        <i className="fas fa-trash me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="total-card">
        <div className="card-body text-center">
          <h4 className="text-white mb-0">Total Expenses: ${totalExpenses}</h4> {/* White total */}
          <p className="text-white-50">Stay on track with your spending</p>
        </div>
      </div>
    </div>
  );
};

export default Expenses;