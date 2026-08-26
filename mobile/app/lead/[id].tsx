import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lead, STATUS_LABELS, STATUS_COLORS, LeadStatus } from '../../lib/types';
import { loadLeads, updateLead } from '../../lib/leads-store';
import { Colors, Font, Radius, Spacing } from '../../lib/theme';

const STATUSES: LeadStatus[] = [
  'none', 'analise_pendente', 'em_analise', 'follow_up',
  'reuniao_agendada', 'recusado', 'venda_fechada'
];

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    loadLeads().then(data => {
      const found = data.find(l => l.id === id);
      if (found) {
        setLead(found);
        setEditData(found);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    const updated = { ...lead, ...editData };
    const ok = await updateLead(updated);
    setSaving(false);
    if (ok) {
      setLead(updated);
      Alert.alert('Sucesso', 'Lead atualizado!');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  const handleAddDate = () => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(newDate)) {
      Alert.alert('Erro', 'Formato de data inválido. Use DD/MM/AAAA.');
      return;
    }
    const [day, month, year] = newDate.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) {
      Alert.alert('Erro', 'Data inválida.');
      return;
    }
    const dateStr = date.toISOString();
    const currentDates = editData.meeting_dates || [];
    if (currentDates.includes(dateStr)) {
      Alert.alert('Erro', 'Esta data já foi adicionada.');
      return;
    }
    setEditData(prev => ({ ...prev, meeting_dates: [...currentDates, dateStr] }));
    setNewDate('');
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      meeting_dates: (prev.meeting_dates || []).filter(d => d !== dateToRemove)
    }));
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const openPhone = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const openWhatsApp = (phone: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${clean}`);
    }
  };

  const openMaps = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const openGoogleCalendar = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(date.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reunião - ${encodeURIComponent(lead?.name || '')}&dates=${start}/${end}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Lead não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <TextInput
              style={styles.nameInput}
              value={editData.name || ''}
              onChangeText={(v) => setEditData(prev => ({ ...prev, name: v }))}
              placeholder="Nome da empresa"
              placeholderTextColor={Colors.text.tertiary}
            />
            <TextInput
              style={styles.categoryInput}
              value={editData.category || ''}
              onChangeText={(v) => setEditData(prev => ({ ...prev, category: v }))}
              placeholder="Categoria"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUSES.map(s => {
              const sc = STATUS_COLORS[s];
              const isActive = editData.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusChip,
                    isActive && { backgroundColor: sc.bg, borderColor: sc.text }
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, status: s }))}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusChipText,
                    isActive && { color: sc.text }
                  ]}>
                    {STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTATO</Text>
          <View style={styles.sectionCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.phoneRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editData.phone || ''}
                  onChangeText={(v) => setEditData(prev => ({ ...prev, phone: v }))}
                  placeholder="Telefone"
                  placeholderTextColor={Colors.text.tertiary}
                />
                {editData.phone && (
                  <>
                    <TouchableOpacity style={styles.iconButton} onPress={() => openPhone(editData.phone!)} activeOpacity={0.7}>
                      <Text style={styles.iconButtonText}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => openWhatsApp(editData.phone!)} activeOpacity={0.7}>
                      <Text style={styles.iconButtonText}>💬</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={editData.city || ''}
                onChangeText={(v) => setEditData(prev => ({ ...prev, city: v }))}
                placeholder="Cidade"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={editData.state || ''}
                onChangeText={(v) => setEditData(prev => ({ ...prev, state: v }))}
                placeholder="UF"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={editData.address || ''}
                onChangeText={(v) => setEditData(prev => ({ ...prev, address: v }))}
                placeholder="Endereço"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
            {editData.google_maps_url && (
              <TouchableOpacity onPress={() => openMaps(editData.google_maps_url!)} activeOpacity={0.7}>
                <Text style={styles.link}>📍 Ver no Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DECISOR</Text>
          <View style={styles.sectionCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={editData.nome_decisor || ''}
                onChangeText={(v) => setEditData(prev => ({ ...prev, nome_decisor: v }))}
                placeholder="Nome do decisor"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={editData.numero_decisor || ''}
                onChangeText={(v) => setEditData(prev => ({ ...prev, numero_decisor: v }))}
                placeholder="Telefone do decisor"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESPONSÁVEL</Text>
          <View style={styles.sectionCard}>
            <TextInput
              style={styles.input}
              value={editData.responsavel || ''}
              onChangeText={(v) => setEditData(prev => ({ ...prev, responsavel: v }))}
              placeholder="Nome do responsável"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIÇÃO</Text>
          <View style={styles.sectionCard}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editData.descricao || ''}
              onChangeText={(v) => setEditData(prev => ({ ...prev, descricao: v }))}
              placeholder="Descrição do lead"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHATSAPP GROUP</Text>
          <View style={styles.sectionCard}>
            <TextInput
              style={styles.input}
              value={editData.whatsapp_group || ''}
              onChangeText={(v) => setEditData(prev => ({ ...prev, whatsapp_group: v }))}
              placeholder="Link do grupo WhatsApp"
              placeholderTextColor={Colors.text.tertiary}
            />
            {editData.whatsapp_group ? (
              <TouchableOpacity onPress={() => Linking.openURL(editData.whatsapp_group!)} activeOpacity={0.7}>
                <Text style={styles.link}>Abrir grupo</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REUNIÕES AGENDADAS</Text>
          <View style={styles.sectionCard}>
            <View style={styles.dateInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddDate} activeOpacity={0.7}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            {(editData.meeting_dates || []).length > 0 && (
              <View style={styles.datesList}>
                {(editData.meeting_dates || []).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map((dateStr, index) => (
                  <View key={index} style={styles.dateItem}>
                    <TouchableOpacity onPress={() => openGoogleCalendar(dateStr)} activeOpacity={0.7}>
                      <Text style={styles.dateText}>{formatDate(dateStr)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveDate(dateStr)} activeOpacity={0.7}>
                      <Text style={styles.removeDateText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.base,
  },
  errorText: {
    color: Colors.text.tertiary,
    fontSize: Font.size.bodyMd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginTop: 4,
  },
  backIcon: {
    color: Colors.text.primary,
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: Font.size.h2,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    padding: 0,
    letterSpacing: -0.3,
  },
  categoryInput: {
    fontSize: Font.size.bodySm,
    color: Colors.text.tertiary,
    padding: 0,
    marginTop: Spacing.xs,
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
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  field: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Font.size.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontSize: Font.size.bodyMd,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  iconButtonText: {
    fontSize: 18,
  },
  link: {
    color: Colors.primary[500],
    fontSize: Font.size.bodySm,
    marginTop: Spacing.sm,
    fontWeight: Font.weight.medium,
  },
  statusChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg.surface,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border.subtle,
  },
  statusChipText: {
    color: Colors.text.tertiary,
    fontSize: Font.size.bodySm,
    fontWeight: Font.weight.medium,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary[500],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontSize: 24,
    fontWeight: Font.weight.bold,
  },
  datesList: {
    gap: Spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  dateText: {
    color: Colors.primary[500],
    fontSize: Font.size.bodySm,
    fontWeight: Font.weight.medium,
  },
  removeDateText: {
    color: Colors.status.error,
    fontSize: 16,
    fontWeight: Font.weight.bold,
  },
  saveButton: {
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
  saveButtonText: {
    color: Colors.text.inverse,
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
    letterSpacing: 0.5,
  },
});
