import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gpsTrackingService } from '../services/gpsTracking';
import { storage } from '../services/storage';

const GpsContext = createContext();

const gpsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRACKING':
      return { ...state, isTracking: action.payload };
    case 'SET_VEHICLE':
      return { ...state, selectedVehicle: action.payload };
    case 'SET_POSITION':
      return { ...state, currentPosition: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isTracking: false,
  selectedVehicle: null,
  currentPosition: null,
  error: null,
};

export const GpsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gpsReducer, initialState);

  useEffect(() => {
    initializeGps();
    
    return () => {
      // Nettoyer le tracking au démontage
      gpsTrackingService.stopTracking();
    };
  }, []);

  const initializeGps = async () => {
    try {
      const selectedVehicle = await storage.getSelectedVehicle();
      const gpsEnabled = await storage.getGpsEnabled();

      if (selectedVehicle) {
        dispatch({ type: 'SET_VEHICLE', payload: selectedVehicle });
        
        if (gpsEnabled && selectedVehicle.statut_gps) {
          await startTracking(selectedVehicle);
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de l\'initialisation du GPS' });
    }
  };

  const startTracking = async (vehicle) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const success = await gpsTrackingService.startTracking(vehicle);
      
      if (success) {
        dispatch({ type: 'SET_TRACKING', payload: true });
        dispatch({ type: 'SET_VEHICLE', payload: vehicle });
        await storage.setSelectedVehicle(vehicle);
        await storage.setGpsEnabled(true);
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Impossible de démarrer le tracking GPS' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du démarrage du GPS' });
    }
  };

  const stopTracking = async () => {
    try {
      await gpsTrackingService.stopTracking();
      dispatch({ type: 'SET_TRACKING', payload: false });
      await storage.setGpsEnabled(false);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de l\'arrêt du GPS' });
    }
  };

  const updateVehicle = async (vehicle) => {
    try {
      dispatch({ type: 'SET_VEHICLE', payload: vehicle });
      await storage.setSelectedVehicle(vehicle);
      
      if (vehicle.statut_gps && !state.isTracking) {
        await startTracking(vehicle);
      } else if (!vehicle.statut_gps && state.isTracking) {
        await stopTracking();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la mise à jour du véhicule' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    startTracking,
    stopTracking,
    updateVehicle,
    clearError,
  };

  return <GpsContext.Provider value={value}>{children}</GpsContext.Provider>;
};

export const useGps = () => {
  const context = useContext(GpsContext);
  if (!context) {
    throw new Error('useGps must be used within a GpsProvider');
  }
  return context;
};
