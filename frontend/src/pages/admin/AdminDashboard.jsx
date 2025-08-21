// AdminDashboard.jsx
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchStudents, deleteStudent ,updateStudent, createStudent } from '../../features/admin/adminSlice';
import StudentForm from './StudentForm';
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from '../../features/admin/adminSlice';


const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students ,loading, error } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleCreate = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  
  const handleEdit = (student) => {
    navigate(`/admin/edit/${student._id}`);
    // setEditingStudent(student);
    // setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      dispatch(deleteStudent(id));
    }
  };

  // const handleFormSubmit = (data) => {
  //   if (editingStudent) {
  //     dispatch(updateStudent({ id: editingStudent._id, updateData: data }));
  //   } else {
  //     dispatch(createStudent(data));
  //   }
  //   setShowForm(false);
  //   setEditingStudent(null);
  // };

  // const handleFormSubmit = (data) => {
  //   const formDataToSend = new FormData();
  //   for (const key in data) {
  //     formDataToSend.append(key, data[key]);
  //   }
  
  //   if (editingStudent) {
  //     dispatch(updateStudent({ id: editingStudent._id, updateData: formDataToSend }));
  //   } else {
  //     dispatch(createStudent(formDataToSend));
  //   }
  
  //   setShowForm(false);
  //   setEditingStudent(null);
  // };

  const handleFormSubmit = async (formData) => {
    if (editingStudent) {
      await dispatch(updateStudent({ id: editingStudent._id, updateData: formData }));
      dispatch(fetchStudents());
    } else {
      const result = await dispatch(createStudent(formData));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchStudents());
      }
    }
  
    setShowForm(false);
    setEditingStudent(null);
  };
  
  

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    dispatch(logoutAdmin());  // or your actual token key
    navigate("/admin/login",{replace:true});
  };


  const filteredStudents = students?.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "1.5rem", maxWidth: "100%", boxSizing: "border-box" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        Admin Dashboard
      </h1>
  
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Search students"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleCreate}
          style={{
            backgroundColor: "#2563eb", // blue-600
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")} // blue-800
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
        >
          + Create Student
        </button>
        <button
      onClick={handleLogout}
      style={{
        backgroundColor: "#dc2626", // red-600
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        border: "none",
        cursor: "pointer",
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = "#991b1b")}
      onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
    >
      Logout
    </button>
      </div>
  
      {showForm && (
        <StudentForm
          initialData={{
            ...editingStudent,
            profilePic: editingStudent?.profilePic || "",
          }}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}
  
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
  
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e5e7eb" }}>
              <th style={tableHeaderStyle}>Admission No</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Edit</th>
              <th style={tableHeaderStyle}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents?.map((student) => (
              <tr key={student._id}>
                <td style={tableCellStyle}>{student.admissionNumber}</td>
                <td style={tableCellStyle}>{student.name}</td>
                <td style={tableCellStyle}>{student.email}</td>
                <td style={tableCellStyle}>
  <button
    onClick={() => handleEdit(student)}
    style={{
      backgroundColor: "#2563eb", // blue-600
      color: "#fff",
      padding: "0.3rem 0.75rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      marginRight: "0.5rem",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")} // blue-800
    onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
  >
    Edit
  </button>
</td>
<td style={tableCellStyle}>
  <button
    onClick={() => handleDelete(student._id)}
    style={{
      backgroundColor: "#dc2626", // red-600
      color: "#fff",
      padding: "0.3rem 0.75rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#991b1b")} // red-800
    onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const tableHeaderStyle = {
  border: "0.5px solid #ccc",
  padding: "0.2rem",
  textAlign: "left",
  fontWeight: "bold",
};

const tableCellStyle = {
  border: "1px solid #ccc",
  padding: "0.4rem",
};

export default AdminDashboard;
