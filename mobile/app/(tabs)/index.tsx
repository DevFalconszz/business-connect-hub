import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lead, STATUS_LABELS, STATUS_COLORS } from '../../lib/types';
import { loadLeads, deleteLead } from '../../lib/leads-store';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Font, Radius, Spacing, Shadow } from '../../lib/theme';

export default function LeadsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    const data = await loadLeads();
    setLeads(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Excluir Lead', `Tem certeza que deseja excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteLead(id);
          if (ok) setLeads((prev) => prev.filter((l) => l.id !== id));
        },
      },
    ]);
  }, []);

  const filtered = search.trim()
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.category.toLowerCase().includes(search.toLowerCase()) ||
          l.city.toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const statusColor = (status: string) => {
    const c = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
    return c || { bg: Colors.bg.elevated, text: Colors.text.tertiary };
  };

  const renderItem = useCallback(
    ({ item }: { item: Lead }) => {
      const sc = statusColor(item.status);
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/lead/${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.statusBar, { backgroundColor: sc.text }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.badgeText, { color: sc.text }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.cardCategory}>{item.category}</Text>
            <View style={styles.cardMeta}>
              {item.city ? (
                <Text style={styles.metaItem}>📍 {item.city}{item.state ? `, ${item.state}` : ''}</Text>
              ) : null}
              {item.phone ? (
                <Text style={styles.metaItem}>📞 {item.phone}</Text>
              ) : null}
            </View>
            {item.nome_decisor ? (
              <Text style={styles.decisor}>Decisor: {item.nome_decisor}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Leads</Text>
          <Text style={styles.headerSubtitle}>{filtered.length} encontrado{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={signOut} activeOpacity={0.7}>
          <Text style={styles.headerButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar leads..."
          placeholderTextColor={Colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>
              {loading ? 'Carregando...' : 'Nenhum lead encontrado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Aguarde um momento' : 'Adicione leads ou ajuste sua busca'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSubtitle: {
    fontSize: Font.size.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  headerButton: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerButtonText: {
    color: Colors.text.secondary,
    fontSize: Font.size.bodySm,
    fontWeight: Font.weight.medium,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  searchInput: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontSize: Font.size.bodyMd,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardName: {
    fontSize: Font.size.bodyLg,
    fontWeight: Font.weight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: Font.size.mini,
    fontWeight: Font.weight.semibold,
    letterSpacing: 0.3,
  },
  cardCategory: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  cardMeta: {
    gap: Spacing.xs,
  },
  metaItem: {
    fontSize: Font.size.caption,
    color: Colors.text.secondary,
  },
  decisor: {
    fontSize: Font.size.caption,
    color: Colors.primary[500],
    marginTop: Spacing.sm,
    fontWeight: Font.weight.medium,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.huge * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: Font.size.h4,
    fontWeight: Font.weight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: Font.size.bodySm,
  },
});
