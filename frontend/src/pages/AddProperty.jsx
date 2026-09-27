import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    propertyType: "House",
    bedrooms: "",
    bathrooms: "",
  });

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      setImages([]);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be 5 MB or smaller.");
        setImages([]);
        return;
      }

      const image = new Image();

      image.onload = () => {
        if (image.width < 1200 || image.height < 800) {
          setError("Each image must be at least 1200 x 800 pixels.");
          setImages([]);
        } else if (image.width <= image.height) {
          setError("Only landscape images are allowed.");
          setImages([]);
        }
      };

      image.onerror = () => {
        setError("Invalid image file.");
        setImages([]);
      };

      image.src = URL.createObjectURL(file);
    }

    setImages(files);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("price", Number(form.price));
      formData.append("propertyType", form.propertyType);
      formData.append("bedrooms", Number(form.bedrooms));
      formData.append("bathrooms", Number(form.bathrooms));

      images.forEach((image) => {
        formData.append("images", image);
      });

      await API.post("/properties", formData);

      setMessage("Property submitted for admin approval.");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add property"
      );
    }
  };

  return (
    <div className="form-container">
      <h1>Add Property</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <label>Property Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Location</label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <label>Monthly Rent</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <label>Property Type</label>
        <select
          name="propertyType"
          value={form.propertyType}
          onChange={handleChange}
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
          value={form.bedrooms}
          onChange={handleChange}
          required
        />

        <label>Bathrooms</label>
        <input
          type="number"
          name="bathrooms"
          value={form.bathrooms}
          onChange={handleChange}
          required
        />

        <label>Property Images</label>

        <p className="image-upload-instructions">
          Upload landscape images only. Each image must be at least
          1200 x 800 pixels and maximum 5 MB. You can upload up to
          10 images.
        </p>

        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImages}
        />

        {images.length > 0 && (
          <p>{images.length} image(s) selected</p>
        )}

        <button type="submit" className="btn">
          Submit Property
        </button>
      </form>
    </div>
  );
}

export default AddProperty;


