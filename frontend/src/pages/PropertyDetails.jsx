import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    API.get(`/properties/${id}`)
      .then((res) => {
        setProperty(res.data.property || res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Property not found");
      });
  }, [id]);

  if (error) {
    return (
      <div className="form-container">
        <p className="error">{error}</p>
        <Link to="/" className="btn">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container">
        <p>Loading property...</p>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/images/house1.jpg"];

  const getImageUrl = (image) => {
    if (image.startsWith("/uploads")) {
      return `http://localhost:5000${image}`;
    }

    return image;
  };

  const previousImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="container">
      <div className="details-card">

        <div className="image-slider">
          <img
            src={getImageUrl(images[currentImage])}
            alt={`${property.title} ${currentImage + 1}`}
            className="details-image"
          />

          {images.length > 1 && (
            <>
              <button
                className="slider-button slider-left"
                onClick={previousImage}
              >
                &#10094;
              </button>

              <button
                className="slider-button slider-right"
                onClick={nextImage}
              >
                &#10095;
              </button>

              <div className="image-counter">
                {currentImage + 1} / {images.length}
              </div>
            </>
          )}
        </div>

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
              <Link to="/" className="btn">
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
