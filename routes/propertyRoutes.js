const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getAllProperty);
router.get('/categorys/:category', propertyController.getPropertybyCategory);
router.get('/:id', propertyController.getPropertyById);
router.get('/locations/:location', propertyController.getPropertybyLocation);
router.post('/addProperty', propertyController.addProperty);
router.put('/editProperty/:id', propertyController.editPropertyById);
router.delete('/:id', propertyController.deletePropertyById);

module.exports = router;

