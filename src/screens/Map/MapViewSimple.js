import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../../services/vehicles';
import { storage } from '../../services/storage';

const MapViewScreen = ({ navigation }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

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

    } catch (error) {
      console.error('Error loading map data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelection = async (vehicle) => {
    setSelectedVehicle(vehicle);
    await storage.setSelectedVehicle(vehicle);
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
          <Text>Chargement des véhicules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Véhicules</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Message d'information */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.infoText}>
            La carte interactive sera disponible dans une prochaine version. 
            Vous pouvez gérer vos véhicules ci-dessous.
          </Text>
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
              <Ionicons name="car-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>Aucun véhicule assigné</Text>
              <Text style={styles.emptyText}>
                Contactez votre administrateur pour vous assigner un véhicule.
              </Text>
            </View>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Tickets', { screen: 'TicketScanner' })}
            >
              <Ionicons name="qr-code" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Scanner QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reservations', { screen: 'ReservationList' })}
            >
              <Ionicons name="list" size={24} color="#34C759" />
              <Text style={styles.actionText}>Réservations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Dashboard', { screen: 'Home' })}
            >
              <Ionicons name="analytics" size={24} color="#FF9500" />
              <Text style={styles.actionText}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 20,
  },
  vehiclesContainer: {
    marginBottom: 24,
  },
  vehiclesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    paddingHorizontal: 12,
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
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MapViewScreen;
