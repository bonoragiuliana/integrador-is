const express = require('express');
const router = express.Router();
const workOrdersController = require('../controllers/workOrders.controller');

router.post('/', workOrdersController.create);
router.get('/', workOrdersController.getAll);

module.exports = router;
