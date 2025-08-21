import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../features/admin/adminSlice';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});

  // Protect route - redirect if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
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
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
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

    const result = await dispatch(loginAdmin(formData));
    console.log('Login result:', result);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/admin');
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
        {error}
      </p>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            textAlign: "center",
            color: "#1f2937",
          }}
        >
          Admin Login
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "#374151",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                border: `1px solid ${validationErrors.email ? '#ef4444' : '#d1d5db'}`,
                borderRadius: "0.375rem",
                padding: "0.75rem",
                outline: "none",
                transition: "border-color 0.2s",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your email"
            />
            <ErrorMessage error={validationErrors.email} />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#374151",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                border: `1px solid ${validationErrors.password ? '#ef4444' : '#d1d5db'}`,
                borderRadius: "0.375rem",
                padding: "0.75rem",
                outline: "none",
                transition: "border-color 0.2s",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your password"
            />
            <ErrorMessage error={validationErrors.password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#9ca3af" : "#16a34a",
              color: "#ffffff",
              fontWeight: "600",
              padding: "0.75rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              fontSize: "16px",
              marginTop: "0.5rem",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#15803d";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#16a34a";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <div
              style={{
                color: "#ef4444",
                textAlign: "center",
                fontSize: "0.875rem",
                backgroundColor: "#fef2f2",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;