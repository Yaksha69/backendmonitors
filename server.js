// Existing imports and setup
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Data = require('./models/Data');

const app = express();
app.use(cors({
    origin: '*',
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

        // SSE endpoint
        app.get('/api/v1/data/events', (req, res) => {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders(); // Flush the headers to establish SSE connection

            // Function to periodically send data
            const sendData = async () => {
                try {
                    const data = await Data.find().sort({ createdAt: -1 }).limit(1);
                    if (data.length > 0) {
                        const latestData = data[0];
                        const formattedData = {
                            voltage: latestData.voltage,
                            current: latestData.current,
                            power: latestData.power,
                            energy: latestData.energy,
                            createdAt: latestData.createdAt
                        };

                        res.write(`data: ${JSON.stringify(formattedData)}\n\n`);
                    }
                } catch (error) {
                    console.error('Error fetching data for SSE:', error);
                }
            };

            // Send data every 2 seconds
            const interval = setInterval(sendData, 2000);

            // Clean up when the client disconnects
            req.on('close', () => {
                clearInterval(interval);
            });
        });
    })
    .catch(err => {
        console.log(err);
    });

// Your existing routes and error handling
const dataRoutes = require('./routes/dataRoutes');
app.use('/api/v1/data', dataRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
