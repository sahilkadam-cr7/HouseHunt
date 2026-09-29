import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Home() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });

  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [propertyTypeInput, setPropertyTypeInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProperties = async () => {
    try {
      setError("");

      const res = await API.get("/properties", {
        params: filters,
      });

      setProperties(res.data.properties || res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load properties."
      );
    }
  };

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();

    setFilters({
      search: searchInput,
      location: locationInput,
      propertyType: propertyTypeInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setPropertyTypeInput("");
    setMinPriceInput("");
    setMaxPriceInput("");

    setFilters({
      search: "",
      location: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      const image = property.images[0];

      if (image.startsWith("/uploads")) {
        return `http://localhost:5000${image}`;
      }

      return image;
    }

    return "/images/house1.jpg";
  };

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
      setError(
        err.response?.data?.message || "Unable to create booking"
      );
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Home</h1>
          <p>
            Discover comfortable and affordable properties with HouseHunt.
          </p>
        </div>
      </section>

      <form className="search-panel" onSubmit={handleSearch}>
        <h2>Search Properties</h2>

        <input
          type="text"
          placeholder="Search by title or description"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
        />

        <select
          value={propertyTypeInput}
          onChange={(e) => setPropertyTypeInput(e.target.value)}
        >
          <option value="">All Property Types</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Room">Room</option>
        </select>

        <input
          type="number"
          placeholder="Minimum Price"
          value={minPriceInput}
          onChange={(e) => setMinPriceInput(e.target.value)}
        />

        <input
          type="number"
          placeholder="Maximum Price"
          value={maxPriceInput}
          onChange={(e) => setMaxPriceInput(e.target.value)}
        />

        <button type="submit" className="btn">
          Search
        </button>

        <button
          type="button"
          className="btn secondary"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Available Properties</h2>

      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="property-grid">
          {properties.map((property) => (
            <div className="property-card" key={property._id}>
              <img
                src={getImageUrl(property)}
                alt={property.title}
                className="property-image"
              />

              <div className="property-content">
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

                <div>
                  <Link
                    to={`/property/${property._id}`}
                    className="btn secondary"
                  >
                    View Details
                  </Link>

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
              </div>
            </div>
          ))}
        </div>
      )}

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
