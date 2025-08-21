import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    class: '',
    admissionNumber: '',
    email: '',
    password: '',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Protect route - redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

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
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one letter and one number';
        }
        break;
      
      default:
        break;
    }

    return error;
  };

  const validateProfilePic = (file) => {
    if (!file) {
      return 'Profile picture is required';
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF)';
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    
    return '';
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    
    // Validate file
    const fileError = validateProfilePic(file);
    setValidationErrors(prev => ({
      ...prev,
      profilePic: fileError
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    
    // Validate profile picture
    const profilePicError = validateProfilePic(profilePic);
    if (profilePicError) errors.profilePic = profilePicError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append('profilePic', profilePic);

      const response = await axios.post('http://localhost:5000/api/student/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        localStorage.setItem('studentToken', response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '4px' }}>{error}</p>;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      padding: '16px',
    }}>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Student Registration</h2>

        <div>
          <ErrorMessage error={validationErrors.name} />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: validationErrors.name ? '#ef4444' : '#ccc'
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.age} />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            min="5"
            max="100"
            style={{
              ...inputStyle,
              borderColor: validationErrors.age ? '#ef4444' : '#ccc'
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.class} />
          <input
            type="text"
            name="class"
            placeholder="Class"
            value={formData.class}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: validationErrors.class ? '#ef4444' : '#ccc'
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.admissionNumber} />
          <input
            type="text"
            name="admissionNumber"
            placeholder="Admission Number"
            value={formData.admissionNumber}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: validationErrors.admissionNumber ? '#ef4444' : '#ccc'
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.email} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: validationErrors.email ? '#ef4444' : '#ccc'
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
              ...inputStyle,
              borderColor: validationErrors.password ? '#ef4444' : '#ccc'
            }}
          />
        </div>

        <div>
          <ErrorMessage error={validationErrors.profilePic} />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              padding: '8px',
              fontSize: '14px',
              borderRadius: '4px',
              border: `1px solid ${validationErrors.profilePic ? '#ef4444' : '#ccc'}`,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: loading ? '#93c5fd' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px' }}>
          Already have an account?{' '}
          <span
            style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>

        {error && (
          <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '8px', fontSize: '14px' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  width: '100%',
  boxSizing: 'border-box',
};

export default Register;