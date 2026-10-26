import { obterSupabase, modoDemonstracao } from './supabase'
import { normalizarWhatsapp } from '../features/avise-me/aviseMe'

export const VERSAO_TERMOS_CONSIGNACAO = '2026-10'

const ERROS = {
  muitos_envios: 'Recebemos vários envios seguidos deste contato. Aguarde alguns minutos ou fale com a gente no WhatsApp.',
}

async function chamar(funcao, payload) {
  if (modoDemonstracao) {
    await new Promise((r) => setTimeout(r, 600))
    console.info(`[${funcao}] modo demonstração, nada foi salvo:`, payload)
    return 'demo'
  }
  const supabase = await obterSupabase()
  const { data, error } = await supabase.rpc(funcao, payload)
  if (error) {
    const chave = Object.keys(ERROS).find((k) => error.message?.includes(k))
    if (chave) throw new Error(ERROS[chave])
    if (!navigator.onLine) throw new Error('Parece que você está sem internet. Confira a conexão e tente de novo.')
    throw new Error('Não conseguimos enviar agora. Tente de novo em instantes ou fale com a gente no WhatsApp.')
  }
  return data
}

export function enviarConsignacao(d) {
  return chamar('enviar_consignacao', {
    p_tipo: d.tipo,
    p_nome: d.nome.trim(),
    p_whatsapp: normalizarWhatsapp(d.whatsapp),
    p_email: d.email.trim() || null,
    p_cidade: d.cidade.trim() || null,
    p_empresa: d.tipo === 'loja' ? d.empresa.trim() || null : null,
    p_instagram: d.instagram.trim() || null,
    p_quantidade: d.quantidade,
    p_categorias: d.categorias,
    p_mensagem: d.mensagem.trim() || null,
    p_aceite: d.aceite,
    p_versao_termos: VERSAO_TERMOS_CONSIGNACAO,
  })
}

export function enviarMensagem(d) {
  return chamar('enviar_mensagem', {
    p_nome: d.nome.trim(),
    p_contato: d.contato.trim(),
    p_assunto: d.assunto,
    p_mensagem: d.mensagem.trim(),
  })
}
