const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const completionRoutes = require('./routes/completionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB (skipped during test/lint sanity checks that don't run this file)
connectDB();

const app = express();

app.use(helmet());

// In production, restrict CORS to the deployed frontend's origin(s) via
// CLIENT_URL (comma-separated for more than one, e.g. a Vercel prod URL
// plus its preview-deployment URL). Left unset, all origins are allowed -
// the default, so local development is unaffected.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : null;
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Habit Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve client build in production, if present (single-server deploy option)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Habit Tracker API is running. See /api/health');
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;