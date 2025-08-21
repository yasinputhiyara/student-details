import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/student/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStudent(data);
        setFormData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('studentToken');
          navigate('/login');
        } else {
          setError('Failed to fetch profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      
      default:
        break;
    }

    return error;
  };

  const validateProfilePic = (file) => {
    if (!file) {
      return ''; // File is optional for updates
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    // Validate file
    const fileError = validateProfilePic(file);
    setValidationErrors(prev => ({
      ...prev,
      profilePic: fileError
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate editable fields
    const editableFields = ['name', 'age', 'class'];
    editableFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    
    // Validate profile picture if changed
    if (imageFile) {
      const profilePicError = validateProfilePic(imageFile);
      if (profilePicError) errors.profilePic = profilePicError;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/login');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('studentToken');
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('age', formData.age);
      form.append('class', formData.class.trim());
      if (imageFile) form.append('profilePic', imageFile);

      const { data } = await axios.put('http://localhost:5000/api/student/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update both states so the new values are shown immediately
      setStudent((prev) => ({
        ...prev,
        name: formData.name,
        age: formData.age,
        class: formData.class,
        profilePic: imageFile ? data.student?.profilePic || prev.profilePic : prev.profilePic,
      }));

      setFormData((prev) => ({
        ...prev,
        name: formData.name,
        age: formData.age,
        class: formData.class,
      }));

      setEditing(false);
      setImageFile(null);
      setValidationErrors({});
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(student); // Reset form data
    setImageFile(null);
    setValidationErrors({});
    setError('');
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{error}</p>;
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading profile...</p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorBoxStyle}>
          <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Error</h3>
          <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Student Profile</h2>

        {/* Profile Picture */}
        <div style={profilePictureContainerStyle}>
          <img
            src={`http://localhost:5000/uploads/${student.profilePic}`}
            alt="Profile"
            style={profileImageStyle}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUMxMDUuOTI4IDc1IDEzMCA1MC45MjggMTMwIDIwQzEzMCAxMC45MjkgMTI0LjA3MSA1IDExNSA1SDM1QzI1LjkyOSA1IDIwIDEwLjkyOSAyMCAyMEMyMCA1MC45MjggNDQuMDcyIDc1IDc1IDc1WiIgZmlsbD0iIzkzOTNBMyIvPgo8cGF0aCBkPSJNMTQwIDEzNUMxNDAgMTQxLjYyNyAxMzQuNjI3IDE0NyAxMjggMTQ3SDIyQzE1LjM3MyAxNDcgMTAgMTQxLjYyNyAxMCAxMzVDMTAgMTA0LjA3MiAzNC4wNzIgODAgNjUgODBIODVDMTE1LjkyOCA4MCAxNDAgMTA0LjA3MiAxNDAgMTM1WiIgZmlsbD0iIzkzOTNBMyIvPgo8L3N2Zz4K';
            }}
          />
          {editing && (
            <div style={{ marginTop: '8px' }}>
              <label style={labelStyle}>
                Change Profile Picture:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={fileInputStyle}
                />
                <ErrorMessage error={validationErrors.profilePic} />
              </label>
            </div>
          )}
        </div>

        {/* Profile Information */}
        {!editing ? (
          <div style={profileInfoStyle}>
            <div style={infoRowStyle}>
              <span style={labelTextStyle}>Name:</span>
              <span style={valueTextStyle}>{student.name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelTextStyle}>Age:</span>
              <span style={valueTextStyle}>{student.age}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelTextStyle}>Class:</span>
              <span style={valueTextStyle}>{student.class}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelTextStyle}>Admission Number:</span>
              <span style={valueTextStyle}>{student.admissionNumber}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelTextStyle}>Email:</span>
              <span style={valueTextStyle}>{student.email}</span>
            </div>

            <div style={buttonContainerStyle}>
              <button onClick={() => setEditing(true)} style={editButtonStyle}>
                Edit Profile
              </button>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={editFormStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: validationErrors.name ? '#ef4444' : '#d1d5db'
                  }}
                />
                <ErrorMessage error={validationErrors.name} />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Age:
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  min="5"
                  max="100"
                  style={{
                    ...inputStyle,
                    borderColor: validationErrors.age ? '#ef4444' : '#d1d5db'
                  }}
                />
                <ErrorMessage error={validationErrors.age} />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Class:
                <input
                  type="text"
                  name="class"
                  value={formData.class || ''}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: validationErrors.class ? '#ef4444' : '#d1d5db'
                  }}
                />
                <ErrorMessage error={validationErrors.class} />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Admission Number:
                <input
                  type="text"
                  value={formData.admissionNumber || ''}
                  disabled
                  style={disabledInputStyle}
                />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Email:
                <input
                  type="email"
                  value={formData.email || ''}
                  disabled
                  style={disabledInputStyle}
                />
              </label>
            </div>

            {error && (
              <div style={errorMessageStyle}>
                {error}
              </div>
            )}

            <div style={buttonContainerStyle}>
              <button
                onClick={handleSave}
                disabled={updateLoading}
                style={updateLoading ? disabledSaveButtonStyle : saveButtonStyle}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={updateLoading}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
  padding: '24px 16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  padding: '32px',
  width: '100%',
  maxWidth: '600px',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '32px',
  fontSize: '28px',
  fontWeight: '700',
  color: '#111827',
  borderBottom: '2px solid #e5e7eb',
  paddingBottom: '16px',
};

const profilePictureContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
};

const profileImageStyle = {
  width: '150px',
  height: '150px',
  borderRadius: '12px',
  objectFit: 'cover',
  border: '3px solid #e5e7eb',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f3f4f6',
};

const labelTextStyle = {
  fontWeight: '600',
  color: '#374151',
  fontSize: '16px',
};

const valueTextStyle = {
  color: '#111827',
  fontSize: '16px',
};

const editFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '2px solid #d1d5db',
  marginTop: '4px',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
};

const disabledInputStyle = {
  ...inputStyle,
  backgroundColor: '#f9fafb',
  color: '#6b7280',
  cursor: 'not-allowed',
};

const fileInputStyle = {
  width: '100%',
  padding: '8px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '2px solid #d1d5db',
  marginTop: '4px',
  backgroundColor: '#f9fafb',
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
  justifyContent: 'center',
};

const editButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const logoutButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const saveButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const disabledSaveButtonStyle = {
  ...saveButtonStyle,
  backgroundColor: '#9ca3af',
  cursor: 'not-allowed',
};

const cancelButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#6b7280',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const errorMessageStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
};

const loadingSpinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const errorContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
  padding: '16px',
};

const errorBoxStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #fecaca',
  textAlign: 'center',
};

export default Profile;