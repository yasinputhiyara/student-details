import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Protect route - redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      navigate("/profile");
    }
  }, [navigate]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field on change
    const fieldError = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(loginUser(formData));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/profile"); // or /admin based on role
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "4px" }}>
        {error}
      </p>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
        padding: "16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Login</h2>
        {error && (
          <p
            style={{
              color: "#ef4444",
              textAlign: "center",
              marginTop: "8px",
              fontSize: "14px",
              backgroundColor: "#fef2f2",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </p>
        )}

        <div>
          <ErrorMessage error={validationErrors.email} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              border: `1px solid ${
                validationErrors.email ? "#ef4444" : "#ccc"
              }`,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.password} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              border: `1px solid ${
                validationErrors.password ? "#ef4444" : "#ccc"
              }`,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: loading ? "#86efac" : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "8px",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "8px", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "bold",
              borderBottom: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderBottom = "1px solid #3b82f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottom = "1px solid transparent";
            }}
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
