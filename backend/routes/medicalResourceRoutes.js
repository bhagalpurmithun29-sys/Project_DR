const express = require('express');
const router = express.Router();
const { getAllResources, getResourcesByCategory } = require('../controllers/medicalResourceController');

router.get('/', getAllResources);
router.get('/category/:category', getResourcesByCategory);

module.exports = router;
