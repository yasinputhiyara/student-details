import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      
      navigate('/admin');
    }
  }, [navigate]);

  const token = localStorage.getItem('adminToken');
  if (token) {
    return null;
  }

  return children;
};

export default AdminPublicRoute;