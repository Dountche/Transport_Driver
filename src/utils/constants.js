import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const localIP = debuggerHost?.split(':')[0];

export const API_BASE_URL = localIP ? `http://${localIP}:3000/api` : 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER_REQUEST: '/auth/register/requestVerification',
  AUTH_REGISTER_VERIFY: '/auth/register/verify',
  AUTH_LOGIN: '/auth/login',
  AUTH_FORGOT_PASSWORD: '/auth/password/forgot',
  AUTH_RESET_PASSWORD: '/auth/password/reset',

  // Profil
  PROFIL_ME: '/profil/me',
  
  // Tickets - Chauffeur
  TICKETS_VALIDATE: '/tickets/validate',
  TICKETS_CONFIRM_CASH: '/tickets/:ticketId/confirm-cash',
  TICKETS_DRIVER_LIST: '/tickets/driver/list',
  
  // Paiements - Chauffeur
  PAIEMENTS_ESPECES: '/paiements/especes',
  
  // Reservations - Chauffeur
  RESERVATIONS_CHAUFFEUR: '/reservations/chauffeur',
  RESERVATIONS_UPDATE_STATUS: '/reservations/:id/statut',
  
  // Véhicules - Chauffeur
  VEHICULES_MES: '/vehicules/mes-vehicules',
  VEHICULES_GPS: '/vehicules/:vehiculeId/gps',
  VEHICULES_TRAJETS: '/vehicules/:vehiculeId/trajets',
  VEHICULES_POSITION: '/vehicules/:vehiculeId/position',
  VEHICULES_HISTORIQUE: '/vehicules/:vehiculeId/historique-gps',
  
  // Transport
  TRAJETS: '/trajets',
  LIGNES: '/lignes',
  VEHICULES: '/vehicules',
  
  // GPS
  POSITIONS: '/positions',
  POSITIONS_LAST: '/positions/last/:vehiculeId',
  POSITIONS_ROUTE: '/positions/route/:vehiculeId',
  
  // Dashboard
  DASHBOARD_CHAUFFEUR: '/dashboard/chauffeur',
  DASHBOARD_REALTIME: '/dashboard/realtime',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_COUNT: '/notifications/count',
  NOTIFICATIONS_READ: '/notifications/read',
  NOTIFICATIONS_CLEAR: '/notifications/all'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  SELECTED_VEHICLE: 'selected_vehicle',
  GPS_ENABLED: 'gps_enabled'
};

export const PAYMENT_METHODS = {
  WAVE: 'WAVE',
  ESPECES: 'ESPECES'
};

export const RESERVATION_STATUS = {
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  EN_COURS: 'en_cours',
  TERMINEE: 'terminee',
  ANNULEE: 'annulee'
};

export const VEHICLE_STATUS = {
  EN_LIGNE: 'en_ligne',
  HORS_LIGNE: 'hors_ligne',
  EN_PANNE: 'en_panne'
};
