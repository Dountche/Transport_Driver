import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { reservationService } from '../../services/reservations';

const ReservationDetail = ({ navigation, route }) => {
  const { reservation } = route.params;
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async (newStatus, motif = null) => {
    setUpdating(true);
    try {
      const result = await reservationService.updateReservationStatus(
        reservation.id, 
        newStatus, 
        motif
      );
      
      if (result.success) {
        Alert.alert('Succès', 'Statut de la réservation mis à jour');
        navigation.goBack();
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la réservation');
    } finally {
      setUpdating(false);
    }
  };

  const showStatusOptions = () => {
    const options = [];
    
    if (reservation.statut === 'en_attente') {
      options.push(
        { text: 'Accepter', onPress: () => handleStatusUpdate('confirmee') },
        { text: 'Refuser', onPress: () => showRefusalReasons() }
      );
    } else if (reservation.statut === 'confirmee') {
      options.push(
        { text: 'Commencer le trajet', onPress: () => handleStatusUpdate('en_cours') }
      );
    } else if (reservation.statut === 'en_cours') {
      options.push(
        { text: 'Terminer le trajet', onPress: () => handleStatusUpdate('terminee') }
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

  const showRefusalReasons = () => {
    Alert.alert(
      'Motif de refus',
      'Pourquoi refusez-vous cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Nombre max atteint', 
          onPress: () => handleStatusUpdate('annulee', 'Nombre de réservations max atteint')
        },
        { 
          text: 'Véhicule en panne', 
          onPress: () => handleStatusUpdate('annulee', 'Véhicule en panne')
        },
        { 
          text: 'Véhicule hors ligne', 
          onPress: () => handleStatusUpdate('annulee', 'Véhicule hors ligne')
        },
        { 
          text: 'Autre motif', 
          onPress: () => handleStatusUpdate('annulee', 'Autre motif')
        }
      ]
    );
  };

  const getStatusColor = () => {
    switch (reservation.statut) {
      case 'en_attente': return '#FF9500';
      case 'confirmee': return '#007AFF';
      case 'en_cours': return '#34C759';
      case 'terminee': return '#5856D6';
      case 'annulee': return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (reservation.statut) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return reservation.statut;
    }
  };

  const DetailRow = ({ icon, label, value, color = '#333' }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color="#666" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la réservation</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Informations de la réservation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Réservation #{reservation.id}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() }
            ]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          <DetailRow
            icon="calendar"
            label="Date de réservation"
            value={formatDate(reservation.date_reservation)}
          />
          
          <DetailRow
            icon="location"
            label="Trajet"
            value={`${reservation.arret_depart} → ${reservation.arret_arrivee}`}
          />
        </View>

        {/* Informations du client */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <DetailRow
            icon="person"
            label="Nom"
            value={reservation.client?.nom || 'Non disponible'}
          />
          <DetailRow
            icon="mail"
            label="Email"
            value={reservation.client?.email || 'Non disponible'}
          />
          <DetailRow
            icon="call"
            label="Téléphone"
            value={reservation.client?.telephone || 'Non disponible'}
          />
        </View>

        {/* Informations du véhicule */}
        {reservation.vehicule && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Véhicule</Text>
            <DetailRow
              icon="car"
              label="Immatriculation"
              value={reservation.vehicule.immatriculation}
            />
            <DetailRow
              icon="car"
              label="Type"
              value={reservation.vehicule.type}
            />
          </View>
        )}

        {/* Informations du trajet */}
        {reservation.trajet && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trajet</Text>
            <DetailRow
              icon="bus"
              label="Ligne"
              value={reservation.trajet.ligne?.nom || 'Non disponible'}
            />
            <DetailRow
              icon="time"
              label="Heure de départ"
              value={reservation.trajet.heure_depart ? formatDate(reservation.trajet.heure_depart) : 'Non disponible'}
            />
            <DetailRow
              icon="time"
              label="Heure d'arrivée"
              value={reservation.trajet.heure_arrivee ? formatDate(reservation.trajet.heure_arrivee) : 'Non disponible'}
            />
          </View>
        )}

        {/* Actions */}
        {(reservation.statut === 'en_attente' || 
          reservation.statut === 'confirmee' || 
          reservation.statut === 'en_cours') && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={showStatusOptions}
              disabled={updating}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {updating ? 'Mise à jour...' : 'Gérer la réservation'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ReservationDetail;
