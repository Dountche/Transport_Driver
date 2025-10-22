import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const PasswordReset = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState('');

  const { resetPassword, loading } = useAuth();

  useEffect(() => {
    // Le token peut venir des paramètres de navigation ou d'un deep link
    if (route.params?.token) {
      setToken(route.params.token);
    }
  }, [route.params]);

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!token) {
      newErrors.general = 'Token de réinitialisation manquant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    const result = await resetPassword(token, password, confirmPassword);

    if (result.success) {
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès.',
        [
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={50} color="#007AFF" />
            </View>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </Text>
          </View>

          <View style={styles.form}>
            {!token && (
              <Input
                label="Token de réinitialisation"
                placeholder="Coller le token reçu par email"
                value={token}
                onChangeText={setToken}
                error={errors.general}
              />
            )}

            <Input
              label="Nouveau mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrors(prev => ({ ...prev, password: null }));
              }}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Réinitialiser le mot de passe"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  resetButton: {
    marginTop: 20,
  },
});

export default PasswordReset;
