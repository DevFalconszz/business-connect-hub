import { useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DailyReport } from '@/lib/types';
import { loadMyDailyReports, upsertDailyReport } from '@/lib/leads-store';
import { isBusinessDay, previousBusinessDay, toISODate } from '@/lib/business-day';
import { DailyReportModal } from './DailyReportModal';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

/**
 * Controle de acesso para SDRs:
 * - Bloqueia o trabalho se o relatório do último dia útil NÃO foi preenchido.
 * - Em dias úteis, oferece preencher o relatório do dia atual (opcional).
 * - Fins de semana e feriados não exigem relatório.
 */
export function DailyReportGate({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showToday, setShowToday] = useState(false);

  const today = useMemo(() => new Date(), []);
  const requiredDate = useMemo(() => previousBusinessDay(today), [today]);

  const byDate = useMemo(() => {
    const map = new Map<string, DailyReport>();
    reports.forEach((r) => map.set(r.report_date, r));
    return map;
  }, [reports]);

  const isAdmin = role === 'admin';
  const requiredMissing = !byDate.has(toISODate(requiredDate));
  const todayBusiness = isBusinessDay(today);
  const todayMissing = todayBusiness && !byDate.has(toISODate(today));

  const refresh = async () => {
    const data = await loadMyDailyReports();
    setReports(data);
    setLoaded(true);
  };

  useEffect(() => {
    if (user && !isAdmin) refresh();
    else setLoaded(true);
  }, [user, isAdmin]);

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {children}

      {!requiredMissing && todayMissing && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-card border border-gold-500/40 text-foreground rounded-xl shadow-lg px-4 py-3">
          <FileText className="w-5 h-5 text-gold-500" />
          <span className="text-sm">
            {todayMissing ? 'Não esqueça de preencher o relatório de hoje.' : ''}
          </span>
          <Button size="sm" className="bg-gold-500 text-black hover:bg-gold-600 h-9" onClick={() => setShowToday(true)}>
            Preencher
          </Button>
        </div>
      )}

      {requiredMissing && loaded && (
        <DailyReportModal
          date={requiredDate}
          blocking
          onClose={() => {}}
          onSaved={refresh}
          saveFn={upsertDailyReport}
        />
      )}

      {showToday && (
        <DailyReportModal
          date={today}
          onClose={() => setShowToday(false)}
          onSaved={() => { setShowToday(false); refresh(); }}
          saveFn={upsertDailyReport}
        />
      )}
    </>
  );
}