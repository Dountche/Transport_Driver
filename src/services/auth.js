import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const authService = {
  // Demander la vérification email
  async requestVerification(userData) {
    try {
      const response = await api.post(ENDPOINTS.AUTH_REGISTER_REQUEST, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de l\'inscription' 
      };
    }
  },

  // Vérifier le code email
  async verifyRegistration(email, code) {
    try {
      const response = await api.post(ENDPOINTS.AUTH_REGISTER_VERIFY, { email, code });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Code de vérification invalide' 
      };
    }
  },

  // Connexion
  async login(email, mot_de_passe) {
    try {
      const response = await api.post(ENDPOINTS.AUTH_LOGIN, { email, mot_de_passe });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Identifiants incorrects' 
      };
    }
  },

  // Mot de passe oublié
  async forgotPassword(email) {
    try {
      const response = await api.post(ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email' 
      };
    }
  },

  // Reset mot de passe
  async resetPassword(token, mot_de_passe, confirm_mot_de_passe) {
    try {
      const response = await api.post(ENDPOINTS.AUTH_RESET_PASSWORD, { 
        token, 
        mot_de_passe, 
        confirm_mot_de_passe 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la réinitialisation' 
      };
    }
  },

  // Récupérer profil
  async getProfile() {
    try {
      const response = await api.get(ENDPOINTS.PROFIL_ME);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la récupération du profil' 
      };
    }
  },

  // Mettre à jour profil
  async updateProfile(userData) {
    try {
      const response = await api.put(ENDPOINTS.PROFIL_ME, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la mise à jour' 
      };
    }
  },

  // Supprimer compte
  async deleteAccount() {
    try {
      const response = await api.delete(ENDPOINTS.PROFIL_ME);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la suppression' 
      };
    }
  }
};
