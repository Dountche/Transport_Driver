import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const ticketService = {

  // Valider un ticket (scanner QR)
  async validateTicket(qrCode) {
    try {
      const response = await api.post(ENDPOINTS.TICKETS_VALIDATE, { token: qrCode });
      
      return { 
        success: true, 
        valid: response.data.valid,
        status: response.data.status,
        message: response.data.message,
        requiresConfirmation: response.data.requiresConfirmation,
        ticket: response.data.ticket,
        client: response.data.client,
        data: response.data 
      };
    } catch (error) {
      console.error('[TicketService] Erreur validation:', error.response?.data);
      
      return { 
        success: false,
        valid: false,
        message: error.response?.data?.message || 'Erreur lors de la validation du ticket',
        reason: error.response?.data?.reason || null,
        alertType: error.response?.data?.alertType || 'error'
      };
    }
  },

  // Confirmer paiement espèces
  async confirmCashPayment(ticketId, montant) {
    try {
      const response = await api.post('/api/paiements/confirm', {
        ticket_id: ticketId,
        montant: montant
      });
      
      return { 
        success: true, 
        paiement: response.data.paiement,
        ticket: response.data.ticket,
        message: response.data.message
      };
    } catch (error) {
      console.error('[TicketService] Erreur paiement espèces:', error.response?.data);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la confirmation du paiement' 
      };
    }
  },

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