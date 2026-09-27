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

    // Check required fields
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

    // Create property
    const property = await Property.create({
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
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

    // Search properties by title, description, or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter properties by location
    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter properties by minimum price
    if (minPrice) {
      query.price = {
        ...query.price,
        $gte: Number(minPrice),
      };
    }

    // Filter properties by maximum price
    if (maxPrice) {
      query.price = {
        ...query.price,
        $lte: Number(maxPrice),
      };
    }

    // Filter properties by property type
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

    // Check if the ID is a valid MongoDB ObjectId
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

    // Check if the logged-in user owns the property
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

    // Update only fields that were provided
    if (title !== undefined) property.title = title;
    if (description !== undefined) property.description = description;
    if (location !== undefined) property.location = location;
    if (price !== undefined) property.price = price;
    if (propertyType !== undefined) property.propertyType = propertyType;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;

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

    // Check if the logged-in user owns the property
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

    // Check if status is valid
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid approval status",
      });
    }

    const property = await Property.findById(req.params.id);

    // Check if property exists
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