import { Lead } from './types';

export function parseCSV(text: string): Lead[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headerLine = lines[0].replace(/^\uFEFF/, '');
  const separator = headerLine.includes(';') ? ';' : ',';
  
  return lines.slice(1).map((line) => {
    const cols = line.split(separator);
    return {
      id: crypto.randomUUID(),
      name: cols[0]?.trim() || '',
      title: cols[1]?.trim() || '',
      category: cols[2]?.trim() || '',
      address: cols[3]?.trim() || '',
      city: cols[4]?.trim() || '',
      state: cols[5]?.trim() || '',
      phone: cols[6]?.trim() || '',
      website: cols[7]?.trim() || '',
      google_maps_url: cols[8]?.trim() || '',
      rating: cols[9]?.trim() || '',
      reviews_count: cols[10]?.trim() || '',
      instagram: cols[11]?.trim() || '',
      responsavel: '',
      descricao: '',
      status: 'none' as const,
      whatsapp_group: '',
      meeting_dates: [],
      nome_decisor: '',
      numero_decisor: '',
    };
  }).filter(l => l.name);
}
