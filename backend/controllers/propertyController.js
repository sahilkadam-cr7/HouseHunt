const mongoose = require("mongoose");
const Property = require("../models/Property");

const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      price === undefined ||
      !propertyType ||
      bedrooms === undefined ||
      bathrooms === undefined
    ) {
      return res.status(400).json({
        message: "All property fields are required",
      });
    }

    const images =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const property = await Property.create({
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      owner: req.user.userId,
      images,
    });

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const {
      search,
      location,
      propertyType,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {
      approvalStatus: "approved",
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (minPrice !== undefined && minPrice !== "") {
      filter.price = {
        ...filter.price,
        $gte: Number(minPrice),
      };
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      filter.price = {
        ...filter.price,
        $lte: Number(maxPrice),
      };
    }

    const properties = await Property.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user.userId,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error("Get my properties error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllPropertiesForAdmin = async (req, res) => {
  try {
    const properties = await Property.find({
      approvalStatus: { $ne: "rejected" },
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error("Get admin properties error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(req.params.id)
      .populate("owner", "name email");

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Get property error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Only the property owner can edit this property",
      });
    }

    const {
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
    } = req.body;

    property.title = title;
    property.description = description;
    property.location = location;
    property.price = price;
    property.propertyType = propertyType;
    property.bedrooms = bedrooms;
    property.bathrooms = bathrooms;

    if (req.files && req.files.length > 0) {
      property.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update property error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Only the property owner can delete this property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const updatePropertyApproval = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid approval status",
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.approvalStatus = status;

    await property.save();

    res.status(200).json({
      message: `Property ${status} successfully`,
      property,
    });
  } catch (error) {
    console.error("Property approval error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getMyProperties,
  getAllPropertiesForAdmin,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyApproval,
};
