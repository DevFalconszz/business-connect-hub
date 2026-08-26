import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lead } from '../../lib/types';
import { insertLead } from '../../lib/leads-store';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Font, Radius, Spacing } from '../../lib/theme';

interface SearchResult {
  name: string;
  category: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  rating: string;
  reviews_count: string;
  has_website: boolean;
  has_ads: boolean;
}

export default function ProspectingScreen() {
  const { user } = useAuth();
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [responsavel, setResponsavel] = useState('');

  const handleSearch = async () => {
    if (!niche.trim() || !city.trim()) {
      Alert.alert('Erro', 'Preencha o nicho e a cidade.');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('search-leads', {
        body: { niche: niche.trim(), city: city.trim() },
      });

      if (error) {
        console.error('Edge Function error:', error);
        Alert.alert('Erro', error.message || 'Não foi possível buscar leads.');
        return;
      }

      if (data?.success && data?.data) {
        setResults(data.data);
      } else {
        Alert.alert('Erro', data?.error || 'Não foi possível buscar leads.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (result: SearchResult) => {
    if (!responsavel.trim()) {
      Alert.alert('Erro', 'Informe o nome do responsável.');
      return;
    }

    const lead: Omit<Lead, 'id'> = {
      name: result.name || 'Sem nome',
      title: '',
      category: result.category || niche,
      address: '',
      city: result.city || city,
      state: result.state,
      phone: result.phone,
      website: result.website || '',
      google_maps_url: '',
      rating: result.rating || '',
      reviews_count: result.reviews_count || '',
      instagram: '',
      responsavel,
      descricao: '',
      status: 'none',
      whatsapp_group: '',
      meeting_dates: [],
      nome_decisor: '',
      numero_decisor: '',
    };

    const inserted = await insertLead(lead);
    if (inserted) {
      Alert.alert('Sucesso', `"${result.name}" adicionado aos leads!`);
      setAddingIndex(null);
      setResponsavel('');
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar o lead.');
    }
  };

  const renderResult = ({ item, index }: { item: SearchResult; index: number }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.resultBadges}>
          {!item.has_website && (
            <View style={[styles.miniBadge, { backgroundColor: Colors.status.errorBg }]}>
              <Text style={[styles.miniBadgeText, { color: Colors.status.error }]}>Sem site</Text>
            </View>
          )}
          {!item.has_ads && (
            <View style={[styles.miniBadge, { backgroundColor: Colors.status.warningBg }]}>
              <Text style={[styles.miniBadgeText, { color: Colors.status.warning }]}>Sem anúncios</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.resultCategory}>{item.category}</Text>
      <Text style={styles.resultCity}>{item.city}/{item.state}</Text>
      <View style={styles.resultMeta}>
        {item.phone ? <Text style={styles.metaItem}>📞 {item.phone}</Text> : null}
        {item.website ? <Text style={styles.metaItem}>🌐 {item.website}</Text> : null}
        {item.rating ? <Text style={styles.metaItem}>⭐ {item.rating} ({item.reviews_count})</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => { setAddingIndex(index); setResponsavel(''); }}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Adicionar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prospectar</Text>
        <Text style={styles.headerSubtitle}>Encontre novos leads</Text>
      </View>

      <View style={styles.searchForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nicho</Text>
          <TextInput
            style={styles.input}
            placeholder="Clínica, Restaurante..."
            placeholderTextColor={Colors.text.tertiary}
            value={niche}
            onChangeText={setNiche}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            placeholder="São Paulo, Rio..."
            placeholderTextColor={Colors.text.tertiary}
            value={city}
            onChangeText={setCity}
          />
        </View>
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.searchButtonText}>🔍 Buscar Leads</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Buscando leads...</Text>
        </View>
      )}

      {!loading && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Busque novos leads</Text>
          <Text style={styles.emptySubtitle}>Digite o nicho e a cidade para encontrar oportunidades.</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderResult}
      />

      {addingIndex !== null && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar aos Leads</Text>
            <Text style={styles.modalSubtitle}>{results[addingIndex]?.name}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsável *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do responsável"
                placeholderTextColor={Colors.text.tertiary}
                value={responsavel}
                onChangeText={setResponsavel}
                autoFocus
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddingIndex(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleAddLead(results[addingIndex])}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerSubtitle: {
    fontSize: Font.size.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  searchForm: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Spacing.base,
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
  searchButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: Colors.text.inverse,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
    gap: Spacing.base,
  },
  loadingText: {
    color: Colors.text.tertiary,
    fontSize: Font.size.bodySm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
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
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  resultCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  resultName: {
    fontSize: Font.size.bodyLg,
    fontWeight: Font.weight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  resultBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  miniBadgeText: {
    fontSize: Font.size.mini,
    fontWeight: Font.weight.semibold,
  },
  resultCategory: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
  },
  resultCity: {
    fontSize: Font.size.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  resultMeta: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  metaItem: {
    fontSize: Font.size.caption,
    color: Colors.text.secondary,
  },
  addButton: {
    backgroundColor: Colors.primary[500] + '15',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary[500] + '40',
  },
  addButtonText: {
    color: Colors.primary[500],
    fontSize: Font.size.bodySm,
    fontWeight: Font.weight.semibold,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  modalTitle: {
    fontSize: Font.size.h3,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  cancelButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.medium,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.text.inverse,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
  },
});
