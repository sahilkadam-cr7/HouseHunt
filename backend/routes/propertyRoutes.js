const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyApproval,
} = require("../controllers/propertyController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProperty);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.put("/:id", protect, updateProperty);
router.put("/:id/approval", protect, authorize("admin"), updatePropertyApproval);
router.delete("/:id", protect, deleteProperty);

module.exports = router;