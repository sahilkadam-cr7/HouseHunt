const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Property = require("../models/Property");

const createBooking = async (req, res) => {
  try {
    const { property, startDate, endDate } = req.body;

    // Check required fields
    if (!property || !startDate || !endDate) {
      return res.status(400).json({
        message: "Property, start date, and end date are required",
      });
    }

    // Check if the property ID is valid
    if (!mongoose.Types.ObjectId.isValid(property)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    // Check if the property exists
    const existingProperty = await Property.findById(property);

    if (!existingProperty) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Only approved properties can be booked
    if (existingProperty.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Property is not approved for booking",
      });
    }

    // Convert dates to Date objects
    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);

    // Check if dates are valid
    if (
      Number.isNaN(bookingStartDate.getTime()) ||
      Number.isNaN(bookingEndDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid booking dates",
      });
    }

    // End date must be after start date
    if (bookingEndDate <= bookingStartDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const overlappingBooking = await Booking.findOne({
      property,
      status: { $in: ["pending", "approved"] },
      startDate: { $lt: bookingEndDate },
      endDate: { $gt: bookingStartDate },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Property is already booked for the selected dates",
      });
    }

    // Create booking
    const booking = await Booking.create({
      property,
      user: req.user.userId,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.userId,
    })
      .populate("property")
      .sort({ createdAt: -1 });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("property")
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only cancel your own booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "rejected") {
      return res.status(400).json({
        message: "Rejected booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
};