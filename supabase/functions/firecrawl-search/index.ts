const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, options } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching:', query);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: options?.limit || 20,
        lang: options?.lang || 'pt-BR',
        country: options?.country || 'BR',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = data.data || [];
    if (results.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a prompt with all results for AI extraction
    const resultsText = results.map((r: any, i: number) => {
      return `--- Result ${i + 1} ---
URL: ${r.url || ''}
Title: ${r.title || ''}
Description: ${r.description || ''}
Content:
${(r.markdown || '').substring(0, 1500)}
`;
    }).join('\n');

    const niche = options?.niche || '';
    const city = options?.city || '';

    const aiPrompt = `Analise os seguintes resultados de busca e extraia informações estruturadas de cada estabelecimento/negócio encontrado.

Nicho buscado: ${niche}
Cidade buscada: ${city}

Para cada estabelecimento, extraia:
- name: Nome do estabelecimento
- title: Descrição curta ou slogan
- category: Categoria/tipo do negócio (ex: Restaurante, Clínica, Salão de Beleza)
- city: Cidade
- state: Estado (sigla UF, ex: SP, RJ, GO)
- phone: Telefone (formato brasileiro)
- website: URL do site
- rating: Nota/avaliação (ex: 4.5)
- reviews_count: Número de avaliações
- address: Endereço completo
- instagram: @ do Instagram se encontrado
- google_maps_url: Link do Google Maps se encontrado

Retorne APENAS um JSON array válido. Se um campo não for encontrado, use string vazia "".
Não inclua estabelecimentos duplicados. Extraia o máximo de estabelecimentos distintos possível.

Resultados da busca:
${resultsText}

Responda SOMENTE com o JSON array, sem markdown, sem explicação. Exemplo:
[{"name":"Restaurante X","title":"Comida caseira","category":"Restaurante","city":"São Paulo","state":"SP","phone":"(11) 99999-9999","website":"https://...","rating":"4.5","reviews_count":"120","address":"Rua X, 123","instagram":"@restaurantex","google_maps_url":""}]`;

    console.log('Calling AI to extract structured data...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      // Fallback: return raw results
      return new Response(
        JSON.stringify({ success: true, data: results.map((r: any) => ({
          name: r.title || 'Sem nome',
          title: r.description || '',
          category: niche,
          city: city,
          state: '',
          phone: '',
          website: r.url || '',
          rating: '',
          reviews_count: '',
          address: '',
          instagram: '',
          google_maps_url: '',
        })) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';
    
    // Parse JSON from AI response (handle potential markdown wrapping)
    let parsed: any[];
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content.substring(0, 500));
      parsed = [];
    }

    console.log(`Extracted ${parsed.length} structured results`);

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to search';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
