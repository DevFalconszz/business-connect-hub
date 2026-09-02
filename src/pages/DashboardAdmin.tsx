import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2, Users, Target, Inbox, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLead, DashboardView, STATUS_LABELS, LeadStatus } from '@/lib/types';
import { fetchAdminLeads } from '@/lib/dashboard-api';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  none: '#9ca3af',
  analise_pendente: '#eab308',
  em_analise: '#f59e0b',
  follow_up: '#3b82f6',
  reuniao_agendada: '#a855f7',
  recusado: '#ef4444',
  venda_fechada: '#22c55e',
};

const STATUS_ORDER: LeadStatus[] = [
  'analise_pendente',
  'em_analise',
  'follow_up',
  'reuniao_agendada',
  'venda_fechada',
  'recusado',
  'none',
];

const PALETTE = ['#eab308', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#14b8a6', '#6366f1'];

const VIEWS: { value: DashboardView; label: string }[] = [
  { value: 'geral', label: 'Geral' },
  { value: 'por_usuario', label: 'Por Usuário' },
  { value: 'por_status', label: 'Por Status' },
  { value: 'por_nicho', label: 'Por Nicho' },
  { value: 'por_estado', label: 'Por Estado (UF)' },
];

function normalize(s: string | null | undefined): string {
  return (s || '').trim().toLowerCase();
}

export default function DashboardAdmin() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<DashboardView>('geral');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminLeads();
        setLeads(data);
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const uniqueOwners = new Set<string>();
    leads.forEach((l) => {
      if (l.owner_name || l.owner_email) {
        uniqueOwners.add(l.owner_name || l.owner_email || '');
      }
    });
    const statusCount = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});
    const funilTotal = STATUS_ORDER.filter((s) => s !== 'none' && s !== 'recusado').reduce(
      (acc, s) => acc + (statusCount[s] || 0),
      0,
    );
    return {
      total: leads.length,
      owners: uniqueOwners.size,
      funilTotal,
      vendasFechadas: statusCount['venda_fechada'] || 0,
    };
  }, [leads]);

  const byUser = useMemo(() => {
    const map = new Map<string, { owner: string; total: number; funil: number; vendas: number }>();
    leads.forEach((l) => {
      const owner = l.owner_name || l.owner_email || 'Sem responsável';
      const cur = map.get(owner) || { owner, total: 0, funil: 0, vendas: 0 };
      cur.total += 1;
      if (l.status !== 'none' && l.status !== 'recusado') cur.funil += 1;
      if (l.status === 'venda_fechada') cur.vendas += 1;
      map.set(owner, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [leads]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.status, (map.get(l.status) || 0) + 1));
    return Array.from(map.entries()).map(([status, count]) => ({
      name: STATUS_LABELS[status as LeadStatus] || status,
      value: count,
      status,
    }));
  }, [leads]);

  const byNiche = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      const n = normalize(l.category) || 'Sem nicho';
      const key = n.charAt(0).toUpperCase() + n.slice(1);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [leads]);

  const byState = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      const s = (l.state || '').trim().toUpperCase() || '—';
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-gold-500" />
              Dashboard de Prospecção
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão consolidada dos leads de todos os usuários.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select value={view} onValueChange={(v) => setView(v as DashboardView)}>
              <SelectTrigger className="h-11 rounded-xl border-input bg-card focus:border-gold-500 focus:ring-gold-500">
                <SelectValue placeholder="Tipo de dashboard" />
              </SelectTrigger>
              <SelectContent>
                {VIEWS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Inbox className="w-4 h-4" /> Total de Leads
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Users className="w-4 h-4" /> Usuários com Leads
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.owners}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <TrendingUp className="w-4 h-4" /> Leads no Funil
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.funilTotal}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Target className="w-4 h-4" /> Vendas Fechadas
              </div>
              <p className="text-3xl font-bold text-green-500 mt-1">{stats.vendasFechadas}</p>
            </CardContent>
          </Card>
        </div>

        {view === 'geral' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Leads por Usuário</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byUser} layout="vertical" margin={{ left: 20, right: 12 }}>
                    <XAxis type="number" allowDecimals={false} stroke="#888" fontSize={11} />
                    <YAxis type="category" dataKey="owner" width={110} stroke="#888" fontSize={11} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#eab308" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Leads por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                      {byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'por_usuario' && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Produção por Usuário</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground">Responsável</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-xs text-muted-foreground">Total</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-xs text-muted-foreground">No Funil</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-xs text-muted-foreground">Vendas Fechadas</th>
                  </tr>
                </thead>
                <tbody>
                  {byUser.map((u) => (
                    <tr key={u.owner} className="border-b border-border hover:bg-accent/40">
                      <td className="px-3 py-2 font-medium text-foreground">{u.owner}</td>
                      <td className="px-3 py-2 text-center">{u.total}</td>
                      <td className="px-3 py-2 text-center">{u.funil}</td>
                      <td className="px-3 py-2 text-center text-green-500 font-semibold">{u.vendas}</td>
                    </tr>
                  ))}
                  {byUser.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        Nenhum lead encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {view === 'por_status' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={120} label>
                      {byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Resumo por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {STATUS_ORDER.map((s) => {
                    const count = byStatus.find((x) => x.status === s)?.value || 0;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s] }} />
                        <span className="text-sm text-foreground flex-1">{STATUS_LABELS[s]}</span>
                        <Badge variant="outline" className="text-xs">{count} ({pct}%)</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'por_nicho' && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Leads por Nicho</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byNiche} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
                  <XAxis dataKey="name" stroke="#888" fontSize={11} angle={-35} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} stroke="#888" fontSize={11} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                    {byNiche.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {view === 'por_estado' && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Leads por Estado (UF)</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byState} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <XAxis dataKey="name" stroke="#888" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#888" fontSize={11} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="value" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
