import { useEffect, useState } from "react";
import API from "../api";

function Admin() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [propertyRes, bookingRes] = await Promise.all([
        API.get("/properties"),
        API.get("/bookings"),
      ]);

      setProperties(propertyRes.data.properties || propertyRes.data);
      setBookings(bookingRes.data.bookings || bookingRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveProperty = async (id, status) => {
    try {
      await API.put(`/properties/${id}/approval`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update property");
    }
  };

  const updateBooking = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update booking");
    }
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {error && <p className="error">{error}</p>}

      <h2>Properties</h2>

      <div className="property-grid">
        {properties.map((property) => (
          <div className="property-card" key={property._id}>
            <h3>{property.title}</h3>
            <p>{property.description}</p>
            <p>
              <strong>Owner:</strong>{" "}
              {property.owner?.name || property.owner?.email || "N/A"}
            </p>
            <p>
              <strong>Location:</strong> {property.location}
            </p>
            <p>
              <strong>Status:</strong> {property.approvalStatus}
            </p>

            {property.approvalStatus === "pending" && (
              <div>
                <button
                  className="btn"
                  onClick={() => approveProperty(property._id, "approved")}
                >
                  Approve
                </button>

                <button
                  className="btn danger"
                  onClick={() => approveProperty(property._id, "rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2>Bookings</h2>

      <div className="property-grid">
        {bookings.map((booking) => (
          <div className="property-card" key={booking._id}>
            <h3>{booking.property?.title || "Property"}</h3>

            <p>
              <strong>User:</strong>{" "}
              {booking.user?.name || booking.user?.email || "N/A"}
            </p>

            <p>
              <strong>From:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()}
            </p>

            <p>
              <strong>To:</strong>{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </p>

            <p>
              <strong>Status:</strong> {booking.status}
            </p>

            {booking.status === "pending" && (
              <div>
                <button
                  className="btn"
                  onClick={() => updateBooking(booking._id, "approved")}
                >
                  Approve
                </button>

                <button
                  className="btn danger"
                  onClick={() => updateBooking(booking._id, "rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
