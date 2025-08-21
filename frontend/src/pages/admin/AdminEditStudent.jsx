import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "./StudentForm";

const AdminEditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem("adminToken");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch (error) {
        console.error("Error fetching student:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          setError('Failed to fetch student data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, token, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setError('');
      
      const updated = new FormData();
      for (let key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
          // Only append password if it's not empty (for edit mode)
          if (key === 'password' && !formData[key]) {
            continue;
          }
          updated.append(key, formData[key]);
        }
      }

      await axios.put(`http://localhost:5000/api/admin/students/${id}`, updated, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin");
    } catch (error) {
      console.error("Update failed:", error);
      setError(error.response?.data?.message || 'Failed to update student');
      throw error; // Re-throw to let StudentForm handle loading state
    }
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading student data...</p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorBoxStyle}>
          <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Error</h3>
          <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={retryButtonStyle}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={backButtonStyle}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          onClick={() => navigate('/admin')}
          style={backNavButtonStyle}
        >
          ← Back to Dashboard
        </button>
        <h2 style={titleStyle}>
          Edit Student
        </h2>
        {student && (
          <p style={subtitleStyle}>
            Editing: {student.name} ({student.admissionNumber})
          </p>
        )}
      </div>

      {error && (
        <div style={errorMessageStyle}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {student && (
        <StudentForm
          initialData={{ 
            ...student, 
            profilePic: student.profilePic || "",
            password: "" // Don't prefill password for security
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          isEdit={true}
        />
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
  padding: '24px 16px',
};

const headerStyle = {
  maxWidth: '768px',
  margin: '0 auto 24px auto',
  textAlign: 'center',
};

const backNavButtonStyle = {
  backgroundColor: '#6b7280',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  marginBottom: '16px',
  transition: 'background-color 0.2s ease',
};

const titleStyle = {
  fontSize: '1.875rem',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const subtitleStyle = {
  fontSize: '1rem',
  color: '#6b7280',
  marginTop: '8px',
  margin: '8px 0 0 0',
};

const errorMessageStyle = {
  maxWidth: '768px',
  margin: '0 auto 24px auto',
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
  maxWidth: '400px',
};

const retryButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
};

const backButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#6b7280',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
};

export default AdminEditStudent;