'use strict';
const express = require('express');
const router = express.Router();
var generate = require('../controllers/generate_image');
router.get('/', generate.generate_image);
module.exports = router;