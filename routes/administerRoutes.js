const express = require('express');
const router = express.Router();
const { administerTest, updateTestSettings } = require('../controllers/administerController');


//Route for administering Test
router.post('/', administerTest);

//Route for updating Test Settings
router.patch('/', updateTestSettings);

module.exports = router;