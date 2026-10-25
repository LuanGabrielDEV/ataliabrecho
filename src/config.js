// Dados de contato da Atalia Brechó
export const CONTATO = {
  whatsapp: '558189086177', // +55 81 8908-6177
  whatsappExibicao: '(81) 8908-6177',
  instagram: 'https://www.instagram.com/ataliabrecho/',
  instagramUsuario: '@ataliabrecho',
  facebook: null, // preencher quando houver página; o link só aparece se existir
  email: 'ataliabrecho@gmail.com',
  cidade: 'Paulista, PE',
}

export function linkWhatsapp(mensagem) {
  return `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

export function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}
