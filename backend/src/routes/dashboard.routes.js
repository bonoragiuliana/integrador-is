const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/supervisor', dashboardController.getSupervisorMetrics);

module.exports = router;
