import { modoDemonstracao } from '../lib/supabase'

let cliente = null

/** Cliente do painel: guarda a sessão de login no aparelho da Wirlla. */
export async function supabaseAdmin() {
  if (modoDemonstracao) throw new Error('Supabase não configurado (.env.local).')
  if (!cliente) {
    const { createClient } = await import('@supabase/supabase-js')
    cliente = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: true, storageKey: 'atalia-admin' },
    })
  }
  return cliente
}

/** Reduz a foto no próprio celular antes de enviar (máx. 1400px, WebP). */
export async function prepararFoto(arquivo, ladoMax = 1400) {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.85))
  return blob || arquivo
}

export function mensagemErro(e) {
  const m = e?.message || String(e)
  if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.'
  if (/Email not confirmed/i.test(m)) return 'Confirme o e-mail antes de entrar (veja a caixa de entrada).'
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.'
  if (/row-level security|permission denied/i.test(m)) return 'Este usuário não tem permissão de administradora.'
  return m
}
