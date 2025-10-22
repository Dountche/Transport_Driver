import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const dashboardService = {
  // Récupérer le dashboard chauffeur
  async getDriverDashboard() {
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD_CHAUFFEUR);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération du dashboard' 
      };
    }
  },

  // Récupérer les données temps réel
  async getRealtimeData() {
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD_REALTIME);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des données temps réel' 
      };
    }
  }
};
