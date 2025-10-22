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
import { useTickets } from '../../context/TicketContext';

const TicketDetail = ({ navigation, route }) => {
  const { ticket } = route.params;
  const { confirmCashPayment, loading } = useTickets();
  const [confirming, setConfirming] = useState(false);

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

  const handleConfirmCashPayment = () => {
    Alert.alert(
      'Confirmer le paiement espèces',
      'Êtes-vous sûr que le client a payé en espèces ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setConfirming(true);
            const result = await confirmCashPayment(ticket.id);
            setConfirming(false);
            
            if (result.success) {
              Alert.alert('Succès', 'Paiement espèces confirmé');
              navigation.goBack();
            } else {
              Alert.alert('Erreur', result.message);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    if (ticket.statut_expiration) return '#FF3B30';
    if (ticket.statut_validation) return '#34C759';
    return '#FF9500';
  };

  const getStatusText = () => {
    if (ticket.statut_expiration) return 'Expiré';
    if (ticket.statut_validation) return 'Validé';
    return 'En attente';
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
          <Text style={styles.headerTitle}>Détails du ticket</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Informations du ticket */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ticket #{ticket.id}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() }
            ]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          <DetailRow
            icon="calendar"
            label="Date de création"
            value={formatDate(ticket.date_creation)}
          />
          
          <DetailRow
            icon="time"
            label="Date d'expiration"
            value={formatDate(ticket.date_expiration)}
          />

          {ticket.statut_validation && (
            <DetailRow
              icon="checkmark-circle"
              label="Date de validation"
              value={formatDate(ticket.date_validation || ticket.date_creation)}
              color="#34C759"
            />
          )}
        </View>

        {/* Informations du client */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <DetailRow
            icon="person"
            label="Nom"
            value={ticket.client?.nom || 'Non disponible'}
          />
          <DetailRow
            icon="mail"
            label="Email"
            value={ticket.client?.email || 'Non disponible'}
          />
          <DetailRow
            icon="call"
            label="Téléphone"
            value={ticket.client?.telephone || 'Non disponible'}
          />
        </View>

        {/* Informations du trajet */}
        {ticket.trajet && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trajet</Text>
            <DetailRow
              icon="bus"
              label="Ligne"
              value={ticket.trajet.ligne?.nom || 'Non disponible'}
            />
            <DetailRow
              icon="time"
              label="Heure de départ"
              value={ticket.trajet.heure_depart ? formatDate(ticket.trajet.heure_depart) : 'Non disponible'}
            />
            <DetailRow
              icon="time"
              label="Heure d'arrivée"
              value={ticket.trajet.heure_arrivee ? formatDate(ticket.trajet.heure_arrivee) : 'Non disponible'}
            />
          </View>
        )}

        {/* Informations de paiement */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Paiement</Text>
          <DetailRow
            icon="card"
            label="Statut"
            value={ticket.statut_payer ? 'Payé' : 'Non payé'}
            color={ticket.statut_payer ? '#34C759' : '#FF3B30'}
          />
          {ticket.paiement && (
            <>
              <DetailRow
                icon="cash"
                label="Montant"
                value={`${ticket.paiement.montant} FCFA`}
              />
              <DetailRow
                icon="card"
                label="Méthode"
                value={ticket.paiement.methode}
              />
              <DetailRow
                icon="calendar"
                label="Date de paiement"
                value={formatDate(ticket.paiement.date)}
              />
            </>
          )}
        </View>

        {/* Actions */}
        {!ticket.statut_payer && ticket.statut_validation && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cashButton}
              onPress={handleConfirmCashPayment}
              disabled={confirming}
            >
              <Ionicons name="cash" size={20} color="#fff" />
              <Text style={styles.cashButtonText}>
                {confirming ? 'Confirmation...' : 'Confirmer paiement espèces'}
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
  cashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cashButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TicketDetail;
