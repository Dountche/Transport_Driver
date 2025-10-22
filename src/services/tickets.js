import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const ticketService = {
  // Valider un ticket (scanner QR)
  async validateTicket(qrCode) {
    try {
      const response = await api.post(ENDPOINTS.TICKETS_VALIDATE, { qr_code: qrCode });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la validation du ticket' 
      };
    }
  },

  // Confirmer paiement espèces
  async confirmCashPayment(ticketId) {
    try {
      const response = await api.post(ENDPOINTS.TICKETS_CONFIRM_CASH.replace(':ticketId', ticketId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la confirmation du paiement' 
      };
    }
  },

  // Récupérer les tickets validés par le chauffeur
  async getDriverTickets() {
    try {
      const response = await api.get(ENDPOINTS.TICKETS_DRIVER_LIST);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des tickets' 
      };
    }
  }
};
