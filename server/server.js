const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartaquarv2');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB - SmartAquarv2 Database');
});

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'SmartAquarv2 Backend connected successfully!' });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/v1', authRoutes);

// Protected route example
const auth = require('./middleware/auth');
app.get('/api/v1/profile', auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      credit: req.user.credit,
      roles: req.user.roles
    },
    message: 'Profile retrieved successfully'
  });
});


const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});