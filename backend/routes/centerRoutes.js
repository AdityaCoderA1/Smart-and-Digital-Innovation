const express = require('express');
const router = express.Router();
const { getCenters } = require('../controllers/centerController');

router.route('/').get(getCenters);

module.exports = router;
