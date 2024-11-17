let clients = [];

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

const sendDataToClients = (data) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`); // Send data to each client
    });
};

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

const getAllData = async (req, res) => {
    try {
        const data = await Data.find();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addData,
    getAllData,
    sseHandler,
};
