import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Register = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: données, 2: vérification
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});

  const [localLoading, setLocalLoading] = useState(false);

  const { register, verifyRegistration } = useAuth();
  
  if (localLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9]{8,15}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (formData.mot_de_passe.length < 8) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.mot_de_passe !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterRequest = async () => {
    if (!validateStep1()) return;

    setLocalLoading(true);

    const { confirmPassword, ...registrationData } = formData;
    // Forcer le rôle chauffeur
    registrationData.role = 'chauffeur';
    
    const result = await register(registrationData);
    console.log('Résultat register :', result);

    setLocalLoading(false);

    if (result.success) {
      setStep(2);
      Alert.alert(
        'Code envoyé',
        'Un code de vérification a été envoyé à votre adresse email.'
      );
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir un code à 6 chiffres');
      return;
    }

    setLocalLoading(true);

    const result = await verifyRegistration(formData.email, verificationCode);

    setLocalLoading(false);

    if (result.success) {
      Alert.alert(
        'Inscription réussie',
        'Votre compte chauffeur a été créé avec succès !',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const renderStep1 = () => (
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

      <Input
        label="Mot de passe"
        placeholder="••••••••"
        value={formData.mot_de_passe}
        onChangeText={(value) => updateFormData('mot_de_passe', value)}
        secureTextEntry
        error={errors.mot_de_passe}
      />

      <Input
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        title="Continuer"
        onPress={handleRegisterRequest}
        loading={localLoading}
        style={styles.continueButton}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.form}>
      <Text style={styles.verificationText}>
        Un code de vérification a été envoyé à {formData.email}
      </Text>

      <Input
        label="Code de vérification"
        placeholder="123456"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.codeInput}
      />

      <Button
        title="Vérifier et créer le compte"
        onPress={handleVerification}
        loading={localLoading}
        style={styles.verifyButton}
      />

      <TouchableOpacity
        onPress={handleRegisterRequest}
        style={styles.resendButton}
      >
        <Text style={styles.resendText}>Renvoyer le code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setStep(1)}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.title}>
              {step === 1 ? 'Inscription Chauffeur' : 'Vérification'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 
                ? 'Créez votre compte chauffeur pour accéder à votre tableau de bord'
                : 'Saisissez le code reçu par email'
              }
            </Text>
          </View>

          {step === 1 ? renderStep1() : renderStep2()}

          {step === 1 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Déjà un compte ?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
  continueButton: {
    marginTop: 20,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 5,
  },
  verifyButton: {
    marginTop: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default Register;
