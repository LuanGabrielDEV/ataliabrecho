import { TAMANHOS_ORDEM } from '../../data/pecasDemo'

export const FAIXAS_PRECO = [
  { slug: 'ate-30', nome: 'Até R$ 30', min: 0, max: 30 },
  { slug: '30-60', nome: 'R$ 30 a R$ 60', min: 30, max: 60 },
  { slug: '60-90', nome: 'R$ 60 a R$ 90', min: 60, max: 90 },
  { slug: 'acima-90', nome: 'Acima de R$ 90', min: 90, max: Infinity },
]

export const ORDENS = [
  { slug: 'novidades', nome: 'Chegaram por último' },
  { slug: 'menor-preco', nome: 'Menor preço' },
  { slug: 'maior-preco', nome: 'Maior preço' },
]

const lista = (v) => (v ? v.split(',').filter(Boolean) : [])

/** Lê os filtros da URL, para o link filtrado poder ser compartilhado */
export function lerFiltros(params) {
  return {
    categoria: params.get('categoria') || '',
    tamanhos: lista(params.get('tamanho')),
    cores: lista(params.get('cor')),
    condicoes: lista(params.get('estado')),
    preco: params.get('preco') || '',
    ordem: params.get('ordem') || 'novidades',
    vendidas: params.get('vendidas') === '1',
  }
}

export function escreverFiltros(f) {
  const p = new URLSearchParams()
  if (f.categoria) p.set('categoria', f.categoria)
  if (f.tamanhos.length) p.set('tamanho', f.tamanhos.join(','))
  if (f.cores.length) p.set('cor', f.cores.join(','))
  if (f.condicoes.length) p.set('estado', f.condicoes.join(','))
  if (f.preco) p.set('preco', f.preco)
  if (f.ordem && f.ordem !== 'novidades') p.set('ordem', f.ordem)
  if (f.vendidas) p.set('vendidas', '1')
  return p
}

export function contarFiltrosAtivos(f) {
  return f.tamanhos.length + f.cores.length + f.condicoes.length + (f.preco ? 1 : 0) + (f.vendidas ? 1 : 0)
}

export function aplicarFiltros(pecas, f) {
  const faixa = FAIXAS_PRECO.find((x) => x.slug === f.preco)
  const filtradas = pecas.filter((p) => {
    if (!f.vendidas && p.status === 'vendida') return false
    if (f.categoria && p.categoria !== f.categoria) return false
    if (f.tamanhos.length && !f.tamanhos.includes(p.tamanho)) return false
    if (f.cores.length && !f.cores.includes(p.cor)) return false
    if (f.condicoes.length && !f.condicoes.includes(p.condicao)) return false
    if (faixa && !(p.preco >= faixa.min && p.preco < faixa.max)) return false
    return true
  })

  const pesoStatus = { disponivel: 0, reservada: 1, vendida: 2 }
  return filtradas.sort((a, b) => {
    const s = pesoStatus[a.status] - pesoStatus[b.status]
    if (s) return s
    if (f.ordem === 'menor-preco') return a.preco - b.preco
    if (f.ordem === 'maior-preco') return b.preco - a.preco
    return b.chegouEm.localeCompare(a.chegouEm)
  })
}

/** Só oferece os tamanhos que existem nas peças, na ordem certa */
export function tamanhosDisponiveis(pecas) {
  const existentes = new Set(pecas.map((p) => p.tamanho))
  return TAMANHOS_ORDEM.filter((t) => existentes.has(t))
}
