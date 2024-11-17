const Data = require('../models/Data'); // Assuming Data model is already defined

let clients = [];

// SSE handler to send data to all connected clients
const sseHandler = (req, res) => {
    // Set headers to establish an SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Send headers

    // Add the client to the list of clients
    clients.push(res);

    // Remove the client when the connection is closed
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

// Function to send data to all connected clients
const sendDataToClients = (data) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`); // Send data to each client
    });
};

// Add new data to the database and send to clients
const addData = async (req, res) => {
    const { voltage, current, power, energy } = req.body;

    try {
        const new_data = await Data.create({ voltage, current, power, energy });
        res.status(200).json(new_data);

        // Send the new data to all connected SSE clients
        sendDataToClients(new_data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all data from the database
const getAllData = async (req, res) => {
    try {
        const data = await Data.find().sort({ createdAt: -1 }); // Sort by createdAt, latest first
        res.status(200).json(data); // Send data as JSON
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addData,
    getAllData, // Make sure this function is exported
    sseHandler,
};
