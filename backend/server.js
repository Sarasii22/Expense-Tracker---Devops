const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

dotenv.config();
connectDB();

const app = express();
app.use(cors()); // Allow frontend origin
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));