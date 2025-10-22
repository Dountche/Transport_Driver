import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { useNotifications } from '../../context/NotificationContext';
import { useGps } from '../../context/GpsContext';
import { dashboardService } from '../../services/dashboard';
import { vehicleService } from '../../services/vehicles';
import { storage } from '../../services/storage';

const Dashboard = ({ navigation }) => {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const { unreadCount } = useNotifications();
  const { updateVehicle } = useGps();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadVehicles();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await dashboardService.getDriverDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const result = await vehicleService.getDriverVehicles();
      if (result.success) {
        setVehicles(result.data.vehicules || []);
        // Récupérer le véhicule sélectionné
        const savedVehicle = await storage.getSelectedVehicle();
        if (savedVehicle) {
          setSelectedVehicle(savedVehicle);
        }
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      loadVehicles()
    ]);
    setRefreshing(false);
  };

  const handleVehicleSelection = async (vehicle) => {
    setSelectedVehicle(vehicle);
    await storage.setSelectedVehicle(vehicle);
    await updateVehicle(vehicle);
  };

  const toggleGps = async (vehicle) => {
    try {
      const result = await vehicleService.updateGpsStatus(vehicle.id, !vehicle.statut_gps);
      if (result.success) {
        const updatedVehicle = { ...vehicle, statut_gps: !vehicle.statut_gps };
        setVehicles(vehicles.map(v => 
          v.id === vehicle.id ? updatedVehicle : v
        ));
        await storage.setGpsEnabled(!vehicle.statut_gps);
        await updateVehicle(updatedVehicle);
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

  const StatCard = ({ title, value, icon, color = '#007AFF' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

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
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.nom || 'Chauffeur'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="#007AFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        {dashboardData && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistiques du jour</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Tickets validés"
                value={dashboardData.stats?.tickets_valides || 0}
                icon="checkmark-circle"
                color="#34C759"
              />
              <StatCard
                title="Paiements Wave"
                value={dashboardData.stats?.paiements_wave || 0}
                icon="card"
                color="#007AFF"
              />
              <StatCard
                title="Paiements espèces"
                value={dashboardData.stats?.paiements_especes || 0}
                icon="cash"
                color="#FF9500"
              />
              <StatCard
                title="Tentatives fraude"
                value={dashboardData.stats?.tentatives_fraude || 0}
                icon="warning"
                color="#FF3B30"
              />
            </View>
          </View>
        )}

        {/* Véhicules */}
        <View style={styles.vehiclesContainer}>
          <Text style={styles.sectionTitle}>Mes véhicules</Text>
          {vehicles.length > 0 ? (
            vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>Aucun véhicule assigné</Text>
            </View>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Tickets', { screen: 'TicketList' })}
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
              onPress={() => navigation.navigate('Map')}
            >
              <Ionicons name="map" size={24} color="#FF9500" />
              <Text style={styles.actionText}>Carte</Text>
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
  scrollView: {
    flex: 1,
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehiclesContainer: {
    paddingVertical: 20,
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
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  actionsContainer: {
    paddingVertical: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default Dashboard;
