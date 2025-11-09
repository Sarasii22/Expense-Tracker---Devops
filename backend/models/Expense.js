const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'Food', 'Transport'
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);