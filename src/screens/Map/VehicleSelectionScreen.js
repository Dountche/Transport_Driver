import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VehicleSelection from '../../components/VehicleSelection';
import { gpsTrackingService } from '../../services/gpsTracking';
import { storage } from '../../services/storage';

const VehicleSelectionScreen = ({ navigation }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    loadSelectedVehicle();
  }, []);

  const loadSelectedVehicle = async () => {
    try {
      const savedVehicle = await storage.getSelectedVehicle();
      if (savedVehicle) {
        setSelectedVehicle(savedVehicle);
      }
    } catch (error) {
      console.error('Error loading selected vehicle:', error);
    }
  };

  const handleVehicleSelected = async (vehicle) => {
    console.log('Vehicle selected:', vehicle);
    setSelectedVehicle(vehicle);
  };

  const handleStartTracking = async () => {
    if (!selectedVehicle) {
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule');
      return;
    }

    if (!selectedVehicle.statut_gps) {
      Alert.alert('Erreur', 'Le GPS de ce véhicule n\'est pas activé');
      return;
    }

    try {
      // Démarrer le tracking GPS
      const success = await gpsTrackingService.startTracking(selectedVehicle);
      
      if (success) {
        await storage.setGpsEnabled(true);
        Alert.alert(
          'GPS activé',
          `Le tracking GPS a été démarré pour le véhicule ${selectedVehicle.immatriculation}`,
          [
            {
              text: 'Voir la carte',
              onPress: () => navigation.navigate('Map')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de démarrer le tracking GPS');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer le tracking GPS');
    }
  };

  const handleStopTracking = async () => {
    try {
      await gpsTrackingService.stopTracking();
      await storage.setGpsEnabled(false);
      Alert.alert('GPS désactivé', 'Le tracking GPS a été arrêté');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'arrêter le tracking GPS');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sélection de véhicule</Text>
        <View style={styles.placeholder} />
      </View>

      <VehicleSelection
        onVehicleSelected={handleVehicleSelected}
        selectedVehicle={selectedVehicle}
      />

      {selectedVehicle && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: selectedVehicle.statut_gps ? '#34C759' : '#FF3B30' }
            ]}
            onPress={selectedVehicle.statut_gps ? handleStartTracking : handleStopTracking}
          >
            <Ionicons 
              name={selectedVehicle.statut_gps ? 'play' : 'stop'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {selectedVehicle.statut_gps ? 'Démarrer le tracking' : 'Arrêter le tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={20} color="#007AFF" />
            <Text style={styles.mapButtonText}>Voir la carte</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  mapButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VehicleSelectionScreen;
