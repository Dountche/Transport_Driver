import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { reservationService } from '../../services/reservations';

const ReservationList = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const result = await reservationService.getDriverReservations();
      if (result.success) {
        setReservations(result.data.reservations || []);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (reservation, newStatus, motif = null) => {
    try {
      const result = await reservationService.updateReservationStatus(
        reservation.id, 
        newStatus, 
        motif
      );
      
      if (result.success) {
        setReservations(reservations.map(r => 
          r.id === reservation.id ? { ...r, statut: newStatus } : r
        ));
        Alert.alert('Succès', 'Statut de la réservation mis à jour');
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la réservation');
    }
  };

  const showStatusOptions = (reservation) => {
    const options = [];
    
    if (reservation.statut === 'en_attente') {
      options.push(
        { text: 'Accepter', onPress: () => handleStatusUpdate(reservation, 'confirmee') },
        { text: 'Refuser', onPress: () => showRefusalReasons(reservation) }
      );
    } else if (reservation.statut === 'confirmee') {
      options.push(
        { text: 'Commencer le trajet', onPress: () => handleStatusUpdate(reservation, 'en_cours') }
      );
    } else if (reservation.statut === 'en_cours') {
      options.push(
        { text: 'Terminer le trajet', onPress: () => handleStatusUpdate(reservation, 'terminee') }
      );
    }

    if (options.length > 0) {
      Alert.alert(
        'Modifier le statut',
        `Que souhaitez-vous faire avec cette réservation ?`,
        [
          ...options,
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  };

  const showRefusalReasons = (reservation) => {
    Alert.alert(
      'Motif de refus',
      'Pourquoi refusez-vous cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Nombre max atteint', 
          onPress: () => handleStatusUpdate(reservation, 'annulee', 'Nombre de réservations max atteint')
        },
        { 
          text: 'Véhicule en panne', 
          onPress: () => handleStatusUpdate(reservation, 'annulee', 'Véhicule en panne')
        },
        { 
          text: 'Véhicule hors ligne', 
          onPress: () => handleStatusUpdate(reservation, 'annulee', 'Véhicule hors ligne')
        },
        { 
          text: 'Autre motif', 
          onPress: () => handleStatusUpdate(reservation, 'annulee', 'Autre motif')
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return '#FF9500';
      case 'confirmee': return '#007AFF';
      case 'en_cours': return '#34C759';
      case 'terminee': return '#5856D6';
      case 'annulee': return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  const renderReservation = ({ item }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() => navigation.navigate('ReservationDetail', { reservation: item })}
    >
      <View style={styles.reservationHeader}>
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationId}>Réservation #{item.id}</Text>
          <Text style={styles.reservationDate}>{formatDate(item.date_reservation)}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.statut) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
        </View>
      </View>
      
      <View style={styles.reservationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>{item.client?.nom || 'Client'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.arret_depart} → {item.arret_arrivee}
          </Text>
        </View>
        {item.vehicule && (
          <View style={styles.detailRow}>
            <Ionicons name="car" size={16} color="#666" />
            <Text style={styles.detailText}>{item.vehicule.immatriculation}</Text>
          </View>
        )}
      </View>

      {item.statut === 'en_attente' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showStatusOptions(item)}
        >
          <Ionicons name="checkmark" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Gérer</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Aucune réservation</Text>
      <Text style={styles.emptyText}>
        Les réservations pour vos véhicules apparaîtront ici.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement des réservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réservations</Text>
      </View>

      {reservations.length > 0 ? (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReservation}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reservationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  reservationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ReservationList;
