import { useEffect } from 'react'

export const SITE = 'https://ataliabrecho.vercel.app'
const NOME = 'Atalia Brechó'
const DESCRICAO_PADRAO =
  'Atalia Brechó: moda circular em Paulista/PE. Peças selecionadas de segunda mão, consignação e consumo consciente.'
const IMAGEM_PADRAO = `${SITE}/og-atalia.jpg`

function meta(seletor, criar, conteudo) {
  let el = document.head.querySelector(seletor)
  if (!el) {
    el = document.createElement('meta')
    criar(el)
    document.head.appendChild(el)
  }
  el.setAttribute('content', conteudo)
}
const porNome = (nome, conteudo) => meta(`meta[name="${nome}"]`, (el) => el.setAttribute('name', nome), conteudo)
const porPropriedade = (prop, conteudo) =>
  meta(`meta[property="${prop}"]`, (el) => el.setAttribute('property', prop), conteudo)

/**
 * Título, descrição, endereço canônico e dados de prévia da página atual.
 * Buscadores que executam JavaScript (Google) leem daqui. WhatsApp e Instagram não executam:
 * para eles valem as tags fixas do index.html e a função api/peca.js (prévia de cada peça).
 *
 * @param {{ titulo?: string, descricao?: string, imagem?: string, naoIndexar?: boolean, dados?: object }} pagina
 */
export function usePagina({ titulo, descricao, imagem, naoIndexar = false, dados } = {}) {
  const jsonDados = dados ? JSON.stringify(dados) : ''
  useEffect(() => {
    const tituloCompleto = titulo ? `${titulo} · ${NOME}` : `${NOME} · Moda com propósito`
    const desc = descricao || DESCRICAO_PADRAO
    const caminho = window.location.pathname
    const url = SITE + (caminho === '/' ? '/' : caminho.replace(/\/$/, ''))

    document.title = tituloCompleto
    porNome('description', desc)
    porNome('robots', naoIndexar ? 'noindex, nofollow' : 'index, follow')
    porPropriedade('og:title', tituloCompleto)
    porPropriedade('og:description', desc)
    porPropriedade('og:url', url)
    porPropriedade('og:image', imagem || IMAGEM_PADRAO)

    let canonica = document.head.querySelector('link[rel="canonical"]')
    if (!canonica) {
      canonica = document.createElement('link')
      canonica.setAttribute('rel', 'canonical')
      document.head.appendChild(canonica)
    }
    canonica.setAttribute('href', url)

    // dados estruturados da página (ex.: produto); some ao sair dela
    let script = document.getElementById('dados-pagina')
    if (jsonDados) {
      if (!script) {
        script = document.createElement('script')
        script.id = 'dados-pagina'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = jsonDados
    } else if (script) {
      script.remove()
    }
  }, [titulo, descricao, imagem, naoIndexar, jsonDados])
}
