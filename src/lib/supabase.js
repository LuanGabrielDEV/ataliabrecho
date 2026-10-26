const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Sem as variáveis de ambiente, os serviços rodam em modo demonstração,
 * para o site funcionar localmente antes do banco estar configurado.
 */
export const modoDemonstracao = !(url && chave)

let cliente = null

/**
 * O cliente do Supabase só é carregado quando um formulário é enviado.
 * Assim a biblioteca não pesa na primeira visita.
 */
export async function obterSupabase() {
  if (modoDemonstracao) return null
  if (!cliente) {
    const { createClient } = await import('@supabase/supabase-js')
    cliente = createClient(url, chave, { auth: { persistSession: false } })
  }
  return cliente
}
