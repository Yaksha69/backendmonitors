require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dataRoutes = require('./routes/dataRoutes');

const app = express();
app.use(cors({
    origin: '*', // Update this with your frontend URL for better security
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to the database...');
            console.log('Listening on port ', process.env.PORT);
        });
    })
    .catch(err => {
        console.log(err);
    });

// Set up your data routes
const requestMapper = '/api/v1';
app.use(requestMapper + '/data', dataRoutes);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
