import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
  const response = await api.post("/api/auth/register", formData);

  const user = response.data;

  await api.post("/api/candidates", {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: "",
    skills: "",
    resumeUrl: ""
  });

  navigate("/login");
} catch (error) {
  console.log("Registration error:", error);
  console.log("Backend response:", error.response?.data);

  setError(
    typeof error.response?.data === "string"
      ? error.response.data
      : error.response?.data?.message ||
        error.message ||
        "Registration failed."
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>◉</span> ORION
        </div>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Join Orion and discover opportunities matched to your skills.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;