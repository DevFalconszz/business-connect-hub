// Inferência automática de UF (estado) a partir da cidade pesquisada.
// Mapa com capitais e principais municípios brasileiros (cidade -> UF).

const CITY_TO_UF: Record<string, string> = {
  // Capitais
  'são paulo': 'SP', 'sao paulo': 'SP',
  'rio de janeiro': 'RJ',
  'belo horizonte': 'MG',
  'brasília': 'DF', 'brasilia': 'DF',
  'salvador': 'BA',
  'fortaleza': 'CE',
  'manaus': 'AM',
  'curitiba': 'PR',
  'recife': 'PE',
  'porto alegre': 'RS',
  'porto velho': 'RO',
  'boa vista': 'RR',
  'belém': 'PA', 'belem': 'PA',
  'macapá': 'AP', 'macapa': 'AP',
  'palmas': 'TO',
  'rio branco': 'AC',
  'campo grande': 'MS',
  'cuiabá': 'MT', 'cuiaba': 'MT',
  'goiânia': 'GO', 'goiania': 'GO',
  'teresina': 'PI',
  'são luís': 'MA', 'sao luis': 'MA', 'são luiz': 'MA',
  'natal': 'RN',
  'joão pessoa': 'PB', 'joao pessoa': 'PB',
  'maceió': 'AL', 'maceio': 'AL',
  'aracaju': 'SE',
  'florianópolis': 'SC', 'florianopolis': 'SC',
  'vitória': 'ES', 'vitoria': 'ES',
  'belo horizonte': 'MG',
  'campinas': 'SP',
  'santos': 'SP',
  'osasco': 'SP',
  'guarulhos': 'SP',
  'são bernardo do campo': 'SP', 'sao bernardo do campo': 'SP',
  'santo andré': 'SP', 'santo andre': 'SP',
  'são josé dos campos': 'SP', 'sao jose dos campos': 'SP',
  'ribeirão preto': 'SP', 'ribeirao preto': 'SP',
  'sorocaba': 'SP',
  'niterói': 'RJ', 'niteroi': 'RJ',
  'nova iguaçu': 'RJ', 'nova iguacu': 'RJ',
  'duque de caxias': 'RJ',
  'são gonçalo': 'RJ', 'sao goncalo': 'RJ',
  'uberlândia': 'MG', 'uberlandia': 'MG',
  'contagem': 'MG',
  'juiz de fora': 'MG',
  'londrina': 'PR',
  'maringá': 'PR', 'maringa': 'PR',
  'pont grossa': 'PR',
  'joinville': 'SC',
  'blumenau': 'SC',
  'criciúma': 'SC', 'criciuma': 'SC',
  'caxias do sul': 'RS',
  'pelotas': 'RS',
  'santa maria': 'RS',
  'olinda': 'PE',
  'caruaru': 'PE',
  'petrolina': 'PE',
  'feira de santana': 'BA',
  'vitória da conquista': 'BA', 'vitoria da conquista': 'BA',
  'joão monlevade': 'MG', 'joao monlevade': 'MG',
  'governador valadares': 'MG',
  'montes claros': 'MG',
  'uberaba': 'MG',
  'araraquara': 'SP',
  'piracicaba': 'SP',
  'taubaté': 'SP', 'taubate': 'SP',
  'guarapuava': 'PR',
  'cascavel': 'PR',
  'foz do iguaçu': 'PR', 'foz do iguacu': 'PR',
};

const NORMALIZE = (s: string) =>
  s.toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Infere a UF a partir do nome da cidade. Usa a cidade pesquisada como
 * referência e tenta corresponder. Retorna '' se não encontrar.
 */
export function inferUf(city?: string): string {
  const norm = NORMALIZE(city || '');
  if (!norm) return '';
  return CITY_TO_UF[norm] || '';
}
