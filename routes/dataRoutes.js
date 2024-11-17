const express = require('express');
const router = express.Router();

const { addData, getAllData, sseHandler } = require('../controllers/dataController');

// POST REQUEST
router.post('/new', addData);

// GET REQUEST
router.get('/all', getAllData);

// SSE Endpoint
router.get('/events', sseHandler);

module.exports = router;
