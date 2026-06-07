const express = require('express');
const router = express.Router();
const workOrdersController = require('../controllers/workOrders.controller');

router.post('/', workOrdersController.create);
router.get('/', workOrdersController.getAll);
router.get('/assigned/:user_id', workOrdersController.getByUser);
router.patch('/:id/status', workOrdersController.updateStatus);

module.exports = router;
