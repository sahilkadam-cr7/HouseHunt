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

    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const property = await Property.create({
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      images,
      owner: req.user.userId,
    });

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      propertyType,
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (minPrice) {
      query.price = {
        ...query.price,
        $gte: Number(minPrice),
      };
    }

    if (maxPrice) {
      query.price = {
        ...query.price,
        $lte: Number(maxPrice),
      };
    }

    if (propertyType) {
      query.propertyType = {
        $regex: propertyType,
        $options: "i",
      };
    }

    const properties = await Property.find(query).populate(
      "owner",
      "name email"
    );

    res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id).populate(
      "owner",
      "name email"
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.status(200).json({
      property,
    });
  } catch (error) {
    console.error("Get property error:", error.message);

    res.status(500).json({
      message: "Server error",
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

    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied",
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

    if (title !== undefined) property.title = title;
    if (description !== undefined) property.description = description;
    if (location !== undefined) property.location = location;
    if (price !== undefined) property.price = price;
    if (propertyType !== undefined) property.propertyType = propertyType;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;

    if (req.files && req.files.length > 0) {
      property.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    const updatedProperty = await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error.message);

    res.status(500).json({
      message: "Server error",
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

    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error.message);

    res.status(500).json({
      message: "Server error",
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
    console.error("Update property approval error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyApproval,
};
