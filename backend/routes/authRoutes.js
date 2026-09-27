const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    message: "You accessed the admin-only route",
    user: req.user,
  });
});

module.exports = router;