const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

module.exports = router;
