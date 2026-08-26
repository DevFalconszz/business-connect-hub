import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Font, Radius, Spacing } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const initials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.email}>{user?.email || 'Não conectado'}</Text>
          <View style={styles.statusDot} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.sectionCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValueSmall}>{user?.id?.slice(0, 8) || '—'}...</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Último login</Text>
              <Text style={styles.infoValue}>
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOBRE</Text>
          <View style={styles.sectionCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App</Text>
              <Text style={styles.infoValue}>CRM MI</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Font.size.h1,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Font.weight.bold,
    color: Colors.text.inverse,
  },
  email: {
    fontSize: Font.size.bodyLg,
    color: Colors.text.primary,
    fontWeight: Font.weight.semibold,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.success,
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Font.size.overline,
    fontWeight: Font.weight.semibold,
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  infoLabel: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
  },
  infoValue: {
    fontSize: Font.size.bodySm,
    color: Colors.text.primary,
    fontWeight: Font.weight.medium,
    maxWidth: 200,
    textAlign: 'right',
  },
  infoValueSmall: {
    fontSize: Font.size.caption,
    color: Colors.text.primary,
    fontFamily: 'monospace',
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.base,
  },
  logoutButton: {
    backgroundColor: Colors.status.errorBg,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.status.error + '40',
  },
  logoutButtonText: {
    color: Colors.status.error,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
  },
});
