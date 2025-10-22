import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import { websocketService } from '../services/websocket';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, loading: false };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_AS_READ':
      return { 
        ...state, 
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, lu: true } : notif
        )
      };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    // Écouter les événements WebSocket
    websocketService.on('notification', handleNewNotification);
    websocketService.on('reservationCreated', handleReservationCreated);
    
    return () => {
      websocketService.off('notification', handleNewNotification);
      websocketService.off('reservationCreated', handleReservationCreated);
    };
  }, []);

  const handleNewNotification = (data) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: data });
    dispatch({ type: 'SET_UNREAD_COUNT', payload: state.unreadCount + 1 });
  };

  const handleReservationCreated = (data) => {
    // Créer une notification pour une nouvelle réservation
    const notification = {
      id: Date.now(),
      type: 'reservation',
      titre: 'Nouvelle réservation',
      message: `Un client a demandé une réservation pour votre véhicule`,
      lu: false,
      date_creation: new Date().toISOString(),
      data: data
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    dispatch({ type: 'SET_UNREAD_COUNT', payload: state.unreadCount + 1 });
  };

  const loadNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await notificationService.getNotifications();
    
    if (result.success) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: result.data.notifications || [] });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    return result;
  };

  const loadUnreadCount = async () => {
    const result = await notificationService.getUnreadCount();
    
    if (result.success) {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: result.data.count || 0 });
    }

    return result;
  };

  const markAsRead = async (notificationId) => {
    const result = await notificationService.markAsRead(notificationId);
    
    if (result.success) {
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: Math.max(0, state.unreadCount - 1) });
    }

    return result;
  };

  const clearAllNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await notificationService.clearAllNotifications();
    
    if (result.success) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
    } else {
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
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    clearAllNotifications,
    clearError,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
