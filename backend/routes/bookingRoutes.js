const express = require("express");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);

router.get("/my", protect, getMyBookings);

router.get("/", protect, authorize("admin"), getAllBookings);

router.put("/:id/status", protect, authorize("admin"), updateBookingStatus);

router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;