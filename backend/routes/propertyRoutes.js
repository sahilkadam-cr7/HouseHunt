const express = require("express");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

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

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

const validateImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    for (const file of req.files) {
      const metadata = await sharp(file.buffer).metadata();

      if (!metadata.width || !metadata.height) {
        return res.status(400).json({
          message: "Unable to read image dimensions",
        });
      }

      if (metadata.width < 1200 || metadata.height < 800) {
        return res.status(400).json({
          message: "Each image must be at least 1200 x 800 pixels",
        });
      }

      if (metadata.width <= metadata.height) {
        return res.status(400).json({
          message: "Only landscape images are allowed",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({
      message: "Invalid image file",
    });
  }
};

const saveImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const fs = require("fs");

    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    const savedFiles = [];

    for (const file of req.files) {
      const filename =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      const filepath = path.join("uploads", filename);

      fs.writeFileSync(filepath, file.buffer);

      savedFiles.push({
        ...file,
        filename,
      });
    }

    req.files = savedFiles;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Unable to save images",
    });
  }
};

router.post(
  "/",
  protect,
  upload.array("images", 10),
  validateImages,
  saveImages,
  createProperty
);

router.get("/", getProperties);
router.get("/:id", getPropertyById);

router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  validateImages,
  saveImages,
  updateProperty
);

router.put(
  "/:id/approval",
  protect,
  authorize("admin"),
  updatePropertyApproval
);

router.delete("/:id", protect, deleteProperty);

module.exports = router;
