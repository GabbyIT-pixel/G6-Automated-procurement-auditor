const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../middleware/auth.middleware");
const { listAlerts } = require("../controllers/alert.controller");

const router = express.Router();

router.get("/", verifyToken, asyncHandler(listAlerts));

module.exports = router;
