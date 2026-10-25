import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente do Supabase. Fica `null` enquanto as variáveis de ambiente
 * não existirem. Nesse caso os serviços rodam em modo demonstração,
 * para o site funcionar localmente antes do banco estar criado.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const modoDemonstracao = !supabase
