import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/properties/${id}`)
      .then((res) => setProperty(res.data.property || res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Property not found");
      });
  }, [id]);

  if (error) {
    return (
      <div className="form-container">
        <p className="error">{error}</p>
        <Link to="/" className="btn">Back to Home</Link>
      </div>
    );
  }

  if (!property) {
    return <div className="container"><p>Loading property...</p></div>;
  }

  return (
    <div className="container">
      <div className="details-card">
        <img
          src="/images/house1.jpg"
          alt={property.title}
          className="details-image"
        />

        <div className="details-content">
          <h1>{property.title}</h1>

          <p className="price">
            &#8377;{property.price}/month
          </p>

          <span className="status">
            {property.approvalStatus}
          </span>

          <p>{property.description}</p>

          <div className="details-grid">
            <div>
              <strong>Location</strong>
              <span>{property.location}</span>
            </div>

            <div>
              <strong>Property Type</strong>
              <span>{property.propertyType}</span>
            </div>

            <div>
              <strong>Bedrooms</strong>
              <span>{property.bedrooms}</span>
            </div>

            <div>
              <strong>Bathrooms</strong>
              <span>{property.bathrooms}</span>
            </div>
          </div>

          {localStorage.getItem("token") &&
            property.approvalStatus === "approved" && (
              <Link
                to="/"
                className="btn"
              >
                Book This Property
              </Link>
            )}

          <Link to="/" className="btn secondary">
            Back to Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
