const express = require('express');
const router = express.Router();
const { upload, uploadWaste } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), uploadWaste);

module.exports = router;
