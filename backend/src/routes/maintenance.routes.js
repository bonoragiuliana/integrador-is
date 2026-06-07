const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');

router.post('/', maintenanceController.create);
router.get('/', maintenanceController.getAll);
router.patch('/:id/validate', maintenanceController.validate);

module.exports = router;
