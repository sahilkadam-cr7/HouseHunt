import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      const res = await API.get("/bookings/my");
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookings");
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/cancel`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking");
    }
  };

  return (
    <div className="container">
      <h1>My Dashboard</h1>

      {error && <p className="error">{error}</p>}

      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="property-grid">
          {bookings.map((booking) => (
            <div className="property-card dashboard-booking-card" key={booking._id}>
              <h3>{booking.property?.title || "Property"}</h3>
              <p>
                <strong>Location:</strong>{" "}
                {booking.property?.location || "N/A"}
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

              {["pending", "approved"].includes(booking.status) && (
                <button
                  className="btn danger"
                  onClick={() => cancelBooking(booking._id)}
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

