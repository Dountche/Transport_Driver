import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const reservationService = {
  // Récupérer les réservations du chauffeur
  async getDriverReservations() {
    try {
      const response = await api.get(ENDPOINTS.RESERVATIONS_CHAUFFEUR);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des réservations' 
      };
    }
  },

  // Mettre à jour le statut d'une réservation
  async updateReservationStatus(reservationId, status, motif = null) {
    try {
      const response = await api.put(
        ENDPOINTS.RESERVATIONS_UPDATE_STATUS.replace(':id', reservationId), 
        { statut: status, motif }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la mise à jour de la réservation' 
      };
    }
  }
};
