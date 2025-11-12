import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const vehicleService = {
  // Récupérer les véhicules du chauffeur
  async getDriverVehicles() {
    try {
      const response = await api.get(ENDPOINTS.VEHICULES_MES);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des véhicules' 
      };
    }
  },

  // Activer/Désactiver GPS d'un véhicule
  async updateGpsStatus(vehicleId, enabled) {
    try {
      const response = await api.put(
        ENDPOINTS.VEHICULES_GPS.replace(':vehiculeId', vehicleId), 
        { statut_gps: enabled }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du GPS' 
      };
    }
  },

  // Récupérer les trajets du jour pour un véhicule
  async getVehicleTrips(vehicleId) {
    try {
      const response = await api.get(ENDPOINTS.VEHICULES_TRAJETS.replace(':vehiculeId', vehicleId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des trajets' 
      };
    }
  },

  // Envoyer position GPS
  async sendPosition(vehicleId, latitude, longitude) {
    try {
      const response = await api.post(ENDPOINTS.POSITIONS, {
        vehicule_id: vehicleId,
        latitude,
        longitude
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de l\'envoi de la position' 
      };
    }
  },

  // Récupérer l'historique GPS d'un véhicule
  async getVehicleGpsHistory(vehicleId) {
    try {
      const response = await api.get(ENDPOINTS.VEHICULES_HISTORIQUE.replace(':vehiculeId', vehicleId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique GPS' 
      };
    }
  }
};
