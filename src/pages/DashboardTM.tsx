import { useCallback, useEffect, useMemo, useState } from 'react';
import { Target, TrendingUp, Inbox, Activity, CheckCircle2, XCircle, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TmDashboard } from '@/lib/types';
import { fetchTmDashboard } from '@/lib/dashboard-api';
import { STATUS_LABELS, LeadStatus } from '@/lib/types';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  analise_pendente: '#f59e0b',
  em_analise: '#f97316',
  follow_up: '#0ea5e9',
  reuniao_agendada: '#8b5cf6',
  recusado: '#ef4444',
  venda_fechada: '#10b981',
};

const STATUS_ORDER: LeadStatus[] = [
  'analise_pendente',
  'em_analise',
  'follow_up',
  'reuniao_agendada',
  'venda_fechada',
  'recusado',
];

export default function DashboardTM() {
  const [data, setData] = useState<TmDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchTmDashboard());
    } catch (e) {
      toast.error('Erro ao carregar o painel do gestor.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = data?.total ?? 0;
  const stats = useMemo(() => {
    const f = data?.funil ?? {};
    return {
      ht: data?.total_hoje ?? 0,
      emAnalise: (f.analise_pendente ?? 0) + (f.em_analise ?? 0),
      funil: (f.follow_up ?? 0) + (f.reuniao_agendada ?? 0),
      vendas: f.venda_fechada ?? 0,
      recusados: f.recusado ?? 0,
    };
  }, [data]);

  const funnelTotal = useMemo(
    () => STATUS_ORDER.reduce((acc, s) => acc + ((data?.funil?.[s] ?? 0) as number), 0),
    [data],
  );

  const cards = [
    { label: 'Total de Leads', value: total, icon: Target, color: 'text-gold-500' },
    { label: 'Entradas Hoje', value: stats.ht, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Em Análise', value: stats.emAnalise, icon: Inbox, color: 'text-amber-500' },
    { label: 'No Funil', value: stats.funil, icon: Activity, color: 'text-sky-500' },
    { label: 'Vendas Fechadas', value: stats.vendas, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Recusados', value: stats.recusados, icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <main className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-gold-500" />
            Painel do Gestor de Tráfego
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Central de informações: funil de vendas, produção do time e leads recentes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <c.icon className={`w-6 h-6 ${c.color}`} />
                <span className="text-3xl font-bold">{c.value}</span>
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STATUS_ORDER.map((s) => {
              const v = (data?.funil?.[s] ?? 0) as number;
              const pct = funnelTotal ? Math.round((v / funnelTotal) * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{STATUS_LABELS[s]}</span>
                    <span className="text-muted-foreground">{v} · {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-accent overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s] }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por Responsável</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-2 py-2">Responsável</th>
                  <th className="px-2 py-2 text-center">Leads</th>
                  <th className="px-2 py-2 text-center">Vendas</th>
                </tr>
              </thead>
              <tbody>
                {(data?.por_responsavel ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-muted-foreground">
                      Nenhum lead cadastrado.
                    </td>
                  </tr>
                )}
                {(data?.por_responsavel ?? []).map((r) => (
                  <tr key={r.responsavel} className="border-b border-border/50">
                    <td className="px-2 py-2">{r.responsavel}</td>
                    <td className="px-2 py-2 text-center font-medium">{r.total}</td>
                    <td className="px-2 py-2 text-center font-medium text-green-500">{r.vendas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Nome</th>
                <th className="px-2 py-2">Cidade</th>
                <th className="px-2 py-2 text-center">Status</th>
                <th className="px-2 py-2">Responsável</th>
                <th className="px-2 py-2">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentes ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">
                    Nenhum lead recente.
                  </td>
                </tr>
              )}
              {(data?.recentes ?? []).map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-2 py-2 font-medium">{r.name}</td>
                  <td className="px-2 py-2 text-muted-foreground">
                    {r.city}
                    {r.state ? ` - ${r.state}` : ''}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ color: STATUS_COLORS[r.status] ?? '#94a3b8', borderColor: STATUS_COLORS[r.status] ?? '#94a3b8' }}
                    >
                      {STATUS_LABELS[r.status as LeadStatus] ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-2">{r.responsavel || '—'}</td>
                  <td className="px-2 py-2 text-muted-foreground text-xs">
                    {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
    </main>
  );
}