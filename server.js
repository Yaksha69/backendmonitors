require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ably = require('ably');

// Import your data routes
const dataRoutes = require('./routes/dataRoutes');
const Data = require('./models/Data');

const app = express();
app.use(cors({
    origin: '*', // Your frontend URL
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

        // Ably client setup
        const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
        const channel = ably.channels.get('voltage-data');

        // Function to send data to Ably
        const sendDataToAbly = async () => {
            try {
                // Fetch the most recent data from the database
                const data = await Data.find().sort({ createdAt: -1 }).limit(1);
                if (data.length > 0) {
                    const latestData = data[0];  // Get the latest data from the DB
                    const formattedData = {
                        voltage: latestData.voltage,
                        current: latestData.current,
                        power: latestData.power,
                        energy: latestData.energy,
                        createdAt: latestData.createdAt
                    };

                    // Publish the formatted data to the Ably channel
                    channel.publish('new-data', formattedData);
                    console.log('Sent data to Ably:', formattedData);  // Log to check if data is being sent
                }
            } catch (error) {
                console.error('Error fetching data from database:', error);
            }
        };

        // Send the latest data to Ably every 2 seconds
        setInterval(sendDataToAbly, 2000);  // Adjust the interval as needed

    })
    .catch(err => {
        console.log(err);
    });

// Set up your data routes
const requestMapper = '/api/v1';
app.use(requestMapper + '/data', dataRoutes);

// Handle 404 errors for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
