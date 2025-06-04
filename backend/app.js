const express = require('express');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

//middleware
app.use(express.json());

//cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/registrations', registrationRoutes);
app.use('/payments', paymentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportRoutes);

//test
app.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is work' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
