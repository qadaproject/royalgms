import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123$&';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in from localStorage
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'authenticated') {
      setUser({ id: 'admin', name: 'Admin', role: 'admin' });
      setIsAuthenticated(true);
      setIsAdminMode(true);
    }
  }, []);

  const checkUserAuth = async () => {
    // User auth is managed locally through admin login
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  const loginAdmin = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setUser({ id: 'admin', name: 'Admin', role: 'admin' });
      setIsAuthenticated(true);
      setIsAdminMode(true);
      localStorage.setItem('adminToken', 'authenticated');
      return true;
    }
    return false;
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminMode(false);
    localStorage.removeItem('adminToken');
    
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      isAdminMode,
      logout,
      navigateToLogin,
      checkUserAuth,
      loginAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
