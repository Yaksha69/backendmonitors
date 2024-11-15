require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');

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
        const server = app.listen(process.env.PORT, () => {
            console.log('Connected to the database...');
            console.log('Listening on port ', process.env.PORT);
        });

        // WebSocket server initialization
        const wss = new WebSocketServer({ server });

        // Send data to all connected WebSocket clients
        const sendDataToClients = async () => {
            try {
                // Fetch the most recent data from the database
                const data = await Data.find().sort({ createdAt: -1 }).limit(1); // Adjust as needed
                if (data.length > 0) {
                    wss.clients.forEach(client => {
                        if (client.readyState === client.OPEN) {
                            client.send(JSON.stringify(data[0])); // Send the latest entry
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data from database:', error);
            }
        };

        // Fetch and send the latest data every 2 seconds
        setInterval(sendDataToClients, 2000);

    })
    .catch(err => {
        console.log(err);
    });

const requestMapper = '/api/v1';
app.use(requestMapper + '/data', dataRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
