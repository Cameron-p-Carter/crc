const express = require('express');
const personRoutes = require('./routes/personRoutes');

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
app.use('/persons', personRoutes);

//test
app.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is work' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
