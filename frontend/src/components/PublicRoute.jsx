
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      
      navigate('/profile');
    }
  }, [navigate]);

  const token = localStorage.getItem('studentToken');
  if (token) {
    return null;
  }

  return children;
};

export default PublicRoute;