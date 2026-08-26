import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Font, Radius, Spacing } from '../lib/theme';

export default function LoginScreen() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        Alert.alert('Erro no login', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.inner}>
        <View style={styles.brandSection}>
          <Image
            source={require('../assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandName}>CRM M.I.</Text>
          <Text style={styles.brandTagline}>Gestão de Leads</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
          <Text style={styles.cardSubtitle}>
            Acesso restrito. Entre com suas credenciais.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="voce@email.com"
              placeholderTextColor={Colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.primary[500] + '55',
  },
  brandName: {
    fontSize: Font.size.h1,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  cardTitle: {
    fontSize: Font.size.h3,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Font.size.bodySm,
    fontWeight: Font.weight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    fontSize: Font.size.bodyMd,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
  button: {
    backgroundColor: Colors.primary[500],
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
    letterSpacing: 0.5,
  },
});
