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

        // Send data to Ably channel
        const sendDataToAbly = async () => {
            try {
                // Fetch the most recent data from the database
                const data = await Data.find().sort({ createdAt: -1 }).limit(1);
                if (data.length > 0) {
                    channel.publish('new-data', data[0]);
                }
            } catch (error) {
                console.error('Error fetching data from database:', error);
            }
        };

        // Fetch and send the latest data every 2 seconds
        setInterval(sendDataToAbly, 2000);

    })
    .catch(err => {
        console.log(err);
    });

const requestMapper = '/api/v1';
app.use(requestMapper + '/data', dataRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
