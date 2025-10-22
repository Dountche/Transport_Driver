import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Marker, Polyline } from 'expo-maps';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../../services/vehicles';
import { storage } from '../../services/storage';

const MapViewScreen = ({ navigation }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.6928,
    longitude: -17.4467,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Récupérer le véhicule sélectionné
      const savedVehicle = await storage.getSelectedVehicle();
      if (savedVehicle) {
        setSelectedVehicle(savedVehicle);
      }

      // Charger les véhicules du chauffeur
      const vehiclesResult = await vehicleService.getDriverVehicles();
      if (vehiclesResult.success) {
        setVehicles(vehiclesResult.data.vehicules || []);
      }

      // Charger les lignes (simulation - à adapter selon votre API)
      setLines([
        {
          id: 1,
          nom: 'Ligne 1',
          color: '#FF3B30',
          coordinates: [
            { latitude: 14.6928, longitude: -17.4467 },
            { latitude: 14.7000, longitude: -17.4500 },
            { latitude: 14.7100, longitude: -17.4600 },
          ]
        },
        {
          id: 2,
          nom: 'Ligne 2',
          color: '#007AFF',
          coordinates: [
            { latitude: 14.6800, longitude: -17.4300 },
            { latitude: 14.6900, longitude: -17.4400 },
            { latitude: 14.7000, longitude: -17.4500 },
          ]
        }
      ]);

    } catch (error) {
      console.error('Error loading map data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la carte');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelection = async (vehicle) => {
    setSelectedVehicle(vehicle);
    await storage.setSelectedVehicle(vehicle);
    
    // Centrer la carte sur le véhicule
    if (vehicle.position) {
      setMapRegion({
        latitude: vehicle.position.latitude,
        longitude: vehicle.position.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const toggleGps = async (vehicle) => {
    try {
      const result = await vehicleService.updateGpsStatus(vehicle.id, !vehicle.statut_gps);
      if (result.success) {
        setVehicles(vehicles.map(v => 
          v.id === vehicle.id ? { ...v, statut_gps: !v.statut_gps } : v
        ));
        await storage.setGpsEnabled(!vehicle.statut_gps);
        Alert.alert(
          'GPS ' + (!vehicle.statut_gps ? 'activé' : 'désactivé'),
          `Le GPS du véhicule ${vehicle.immatriculation} a été ${!vehicle.statut_gps ? 'activé' : 'désactivé'}`
        );
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut GPS');
    }
  };

  const VehicleCard = ({ vehicle }) => (
    <TouchableOpacity
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement de la carte...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {/* Lignes */}
          {lines.map(line => (
            <Polyline
              key={line.id}
              coordinates={line.coordinates}
              strokeColor={line.color}
              strokeWidth={3}
            />
          ))}

          {/* Véhicules */}
          {vehicles.map(vehicle => (
            vehicle.position && (
              <Marker
                key={vehicle.id}
                coordinate={vehicle.position}
                title={vehicle.immatriculation}
                description={vehicle.type}
              >
                <View style={[
                  styles.vehicleMarker,
                  { backgroundColor: vehicle.statut_gps ? '#34C759' : '#FF9500' }
                ]}>
                  <Ionicons name="car" size={20} color="#fff" />
                </View>
              </Marker>
            )
          ))}
        </MapView>
      </View>

      {/* Liste des véhicules */}
      <View style={styles.vehiclesContainer}>
        <Text style={styles.vehiclesTitle}>Mes véhicules</Text>
        {vehicles.length > 0 ? (
          vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={32} color="#C7C7CC" />
            <Text style={styles.emptyText}>Aucun véhicule assigné</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    height: 300,
  },
  map: {
    flex: 1,
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  vehiclesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  vehiclesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default MapViewScreen;
