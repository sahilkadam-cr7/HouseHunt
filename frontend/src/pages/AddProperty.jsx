import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddProperty() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    propertyType: "House",
    bedrooms: "",
    bathrooms: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.post("/properties", {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      });

      setMessage("Property submitted for admin approval.");

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add property");
    }
  };

  return (
    <div className="form-container">
      <h2>Add Property</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={submit}>
        <input
          placeholder="Property Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Monthly Rent"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <select
          value={form.propertyType}
          onChange={(e) =>
            setForm({ ...form, propertyType: e.target.value })
          }
        >
          <option>House</option>
          <option>Apartment</option>
          <option>Flat</option>
          <option>Villa</option>
          <option>Room</option>
        </select>

        <input
          type="number"
          placeholder="Bedrooms"
          min="1"
          value={form.bedrooms}
          onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Bathrooms"
          min="1"
          value={form.bathrooms}
          onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
          required
        />

        <button type="submit" className="btn">
          Submit Property
        </button>
      </form>
    </div>
  );
}

export default AddProperty;
