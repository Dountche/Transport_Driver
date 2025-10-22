import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

export const storage = {
  // gestion de Token
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // données User
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async setUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  },

  // Véhicule sélectionné
  async getSelectedVehicle() {
    try {
      const vehicle = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_VEHICLE);
      return vehicle ? JSON.parse(vehicle) : null;
    } catch (error) {
      console.error('Error getting selected vehicle:', error);
      return null;
    }
  },

  async setSelectedVehicle(vehicle) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_VEHICLE, JSON.stringify(vehicle));
    } catch (error) {
      console.error('Error setting selected vehicle:', error);
    }
  },

  // GPS Status
  async getGpsEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.GPS_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error getting GPS status:', error);
      return false;
    }
  },

  async setGpsEnabled(enabled) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GPS_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting GPS status:', error);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REMEMBER_ME,
        STORAGE_KEYS.SELECTED_VEHICLE,
        STORAGE_KEYS.GPS_ENABLED
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};
