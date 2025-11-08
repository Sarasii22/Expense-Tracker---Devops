const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();
app.use(cors()); // Allow frontend origin
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running!' });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));