import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { storage } from '../services/storage';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, isRegistering: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'START_REGISTERING':
      return { ...state, isRegistering: true };
    case 'STOP_REGISTERING':
      return { ...state, isRegistering: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, isRegistering: false };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isRegistering: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const cachedUser = await storage.getUserData();
        if (cachedUser) {
          dispatch({ type: 'SET_USER', payload: cachedUser });
        }
        
        const result = await authService.getProfile();
        if (result.success) {
          const userData = result.data.utilisateur || result.data;
          await storage.setUserData(userData);
          dispatch({ type: 'SET_USER', payload: userData });
        } else {
          await storage.clearAll();
          dispatch({ type: 'LOGOUT' });
        }
      }
      } catch (error) {
        console.error('Error checking auth status:', error);
        await storage.clearAll();
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await authService.login(email, password);
    
    if (result.success) {
      const { token, utilisateur } = result.data;
      if (utilisateur.role.nom !== 'chauffeur') {
        dispatch({ type: 'SET_ERROR', payload: 'Accès réservé aux chauffeurs uniquement' });
        dispatch({ type: 'SET_LOADING', payload: false });
        storage.clearAll();
        return { success: false, message: 'Accès réservé aux chauffeurs uniquement' };
      }
      await storage.setToken(token);
      await storage.setUserData(utilisateur);
      dispatch({ type: 'SET_USER', payload: utilisateur });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const register = async (userData) => {
    dispatch({ type: 'START_REGISTERING' });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await authService.requestVerification(userData);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.message });
      dispatch({ type: 'STOP_REGISTERING' });
    }

    return result;
  };

  const verifyRegistration = async (email, code) => {
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await authService.verifyRegistration(email, code);
    
    if (result.success) {
      const { token, utilisateur } = result.data;
      await storage.setToken(token);
      await storage.setUserData(utilisateur);
      dispatch({ type: 'SET_USER', payload: utilisateur });
      dispatch({ type: 'STOP_REGISTERING' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    return result;
  };

  const logout = async () => {
    await storage.clearAll();
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await authService.forgotPassword(email);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await authService.resetPassword(token, password, confirmPassword);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    verifyRegistration,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
