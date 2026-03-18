import * as XLSX from 'xlsx';
import { Lead } from './types';

function normalizeHeader(header: any): string {
  if (!header) return '';
  return String(header).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const FIELD_MAP: Record<string, keyof Lead> = {
  nome: 'name',
  name: 'name',
  titulo: 'title',
  title: 'title',
  categoria: 'category',
  category: 'category',
  nicho: 'category',
  endereco: 'address',
  address: 'address',
  cidade: 'city',
  city: 'city',
  uf: 'state',
  estado: 'state',
  state: 'state',
  telefone: 'phone',
  phone: 'phone',
  site: 'website',
  website: 'website',
  google_maps_url: 'google_maps_url',
  maps: 'google_maps_url',
  rating: 'rating',
  nota: 'rating',
  avaliacoes: 'reviews_count',
  reviews: 'reviews_count',
  reviews_count: 'reviews_count',
  instagram: 'instagram',
  responsavel: 'responsavel',
  descricao: 'descricao',
  status: 'status',
  whatsapp: 'whatsapp_group',
  whatsapp_group: 'whatsapp_group',
  grupo_whatsapp: 'whatsapp_group',
  nome_decisor: 'nome_decisor',
  decisor: 'nome_decisor',
  numero_decisor: 'numero_decisor',
  telefone_decisor: 'numero_decisor',
};

export interface ParseResult {
  leads: Lead[];
  errors: string[];
  totalRows: number;
}

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ leads: [], errors: ['Arquivo vazio ou sem planilhas.'], totalRows: 0 });
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          resolve({ leads: [], errors: ['Planilha sem dados (apenas cabeçalho ou vazia).'], totalRows: 0 });
          return;
        }

        // Build column map from header row
        const headerRow = rows[0];
        const colMap: Record<string, number> = {};
        const unmappedHeaders: string[] = [];

        headerRow.forEach((cell, idx) => {
          const normalized = normalizeHeader(cell);
          if (!normalized) return;
          const field = FIELD_MAP[normalized];
          if (field) {
            colMap[field] = idx;
          } else {
            unmappedHeaders.push(String(cell).trim());
          }
        });

        if (!colMap['name']) {
          resolve({
            leads: [],
            errors: [`Coluna "Nome" não encontrada. Colunas detectadas: ${headerRow.map(h => String(h).trim()).filter(Boolean).join(', ')}`],
            totalRows: 0,
          });
          return;
        }

        const errors: string[] = [];
        if (unmappedHeaders.length > 0) {
          errors.push(`Colunas ignoradas (não reconhecidas): ${unmappedHeaders.join(', ')}`);
        }

        const leads: Lead[] = [];
        const dataRows = rows.slice(1);

        dataRows.forEach((row, rowIdx) => {
          const lineNum = rowIdx + 2; // 1-indexed + header
          const get = (field: keyof Lead): string => {
            const idx = colMap[field];
            if (idx === undefined) return '';
            const val = row[idx];
            return val !== null && val !== undefined ? String(val).trim() : '';
          };

          const name = get('name');
          if (!name) {
            if (row.some((c: any) => String(c).trim())) {
              errors.push(`Linha ${lineNum}: Nome vazio, linha ignorada.`);
            }
            return;
          }

          const phone = get('phone');
          if (phone && !/[\d()+\-\s]/.test(phone)) {
            errors.push(`Linha ${lineNum} (${name}): Telefone com formato inválido "${phone}".`);
          }

          leads.push({
            id: crypto.randomUUID(),
            name,
            title: get('title'),
            category: get('category'),
            address: get('address'),
            city: get('city'),
            state: get('state'),
            phone,
            website: get('website'),
            google_maps_url: get('google_maps_url'),
            rating: get('rating'),
            reviews_count: get('reviews_count'),
            instagram: get('instagram'),
            responsavel: get('responsavel'),
            descricao: get('descricao'),
            status: (get('status') as Lead['status']) || 'analise_pendente',
            whatsapp_group: get('whatsapp_group'),
            meeting_dates: [],
            nome_decisor: get('nome_decisor'),
            numero_decisor: get('numero_decisor'),
          });
        });

        resolve({ leads, errors, totalRows: dataRows.length });
      } catch (err: any) {
        resolve({ leads: [], errors: [`Erro ao processar arquivo: ${err.message}`], totalRows: 0 });
      }
    };
    reader.onerror = () => {
      resolve({ leads: [], errors: ['Erro ao ler o arquivo.'], totalRows: 0 });
    };
    reader.readAsArrayBuffer(file);
  });
}
