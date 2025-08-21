import { useState, useEffect } from 'react';

const StudentForm = ({ initialData = {}, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    class: '',
    admissionNumber: '',
    email: '',
    profilePic: '',
    password: '',
    ...initialData,
  });

  const [preview, setPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData.profilePic) {
      setPreview(`http://localhost:5000/uploads/${initialData.profilePic}`);
    }
  }, [initialData.profilePic]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = 'Name can only contain letters and spaces';
        }
        break;
      
      case 'age':
        if (!value) {
          error = 'Age is required';
        } else if (isNaN(value) || value < 5 || value > 100) {
          error = 'Age must be between 5 and 100';
        }
        break;
      
      case 'class':
        if (!value.trim()) {
          error = 'Class is required';
        } else if (value.trim().length < 1) {
          error = 'Class cannot be empty';
        }
        break;
      
      case 'admissionNumber':
        if (!value.trim()) {
          error = 'Admission Number is required';
        } else if (value.trim().length < 3) {
          error = 'Admission Number must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9]+$/.test(value.trim())) {
          error = 'Admission Number can only contain letters and numbers';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'password':
        if (!isEdit && !value) {
          error = 'Password is required';
        } else if (value && value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (value && !/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one letter and one number';
        }
        break;
      
      default:
        break;
    }

    return error;
  };

  const validateProfilePic = (file) => {
    if (!isEdit && !file) {
      return 'Profile picture is required';
    }
    
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return 'Please select a valid image file (JPEG, PNG, GIF)';
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return 'Image size must be less than 5MB';
      }
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePic') {
      const file = files[0];
      setFormData(prev => ({ ...prev, profilePic: file }));
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
      
      // Validate file
      const fileError = validateProfilePic(file);
      setValidationErrors(prev => ({
        ...prev,
        profilePic: fileError
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Validate field on change
      const fieldError = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all text fields
    const textFields = ['name', 'age', 'class', 'admissionNumber', 'email', 'password'];
    textFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    
    // Validate profile picture
    const profilePicError = validateProfilePic(formData.profilePic);
    if (profilePicError) errors.profilePic = profilePicError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{error}</p>;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "768px",
        margin: "2rem auto",
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1.5rem",
        }}
      >
        <style>
          {`
            @media (min-width: 768px) {
              form > div:first-child {
                grid-template-columns: 1fr 1fr;
              }
            }
          `}
        </style>

        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            style={{
              ...inputStyle,
              borderColor: validationErrors.name ? '#ef4444' : '#d1d5db'
            }}
          />
          <ErrorMessage error={validationErrors.name} />
        </div>

        <div>
          <label style={labelStyle}>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter age"
            min="5"
            max="100"
            style={{
              ...inputStyle,
              borderColor: validationErrors.age ? '#ef4444' : '#d1d5db'
            }}
          />
          <ErrorMessage error={validationErrors.age} />
        </div>

        <div>
          <label style={labelStyle}>Class</label>
          <input
            type="text"
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="Enter class"
            style={{
              ...inputStyle,
              borderColor: validationErrors.class ? '#ef4444' : '#d1d5db'
            }}
          />
          <ErrorMessage error={validationErrors.class} />
        </div>

        <div>
          <label style={labelStyle}>Admission Number</label>
          <input
            type="text"
            name="admissionNumber"
            value={formData.admissionNumber}
            onChange={handleChange}
            placeholder="Enter admission number"
            disabled={isEdit}
            style={{
              ...inputStyle,
              borderColor: validationErrors.admissionNumber ? '#ef4444' : '#d1d5db',
              backgroundColor: isEdit ? '#f9fafb' : '#ffffff',
              cursor: isEdit ? 'not-allowed' : 'text'
            }}
          />
          <ErrorMessage error={validationErrors.admissionNumber} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            disabled={isEdit}
            style={{
              ...inputStyle,
              borderColor: validationErrors.email ? '#ef4444' : '#d1d5db',
              backgroundColor: isEdit ? '#f9fafb' : '#ffffff',
              cursor: isEdit ? 'not-allowed' : 'text'
            }}
          />
          <ErrorMessage error={validationErrors.email} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            {isEdit ? 'New Password (optional)' : 'Password'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
            style={{
              ...inputStyle,
              borderColor: validationErrors.password ? '#ef4444' : '#d1d5db'
            }}
          />
          <ErrorMessage error={validationErrors.password} />
        </div>
      </div>

      {/* Profile picture upload */}
      <div style={{ marginTop: "1.5rem" }}>
        <label style={labelStyle}>Profile Picture</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {preview && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              />
            </div>
          )}
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleChange}
            style={{
              padding: "0.5rem",
              border: `1px solid ${validationErrors.profilePic ? '#ef4444' : '#d1d5db'}`,
              borderRadius: "0.5rem",
              fontSize: "14px",
            }}
          />
          <ErrorMessage error={validationErrors.profilePic} />
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: "#6b7280",
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#4b5563";
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#6b7280";
            }
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#93c5fd" : "#2563eb",
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#1e40af";
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#2563eb";
            }
          }}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
        </button>
      </div>
    </form>
  );
};

// Reusable inline styles
const inputStyle = {
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

const labelStyle = {
  fontWeight: "600",
  color: "#374151",
  marginBottom: "0.5rem",
  display: "block",
  fontSize: "14px",
};

const buttonStyle = {
  color: "#fff",
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background-color 0.2s ease",
};

export default StudentForm;