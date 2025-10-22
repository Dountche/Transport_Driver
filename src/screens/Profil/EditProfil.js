import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { storage } from '../../services/storage'

const EditProfil = ({ navigation, route }) => {
  const { user, logout } = useAuth();
  const deleteMode = route.params?.deleteMode || false;

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    mot_de_passe: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (formData.mot_de_passe) {
      if (formData.mot_de_passe.length < 8) {
        newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.mot_de_passe !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
      };

      if (formData.mot_de_passe) {
        updateData.mot_de_passe = formData.mot_de_passe;
      }

      const result = await authService.updateProfile(updateData);

      if (result.success) {
        // refresh le profil
        const userData = result.data.utilisateur || result.data;
        await storage.setUserData(userData);

        const profileResult = await authService.getProfile();
        if (profileResult.success) {
          const freshUserData = profileResult.data.utilisateur || profileResult.data.Utilisateur;
          await storage.setUserData(freshUserData);
        }
        Alert.alert(
          'Succès',
          'Votre profil a été mis à jour avec succès',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );

      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous absolument sûr ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await authService.deleteAccount();
              
              if (result.success) {
                Alert.alert(
                  'Compte supprimé',
                  'Votre compte a été supprimé avec succès',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await logout();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Erreur', result.message);
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (deleteMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deleteContainer}>
          <Text style={styles.deleteTitle}>Supprimer mon compte</Text>
          <Text style={styles.deleteWarning}>
            Cette action supprimera définitivement :
          </Text>
          <View style={styles.deleteList}>
            <Text style={styles.deleteItem}>• Votre profil et informations personnelles</Text>
            <Text style={styles.deleteItem}>• Tous vos tickets validés</Text>
            <Text style={styles.deleteItem}>• Toutes vos réservations</Text>
            <Text style={styles.deleteItem}>• Votre historique de trajets</Text>
          </View>
          <Button
            title="Supprimer définitivement mon compte"
            onPress={handleDeleteAccount}
            loading={loading}
            style={styles.deleteButton}
          />
          <Button
            title="Annuler"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Input
              label="Nom complet"
              placeholder="Diallo Franck"
              value={formData.nom}
              onChangeText={(value) => updateFormData('nom', value)}
              error={errors.nom}
            />

            <Input
              label="Email"
              placeholder="votre@email.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              error={errors.email}
              autoCapitalize="none"
            />

            <Input
              label="Téléphone"
              placeholder="0102030405"
              value={formData.telephone}
              onChangeText={(value) => updateFormData('telephone', value)}
              keyboardType="phone-pad"
              error={errors.telephone}
            />

            <View style={styles.passwordSection}>
              <Text style={styles.passwordSectionTitle}>
                Changer le mot de passe (optionnel)
              </Text>
              <Text style={styles.passwordSectionSubtitle}>
                Laissez vide si vous ne souhaitez pas le modifier
              </Text>

              <Input
                label="Nouveau mot de passe"
                placeholder="••••••••"
                value={formData.mot_de_passe}
                onChangeText={(value) => updateFormData('mot_de_passe', value)}
                secureTextEntry
                error={errors.mot_de_passe}
              />

              {formData.mot_de_passe && (
                <Input
                  label="Confirmer le mot de passe"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              )}
            </View>
          </View>

          <Button
            title="Enregistrer les modifications"
            onPress={handleUpdate}
            loading={loading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  keyboardView: {
    flex: 1,
  },
  form: {
    marginBottom: 24,
  },
  passwordSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  passwordSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  passwordSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
  },
  deleteContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  deleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteWarning: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  deleteList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  deleteItem: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default EditProfil;
