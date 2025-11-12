import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { transportService } from '../../services/transport';
import { vehicleService } from '../../services/vehicles';
import { gpsTrackingService } from '../../services/gpsTracking';
import { storage } from '../../services/storage';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Coordonnées par défaut pour Abidjan
const INITIAL_REGION = {
  latitude: 5.3364,
  longitude: -4.0267,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const DriverMapView = ({ navigation }) => {
  const [region, setRegion] = useState(INITIAL_REGION);
  const [loading, setLoading] = useState(true);
  const [vehicules, setVehicules] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showDriverPosition, setShowDriverPosition] = useState(false);

  useEffect(() => {
    loadMapData();
    initializeGpsTracking();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      console.log('Loading map data...');
      // Charger les véhicules du chauffeur
      const vehiculesResult = await transportService.getDriverVehicules();
      console.log('Vehicules result:', vehiculesResult);
      
      if (vehiculesResult.success) {
        console.log('Vehicules data:', vehiculesResult.data);
        const vehiculesWithPositions = await Promise.all(
          vehiculesResult.data.map(async (vehicule) => {
            const positionResult = await transportService.getLastVehiclePosition(vehicule.id);
            return {
              ...vehicule,
              position: positionResult.success ? positionResult.data : null
            };
          })
        );
        console.log('Vehicules with positions:', vehiculesWithPositions);
        setVehicules(vehiculesWithPositions);
      }

      // Charger les lignes
      const lignesResult = await transportService.getLignes();
      if (lignesResult.success) {
        setLignes(lignesResult.data);
      }

    } catch (error) {
      console.error('Error loading map data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la carte');
    } finally {
      setLoading(false);
    }
  };

  const initializeGpsTracking = async () => {
    try {
      const savedVehicle = await storage.getSelectedVehicle();
      const gpsEnabled = await storage.getGpsEnabled();
      
      if (savedVehicle) {
        setSelectedVehicle(savedVehicle);
        setGpsEnabled(gpsEnabled);
        
        if (gpsEnabled && savedVehicle.statut_gps) {
          await gpsTrackingService.startTracking(savedVehicle);
        }
      }
    } catch (error) {
      console.error('Error initializing GPS tracking:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const position = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentPosition(position);
      setShowDriverPosition(true);

      // Centrer la carte sur la position du chauffeur
      setRegion({
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: LATITUDE_DELTA / 4,
        longitudeDelta: LONGITUDE_DELTA / 4,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir la position actuelle');
    }
  };

  const handleVehicleSelection = async (vehicule) => {
    setSelectedVehicle(vehicule);
    await storage.setSelectedVehicle(vehicule);
    
    if (vehicule.position) {
      setRegion({
        latitude: vehicule.position.latitude,
        longitude: vehicule.position.longitude,
        latitudeDelta: LATITUDE_DELTA / 4,
        longitudeDelta: LONGITUDE_DELTA / 4,
      });
    }
  };

  const toggleGps = async (vehicule) => {
    // Vérifier que le véhicule est sélectionné
    if (!vehicule || !vehicule.id) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un véhicule');
      return;
    }

    try {
      const result = await vehicleService.updateGpsStatus(vehicule.id, !vehicule.statut_gps);
      if (result.success) {
        const updatedVehicule = { ...vehicule, statut_gps: !vehicule.statut_gps };
        
        // Mettre à jour la liste des véhicules
        setVehicules(vehicules.map(v => 
          v.id === vehicule.id ? updatedVehicule : v
        ));

        // Mettre à jour le véhicule sélectionné
        if (selectedVehicle?.id === vehicule.id) {
          setSelectedVehicle(updatedVehicule);
          await storage.setSelectedVehicle(updatedVehicule);
        }

        // Gérer le tracking GPS
        if (updatedVehicule.statut_gps) {
          setGpsEnabled(true);
          await storage.setGpsEnabled(true);
          await gpsTrackingService.startTracking(updatedVehicule);
        } else {
          setGpsEnabled(false);
          await storage.setGpsEnabled(false);
          await gpsTrackingService.stopTracking();
        }

        Alert.alert(
          'GPS ' + (!vehicule.statut_gps ? 'activé' : 'désactivé'),
          `Le GPS du véhicule ${vehicule.immatriculation} a été ${!vehicule.statut_gps ? 'activé' : 'désactivé'}`
        );
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut GPS');
    }
  };

  const renderVehicleMarkers = () => {
    return vehicules
      .filter(vehicule => vehicule.position && vehicule.id)
      .map((vehicule) => (
        <Marker
          key={`vehicle-${vehicule.id}`}
          coordinate={{
            latitude: vehicule.position.latitude,
            longitude: vehicule.position.longitude,
          }}
          title={`Véhicule ${vehicule.immatriculation}`}
          description={`Type: ${vehicule.type} - GPS: ${vehicule.statut_gps ? 'Actif' : 'Inactif'}`}
          onPress={() => handleVehicleSelection(vehicule)}
        >
          <View style={[
            styles.vehicleMarker, 
            { backgroundColor: vehicule.statut_gps ? '#34C759' : '#FF3B30' }
          ]}>
            <Ionicons name="bus" size={20} color="#fff" />
          </View>
        </Marker>
      ));
  };

  const renderRouteLines = () => {
    if (!showRoutes) return null;

    return lignes.map((ligne) => {
      const arrets = Array.isArray(ligne.arrets) ? ligne.arrets : [];
      
      const coordinates = arrets.map(arret => ({
        latitude: arret.latitude || 5.3364,
        longitude: arret.longitude || -4.0267,
      }));

      if (coordinates.length < 2) return null;

      return (
        <Polyline
          key={`line-${ligne.id}`}
          coordinates={coordinates}
          strokeColor="#007AFF"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      );
    });
  };

  const renderArretMarkers = () => {
    if (!showRoutes) return null;

    const markers = [];
    lignes.forEach((ligne) => {
      const arrets = Array.isArray(ligne.arrets) ? ligne.arrets : [];
      
      arrets.forEach((arret, index) => {
        if (arret.latitude && arret.longitude) {
          markers.push(
            <Marker
              key={`arret-${ligne.id}-${index}`}
              coordinate={{
                latitude: arret.latitude,
                longitude: arret.longitude,
              }}
              title={arret.nom}
              description={`Ligne: ${ligne.nom}`}
              pinColor="#FF9500"
            />
          );
        }
      });
    });

    return markers;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {renderVehicleMarkers()}
        {renderArretMarkers()}
        {renderRouteLines()}
        {showDriverPosition && currentPosition && (
          <Marker
            coordinate={currentPosition}
            title="Ma position"
            description="Position actuelle du chauffeur"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Contrôles de la carte */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowRoutes(!showRoutes)}
        >
          <Ionicons 
            name={showRoutes ? 'eye' : 'eye-off'} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.controlText}>Routes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={loadMapData}
        >
          <Ionicons name="refresh" size={20} color="#007AFF" />
          <Text style={styles.controlText}>Actualiser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('VehicleSelection')}
        >
          <Ionicons name="car" size={20} color="#007AFF" />
          <Text style={styles.controlText}>Véhicules</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={20} color="#007AFF" />
          <Text style={styles.controlText}>Ma position</Text>
        </TouchableOpacity>
      </View>

      {/* Sélection de véhicule */}
      <View style={styles.vehicleSelectionContainer}>
        <Text style={styles.vehicleSelectionTitle}>Sélectionner votre véhicule</Text>
        {vehicules.length > 0 ? (
          <View style={styles.vehiclesList}>
            {vehicules.map(vehicle => (
              <TouchableOpacity
                key={`map-vehicle-${vehicle?.id || Math.random()}`}
                style={[
                  styles.vehicleCard,
                  selectedVehicle?.id === vehicle.id && styles.selectedVehicle
                ]}
                onPress={() => handleVehicleSelection(vehicle)}
              >
      <View style={styles.vehicleHeader}>
        <Text style={styles.vehicleTitle}>{vehicle.immatriculation}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: vehicle.statut_gps ? '#34C759' : '#FF9500' }
        ]}>
          <Text style={styles.statusText}>
            {vehicle.statut_gps ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      </View>
      <Text style={styles.vehicleType}>{vehicle.type}</Text>
                {selectedVehicle?.id === vehicle.id && (
      <TouchableOpacity
        style={[
          styles.gpsButton,
          { backgroundColor: vehicle.statut_gps ? '#FF3B30' : '#34C759' }
        ]}
        onPress={() => toggleGps(vehicle)}
      >
        <Ionicons 
          name={vehicle.statut_gps ? 'stop' : 'play'} 
          size={16} 
          color="#fff" 
        />
        <Text style={styles.gpsButtonText}>
          {vehicle.statut_gps ? 'Arrêter GPS' : 'Démarrer GPS'}
        </Text>
      </TouchableOpacity>
                )}
        </TouchableOpacity>
            ))}
      </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>Aucun véhicule assigné</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  controlText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#007AFF',
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  vehicleSelectionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vehicleSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  vehiclesList: {
    maxHeight: height * 0.25,
  },
  vehicleCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVehicle: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  vehicleType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default DriverMapView;