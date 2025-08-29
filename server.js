require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./src/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files (for the web client)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const userRoutes = require('./src/routes/userRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

// Route for serving the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});