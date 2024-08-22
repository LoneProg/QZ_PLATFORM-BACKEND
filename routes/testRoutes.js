const express = require("express");
const router = express.Router();
const {
  createTest,
  getTestByPasscode,
} = require("../controllers/testController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", createTest);
router.get("/:passcode", getTestByPasscode);

module.exports = router;
