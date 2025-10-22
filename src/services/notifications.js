import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const notificationService = {
  // Récupérer les notifications
  async getNotifications() {
    try {
      const response = await api.get(ENDPOINTS.NOTIFICATIONS);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des notifications' 
      };
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const response = await api.post(ENDPOINTS.NOTIFICATIONS_READ, { notification_id: notificationId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la mise à jour de la notification' 
      };
    }
  },

  // Supprimer toutes les notifications
  async clearAllNotifications() {
    try {
      const response = await api.delete(ENDPOINTS.NOTIFICATIONS_CLEAR);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la suppression des notifications' 
      };
    }
  },

  // Récupérer le compteur de notifications non lues
  async getUnreadCount() {
    try {
      const response = await api.get(ENDPOINTS.NOTIFICATIONS_COUNT);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération du compteur' 
      };
    }
  }
};
