const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/supervisor', dashboardController.getSupervisorMetrics);
router.get('/interventions', dashboardController.getPendingInterventions);

module.exports = router;
