import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const transportService = {
  // Récupérer tous les trajets
  async getTrajets() {
    try {
      const response = await api.get(ENDPOINTS.TRAJETS);
      return { success: true, data: response.data.trajets || [] };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des trajets' 
      };
    }
  },

  // Récupérer toutes les lignes
  async getLignes() {
    try {
      const response = await api.get(ENDPOINTS.LIGNES);
      return { success: true, data: response.data.lignes || [] };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des lignes' 
      };
    }
  },

  // Récupérer tous les véhicules
  async getVehicules() {
    try {
      const response = await api.get(ENDPOINTS.VEHICULES);
      return { success: true, data: response.data.vehicules || [] };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des véhicules' 
      };
    }
  },

  // Récupérer les véhicules du chauffeur
  async getDriverVehicules() {
    try {
      const response = await api.get(ENDPOINTS.VEHICULES_MES);
      console.log('Backend response:', response.data);
      
      // Transformer les données pour correspondre à la structure attendue niveau front
      const vehicules = response.data.vehicules?.map(item => ({
        id: item.vehicule.id,
        immatriculation: item.vehicule.immatriculation,
        type: item.vehicule.type,
        statut_gps: item.vehicule.statut_gps,
        position: item.position,
        assignation: item.assignation,
        prochains_trajets: item.prochains_trajets,
        stats: item.stats
      })) || [];
      
      console.log('Transformed vehicles:', vehicules);
      return { success: true, data: vehicules };
    } catch (error) {
      console.error('Error fetching driver vehicles:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération des véhicules du chauffeur' 
      };
    }
  },

  // Récupérer la dernière position d'un véhicule
  async getLastVehiclePosition(vehiculeId) {
    try {
      const response = await api.get(`${ENDPOINTS.POSITIONS_LAST}/${vehiculeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération de la position' 
      };
    }
  },

  // Récupérer la route d'un véhicule
  async getVehicleRoute(vehiculeId, params = {}) {
    try {
      const response = await api.get(`${ENDPOINTS.POSITIONS_ROUTE}/${vehiculeId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération de la route' 
      };
    }
  },

  // Envoyer position GPS
  async sendPosition(vehiculeId, latitude, longitude) {
    try {
      const response = await api.post(`${ENDPOINTS.POSITIONS}`, {
        vehicule_id: vehiculeId,
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
  }
};
