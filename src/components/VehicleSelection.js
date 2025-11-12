import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transportService } from '../services/transport';
import { vehicleService } from '../services/vehicles';
import { storage } from '../services/storage';

const VehicleSelection = ({ onVehicleSelected, selectedVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      console.log('Loading vehicles in VehicleSelection...');
      const result = await transportService.getDriverVehicules();
      console.log('VehicleSelection result:', result);
      
      if (result.success) {
        console.log('Vehicles data:', result.data);
        setVehicles(result.data || []);
      } else {
        console.error('Error loading vehicles:', result.message);
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      console.error('Exception loading vehicles:', error);
      Alert.alert('Erreur', 'Impossible de charger les véhicules');
    } finally {
      setLoading(false);
    }
  };

  const handleVehiclePress = async (vehicle) => {
    onVehicleSelected(vehicle);
    await storage.setSelectedVehicle(vehicle);
  };

  const toggleGps = async (vehicle) => {
    try {
      const result = await vehicleService.updateGpsStatus(vehicle.id, !vehicle.statut_gps);
      if (result.success) {
        const updatedVehicle = { ...vehicle, statut_gps: !vehicle.statut_gps };
        setVehicles(vehicles.map(v => 
          v.id === vehicle.id ? updatedVehicle : v
        ));
        
        if (selectedVehicle?.id === vehicle.id) {
          onVehicleSelected(updatedVehicle);
        }
        
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

  const renderVehicle = ({ item: vehicle }) => {
    // Vérifier que le véhicule a un ID valide
    if (!vehicle || !vehicle.id) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.vehicleCard,
          selectedVehicle?.id === vehicle.id && styles.selectedVehicle
        ]}
        onPress={() => handleVehiclePress(vehicle)}
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
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des véhicules...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionner votre véhicule</Text>
      
      {vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          renderItem={renderVehicle}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Aucun véhicule assigné</Text>
          <Text style={styles.emptySubtitle}>
            Contactez votre administrateur pour obtenir l'assignation d'un véhicule.
          </Text>
        </View>
      )}
    </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedVehicle: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default VehicleSelection;
