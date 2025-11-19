const express = require('express');
const { searchAll, getItemById } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchAll);
router.get('/:type/:id', getItemById);

module.exports = router;
