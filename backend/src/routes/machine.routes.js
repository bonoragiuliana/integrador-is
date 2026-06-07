const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machine.controller');

router.get('/', machineController.getAll);
router.post('/', machineController.create);
router.put('/:id', machineController.update);

module.exports = router;
