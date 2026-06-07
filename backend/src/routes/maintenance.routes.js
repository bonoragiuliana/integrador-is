const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');

router.post('/', maintenanceController.create);
router.get('/', maintenanceController.getAll);

module.exports = router;
