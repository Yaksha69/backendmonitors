const express = require('express');
const router = express.Router();
const { addData, getAllData, sseHandler } = require('../controllers/dataController');

// POST request to add new data
router.post('/new', addData);

// GET request to fetch all data
router.get('/all', getAllData);

// SSE endpoint for real-time updates
router.get('/events', sseHandler);

module.exports = router;
