import io from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';
import { storage } from './storage';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = await storage.getToken();
    
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.socket = io(API_BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Événements spécifiques chauffeur
    this.setupDriverListeners();
  }

  setupDriverListeners() {
    // Tickets
    this.socket.on('ticketValidated', (data) => {
      this.emit('ticketValidated', data);
    });

    // Réservations
    this.socket.on('reservationCreated', (data) => {
      this.emit('reservationCreated', data);
    });

    this.socket.on('reservationAccepted', (data) => {
      this.emit('reservationAccepted', data);
    });

    this.socket.on('reservationCancelled', (data) => {
      this.emit('reservationCancelled', data);
    });

    // GPS & Véhicules
    this.socket.on('vehiclePosition', (data) => {
      this.emit('vehiclePosition', data);
    });

    this.socket.on('vehicleStatusChanged', (data) => {
      this.emit('vehicleStatusChanged', data);
    });

    // Dashboard
    this.socket.on('dashboard:update', (data) => {
      this.emit('dashboardUpdate', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    });
  }

  send(event, data) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot send event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Méthodes spécifiques chauffeur
  subscribeToDashboard() {
    this.send('subscribeDashboard', 'dashboard');
  }

  unsubscribeFromDashboard() {
    this.send('unsubscribeDashboard', 'dashboard');
  }
}

export const websocketService = new WebSocketService();
