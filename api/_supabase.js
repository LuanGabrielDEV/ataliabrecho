// Leitura pública do catálogo, com a mesma chave pública (publishable) que o site usa.
// O RLS do banco garante que só saem colunas e peças visíveis a qualquer visitante.
export const SITE = 'https://ataliabrecho.vercel.app'

const URL_SUPABASE = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const CHAVE = process.env.VITE_SUPABASE_ANON_KEY || ''

export const catalogoNoBanco = () => Boolean(URL_SUPABASE && CHAVE) && process.env.VITE_CATALOGO === 'supabase'

export async function consultar(caminho) {
  const resposta = await fetch(`${URL_SUPABASE}/rest/v1/${caminho}`, {
    headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` },
    signal: AbortSignal.timeout(4000),
  })
  if (!resposta.ok) throw new Error(`Supabase respondeu ${resposta.status}`)
  return resposta.json()
}

export const urlFoto = (caminho) => `${URL_SUPABASE}/storage/v1/object/public/pecas/${caminho}`

export const escapar = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
