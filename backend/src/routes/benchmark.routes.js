const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { listBenchmarks } = require("../controllers/benchmark.controller");

const router = express.Router();

// Public per the architecture diagram — feeds the audit engine, no auth.
router.get("/", asyncHandler(listBenchmarks));

module.exports = router;
