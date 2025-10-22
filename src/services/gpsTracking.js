import * as Location from 'expo-location';
import { vehicleService } from './vehicles';
import { storage } from './storage';

class GpsTrackingService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.currentVehicle = null;
    this.lastPosition = null;
    this.trackingInterval = null;
  }

  async startTracking(vehicle) {
    try {
      // Vérifier les permissions de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      this.currentVehicle = vehicle;
      this.isTracking = true;

      // Démarrer le tracking GPS
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Mise à jour toutes les 2 secondes
          distanceInterval: 10, // Mise à jour si déplacement de 10m
        },
        this.handleLocationUpdate.bind(this)
      );

      console.log(`GPS tracking démarré pour le véhicule ${vehicle.immatriculation}`);
      return true;
    } catch (error) {
      console.error('Erreur lors du démarrage du GPS tracking:', error);
      return false;
    }
  }

  async stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }

    this.isTracking = false;
    this.currentVehicle = null;
    this.lastPosition = null;

    console.log('GPS tracking arrêté');
  }

  async handleLocationUpdate(location) {
    if (!this.isTracking || !this.currentVehicle) return;

    const { latitude, longitude } = location.coords;
    const currentPosition = { latitude, longitude };

    // Vérifier si la position a changé significativement
    if (this.hasPositionChanged(currentPosition)) {
      try {
        // Envoyer la position au backend
        const result = await vehicleService.sendPosition(
          this.currentVehicle.id,
          latitude,
          longitude
        );

        if (result.success) {
          console.log(`Position envoyée: ${latitude}, ${longitude}`);
          this.lastPosition = currentPosition;
        } else {
          console.error('Erreur lors de l\'envoi de la position:', result.message);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la position:', error);
      }
    }
  }

  hasPositionChanged(newPosition) {
    if (!this.lastPosition) return true;

    // Calculer la distance entre les positions
    const distance = this.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      newPosition.latitude,
      newPosition.longitude
    );

    // Envoyer la position si le véhicule a bougé de plus de 10 mètres
    return distance > 10;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  }

  async initializeTracking() {
    try {
      // Récupérer le véhicule sélectionné
      const selectedVehicle = await storage.getSelectedVehicle();
      const gpsEnabled = await storage.getGpsEnabled();

      if (selectedVehicle && gpsEnabled && selectedVehicle.statut_gps) {
        await this.startTracking(selectedVehicle);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du tracking:', error);
    }
  }

  async updateVehicle(vehicle) {
    if (this.currentVehicle && this.currentVehicle.id === vehicle.id) {
      if (vehicle.statut_gps && !this.isTracking) {
        await this.startTracking(vehicle);
      } else if (!vehicle.statut_gps && this.isTracking) {
        await this.stopTracking();
      }
    }
  }
}

export const gpsTrackingService = new GpsTrackingService();
