// Dados de contato da Atalia. ⚠️ PENDENTE: confirmar número e perfis reais.
export const CONTATO = {
  whatsapp: '5581900000000', // TODO: número real da Atalia (55 + DDD + número)
  instagram: 'https://www.instagram.com/', // TODO: perfil real
  facebook: 'https://www.facebook.com/', // TODO: página real
  email: 'wirlla.lima@gmail.com',
  cidade: 'Paulista, PE',
}

export function linkWhatsapp(mensagem) {
  return `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

export function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}
