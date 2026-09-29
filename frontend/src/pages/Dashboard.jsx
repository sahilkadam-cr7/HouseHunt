import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("userId");

  const loadData = async () => {
    try {
      const [bookingRes, propertyRes] = await Promise.all([
        API.get("/bookings/my"),
        API.get("/properties/my"),
      ]);

      const allProperties =
        propertyRes.data.properties || propertyRes.data;

      const myProperties = allProperties.filter(
        (property) =>
          property.owner?._id === userId ||
          property.owner === userId
      );

      setBookings(bookingRes.data.bookings || bookingRes.data);
      setProperties(myProperties);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (property) => {
    setError("");
    setMessage("");

    setEditingProperty({
      _id: property._id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
    });

    setEditImages([]);
  };

  const handleEditChange = (e) => {
    setEditingProperty({
      ...editingProperty,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      setEditImages([]);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be 5 MB or smaller.");
        setEditImages([]);
        return;
      }
    }

    setError("");
    setEditImages(files);
  };

  const updateProperty = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", editingProperty.title);
      formData.append("description", editingProperty.description);
      formData.append("location", editingProperty.location);
      formData.append("price", Number(editingProperty.price));
      formData.append("propertyType", editingProperty.propertyType);
      formData.append("bedrooms", Number(editingProperty.bedrooms));
      formData.append("bathrooms", Number(editingProperty.bathrooms));

      editImages.forEach((image) => {
        formData.append("images", image);
      });

      await API.put(
        `/properties/${editingProperty._id}`,
        formData
      );

      setMessage("Property updated successfully.");
      setEditingProperty(null);
      setEditImages([]);

      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update property"
      );
    }
  };

  const deleteProperty = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/properties/${id}`);

      setMessage("Property deleted successfully.");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete property"
      );
    }
  };

  const cancelBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/cancel`);

      setMessage("Booking cancelled successfully.");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel booking"
      );
    }
  };

  return (
    <div className="container">
      <h1>My Dashboard</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h2>My Properties</h2>

      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="property-grid">
          {properties.map((property) => (
            <div className="property-card" key={property._id}>
              <div className="property-content">
                <h3>{property.title}</h3>

                <p>{property.description}</p>

                <p>
                  <strong>Location:</strong>{" "}
                  {property.location}
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {property.propertyType}
                </p>

                <p>
                  <strong>Price:</strong>{" "}
                  &#8377;{property.price}/month
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {property.approvalStatus}
                </p>

                <button
                  className="btn"
                  onClick={() => startEdit(property)}
                >
                  Edit Property
                </button>

                <button
                  className="btn danger"
                  onClick={() =>
                    deleteProperty(property._id)
                  }
                >
                  Delete Property
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProperty && (
        <div className="form-container">
          <h2>Edit Property</h2>

          <form onSubmit={updateProperty}>
            <label>Property Title</label>

            <input
              type="text"
              name="title"
              value={editingProperty.title}
              onChange={handleEditChange}
              required
            />

            <label>Description</label>

            <textarea
              name="description"
              value={editingProperty.description}
              onChange={handleEditChange}
              required
            />

            <label>Location</label>

            <input
              type="text"
              name="location"
              value={editingProperty.location}
              onChange={handleEditChange}
              required
            />

            <label>Monthly Rent</label>

            <input
              type="number"
              name="price"
              value={editingProperty.price}
              onChange={handleEditChange}
              required
            />

            <label>Property Type</label>

            <select
              name="propertyType"
              value={editingProperty.propertyType}
              onChange={handleEditChange}
              required
            >
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Room">Room</option>
            </select>

            <label>Bedrooms</label>

            <input
              type="number"
              name="bedrooms"
              value={editingProperty.bedrooms}
              onChange={handleEditChange}
              required
            />

            <label>Bathrooms</label>

            <input
              type="number"
              name="bathrooms"
              value={editingProperty.bathrooms}
              onChange={handleEditChange}
              required
            />

            <label>Change Property Images</label>

            <p className="image-upload-instructions">
              Upload landscape images only. Each image must be
              at least 1200 x 800 pixels and maximum 5 MB.
              You can upload up to 10 images.
            </p>

            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleEditImages}
            />

            <p className="image-upload-instructions">
              Press Ctrl + click image to select multiple images.
            </p>

            {editImages.length > 0 && (
              <p>
                {editImages.length} image(s) selected
              </p>
            )}

            <button type="submit" className="btn">
              Save Changes
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setEditingProperty(null);
                setEditImages([]);
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="property-grid">
          {bookings.map((booking) => (
            <div
              className="property-card dashboard-booking-card"
              key={booking._id}
            >
              <h3>
                {booking.property?.title || "Property"}
              </h3>

              <p>
                <strong>Location:</strong>{" "}
                {booking.property?.location || "N/A"}
              </p>

              <p>
                <strong>From:</strong>{" "}
                {new Date(
                  booking.startDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>To:</strong>{" "}
                {new Date(
                  booking.endDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {booking.status}
              </p>

              {["pending", "approved"].includes(
                booking.status
              ) && (
                <button
                  className="btn danger"
                  onClick={() =>
                    cancelBooking(booking._id)
                  }
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

