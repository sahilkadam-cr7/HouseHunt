import { useEffect, useState } from "react";
import API from "../api";

function Home() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProperties = async () => {
    try {
      const res = await API.get("/properties");
      setProperties(res.data.properties || res.data);
    } catch {
      setError("Unable to load properties.");
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const bookProperty = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.post("/bookings", {
        property: selectedProperty._id,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });

      setMessage("Booking request submitted successfully.");
      setSelectedProperty(null);
      setDates({ startDate: "", endDate: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create booking");
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Find Your Perfect Home</h1>
        <p>Discover comfortable and affordable properties with HouseHunt.</p>
      </section>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Available Properties</h2>

      <div className="property-grid">
        {properties.map((property) => (
          <div className="property-card" key={property._id}>
            <h3>{property.title}</h3>
            <p>{property.description}</p>

            <p>
              <strong>Location:</strong> {property.location}
            </p>

            <p>
              <strong>Type:</strong> {property.propertyType}
            </p>

            <p>
              <strong>Bedrooms:</strong> {property.bedrooms}
            </p>

            <p>
              <strong>Bathrooms:</strong> {property.bathrooms}
            </p>

            <p className="price">
              &#8377;{property.price}/month
            </p>

            <span className="status">
              {property.approvalStatus}
            </span>

            {localStorage.getItem("token") &&
              property.approvalStatus === "approved" && (
                <button
                  className="btn"
                  onClick={() => setSelectedProperty(property)}
                >
                  Book Property
                </button>
              )}
          </div>
        ))}
      </div>

      {selectedProperty && (
        <div className="form-container">
          <h2>Book {selectedProperty.title}</h2>

          <form onSubmit={bookProperty}>
            <label>Start Date</label>
            <input
              type="date"
              value={dates.startDate}
              onChange={(e) =>
                setDates({ ...dates, startDate: e.target.value })
              }
              required
            />

            <label>End Date</label>
            <input
              type="date"
              value={dates.endDate}
              onChange={(e) =>
                setDates({ ...dates, endDate: e.target.value })
              }
              required
            />

            <button type="submit" className="btn">
              Submit Booking
            </button>

            <button
              type="button"
              className="btn danger"
              onClick={() => setSelectedProperty(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
