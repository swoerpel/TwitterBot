'use strict';
const express = require('express');
const router = express.Router();
var tweet = require('../controllers/tweet_image');
router.get('/', tweet.tweet_image);
module.exports = router;