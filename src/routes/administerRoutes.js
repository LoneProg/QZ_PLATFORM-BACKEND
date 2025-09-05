const express = require('express');
const router = express.Router();
const {
  administerTest,
  getAdministerSettings,
  updateTestSettings,
} = require('../controllers/administerController');

//Route for administering Test
router.post('/:testId', administerTest);

//Route for getting all Administered Test
router.get('/:testId', getAdministerSettings);

//Route for updating Test Settings
router.patch('/:testId', updateTestSettings);

module.exports = router;
