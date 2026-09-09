/**
 * Utilidades de "dia útil" para o relatório diário dos SDRs.
 *
 * Um dia é considerado útil quando:
 *  - não cai em sábado ou domingo; e
 *  - não é feriado (nacionais/internacionais relevantes).
 *
 * O SDR só é obrigado a preencher o relatório em dias úteis.
 * Feriados móveis (Carnaval, Sexta-Feira Santa, Corpus Christi) são
 * calculados a partir da data da Páscoa (algoritmo de Meeus/Jones/Butcher).
 */

const FIXED_HOLIDAYS: { month: number; day: number }[] = [
  { month: 1, day: 1 },   // Confraternização Universal / Ano Novo
  { month: 4, day: 21 },  // Tiradentes
  { month: 5, day: 1 },   // Dia do Trabalho
  { month: 9, day: 7 },   // Independência do Brasil
  { month: 10, day: 12 }, // Nossa Senhora Aparecida
  { month: 11, day: 2 },  // Finados
  { month: 11, day: 15 }, // Proclamação da República
  { month: 11, day: 20 }, // Consciência Negra
  { month: 12, day: 25 }, // Natal
];

function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();

  for (const h of FIXED_HOLIDAYS) {
    if (date.getMonth() === h.month - 1 && date.getDate() === h.day) return true;
  }

  const easter = easterDate(year);
  const movable: Date[] = [
    addDays(easter, -48), // Carnaval (segunda)
    addDays(easter, -47), // Carnaval (terça)
    addDays(easter, -2),  // Sexta-Feira Santa
    addDays(easter, 0),   // Páscoa (domingo, redundante com fim de semana)
    addDays(easter, 60),  // Corpus Christi
  ];
  const key = toKey(date);
  return movable.some((d) => toKey(d) === key);
}

export function isBusinessDay(date: Date): boolean {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false;
  return !isHoliday(date);
}

/** Retorna o dia útil imediatamente anterior a `date` (retrocede over fim de semana/feriados). */
export function previousBusinessDay(date: Date): Date {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() - 1);
  } while (!isBusinessDay(d));
  return d;
}

export function toISODate(d: Date): string {
  return toKey(d);
}