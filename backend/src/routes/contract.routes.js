const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const {
  createContract,
  listContracts,
} = require("../controllers/contract.controller");

const router = express.Router();

// All contract routes require authentication.
router.use(verifyToken);

router.post(
  "/",
  requireRole("admin", "auditor", "officer"),
  asyncHandler(createContract)
);
router.get("/", asyncHandler(listContracts));

module.exports = router;
