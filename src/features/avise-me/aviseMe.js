import { supabase, modoDemonstracao } from '../../lib/supabase'

export const VERSAO_POLITICA = '2026-10'

export const TAMANHOS_LETRA = ['PP', 'P', 'M', 'G', 'GG', 'XG']
export const TAMANHOS_NUMERO = ['34', '36', '38', '40', '42', '44', '46', '48']

export const CATEGORIAS = [
  { valor: 'vestidos', rotulo: 'Vestidos' },
  { valor: 'blusas-e-calcas', rotulo: 'Blusas e calças' },
  { valor: 'shorts-e-saias', rotulo: 'Shorts e saias' },
  { valor: 'praia-e-fitness', rotulo: 'Praia e fitness' },
  { valor: 'acessorios', rotulo: 'Acessórios' },
]

/** Formata enquanto a pessoa digita: (81) 99999-8888 */
export function mascararWhatsapp(valor) {
  const d = valor.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** "(81) 99999-8888" -> "5581999998888" (ou null se inválido) */
export function normalizarWhatsapp(valor) {
  let d = valor.replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('55')) d = d.slice(2)
  if (!/^[1-9][0-9]9?[0-9]{8}$/.test(d)) return null
  // celular brasileiro com 11 dígitos precisa começar com 9 depois do DDD
  if (d.length === 11 && d[2] !== '9') return null
  return `55${d}`
}

export function validar({ nome, whatsapp, tamanhos, consentimento }) {
  const erros = {}
  if (nome.trim().length < 2) erros.nome = 'Escreva seu nome para a gente saber com quem fala.'
  if (!whatsapp.trim()) erros.whatsapp = 'Informe seu WhatsApp com DDD.'
  else if (!normalizarWhatsapp(whatsapp)) erros.whatsapp = 'Esse número parece incompleto. Use DDD + número, ex.: (81) 99999-8888.'
  if (tamanhos.length === 0) erros.tamanhos = 'Escolha pelo menos um tamanho.'
  if (!consentimento) erros.consentimento = 'Precisamos da sua autorização para mandar os avisos.'
  return erros
}

/**
 * Envia o cadastro. Resolve com 'novo' | 'atualizado'.
 * Rejeita com Error cuja `message` já vem pronta para mostrar.
 */
export async function registrarAviso({ nome, whatsapp, tamanhos, categorias, consentimento, origem }) {
  const payload = {
    p_nome: nome.trim(),
    p_whatsapp: normalizarWhatsapp(whatsapp),
    p_tamanhos: tamanhos,
    p_categorias: categorias,
    p_consentimento: consentimento,
    p_versao_politica: VERSAO_POLITICA,
    p_origem: origem,
  }

  if (modoDemonstracao) {
    await new Promise((r) => setTimeout(r, 700))
    console.info('[Avise-me] modo demonstração, nada foi salvo:', payload)
    return 'novo'
  }

  const { data, error } = await supabase.rpc('registrar_aviso', payload)
  if (error) {
    if (!navigator.onLine) throw new Error('Parece que você está sem internet. Confira a conexão e tente de novo.')
    throw new Error('Não conseguimos salvar agora. Tente de novo em instantes ou fale com a gente no WhatsApp.')
  }
  return data
}

/* Lembrar se a faixa já foi fechada ou se a pessoa já se cadastrou.
   localStorage pode falhar (aba anônima, bloqueio), então tudo vai em try/catch. */
const CHAVE = 'atalia:avise-me'
const DIAS_OCULTA_APOS_FECHAR = 7

export function lerEstadoFaixa() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null')
    if (!salvo) return 'mostrar'
    if (salvo.cadastrada) return 'oculta'
    const dias = (Date.now() - salvo.fechadaEm) / 86_400_000
    return dias < DIAS_OCULTA_APOS_FECHAR ? 'oculta' : 'mostrar'
  } catch {
    return 'mostrar'
  }
}

export function salvarEstadoFaixa(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    /* sem armazenamento: a faixa simplesmente volta na próxima visita */
  }
}
