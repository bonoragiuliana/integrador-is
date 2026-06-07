const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machine.controller');

router.get('/', machineController.getAll);
router.post('/', machineController.create);

module.exports = router;
