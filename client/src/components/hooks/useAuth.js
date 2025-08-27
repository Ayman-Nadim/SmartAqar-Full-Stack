import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { isAuthenticated, user, login, logout } = useAuthContext();
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('smartaquar_token');
    const userData = localStorage.getItem('smartaquar_user');
    
    return !!(token && userData && isAuthenticated);
  };

  const forceLogout = () => {
    localStorage.removeItem('smartaquar_token');
    localStorage.removeItem('smartaquar_user');
    logout();
    navigate('/login', { replace: true });
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('smartaquar_token');
    
    if (!token) {
      forceLogout();
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        forceLogout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      forceLogout();
      return false;
    }
  };

  return {
    isAuthenticated: checkAuthStatus(),
    user,
    login,
    logout: forceLogout,
    verifyToken,
    checkAuthStatus
  };
};