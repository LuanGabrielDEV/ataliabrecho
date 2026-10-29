import { createContext, useContext } from 'react'
import { modoDemonstracao } from '../lib/supabase'

/**
 * De onde vem o catálogo:
 * - "demo": peças de demonstração (fotos reais, dados de exemplo). Padrão.
 * - "supabase": peças cadastradas pela Wirlla no painel /admin.
 * Troque em VITE_CATALOGO depois de cadastrar as primeiras peças.
 */
export const FONTE_CATALOGO =
  import.meta.env.VITE_CATALOGO === 'supabase' && !modoDemonstracao ? 'supabase' : 'demo'

/**
 * O visitante só pode ler estas colunas (a migration 004 revoga o resto).
 * Se uma coluna nova precisar aparecer no site, inclua aqui E no GRANT da migration.
 */
export const COLUNAS_PUBLICAS =
  'id, codigo, titulo, descricao, categoria, tamanho, preco, preco_original, cor, condicao, tecido, observacao, status, destaque, chegou_em, created_at'

const URL_FOTOS = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pecas/`

export function urlFoto(caminho) {
  return caminho?.startsWith('http') || caminho?.startsWith('/') ? caminho : URL_FOTOS + caminho
}

/** Converte uma linha do banco para o formato usado pelas páginas */
export function normalizarPeca(linha) {
  const fotos = [...(linha.peca_fotos || [])].sort((a, b) => a.ordem - b.ordem)
  const reais = fotos.filter((f) => !f.gerada_por_ia)
  const recortada = reais.find((f) => f.recortada)
  const original = reais.find((f) => !f.recortada) || reais[0]
  const ia = fotos.find((f) => f.gerada_por_ia)
  return {
    id: linha.id,
    codigo: linha.codigo,
    titulo: linha.titulo,
    descricao: linha.descricao,
    categoria: linha.categoria,
    tamanho: linha.tamanho,
    preco: Number(linha.preco),
    precoOriginal: linha.preco_original ? Number(linha.preco_original) : null,
    cor: linha.cor,
    condicao: linha.condicao,
    tecido: linha.tecido,
    observacao: linha.observacao,
    medidas: linha.medidas && Object.keys(linha.medidas).length ? linha.medidas : null,
    status: linha.status,
    destaque: linha.destaque,
    chegouEm: linha.chegou_em,
    foto: original ? urlFoto(original.caminho) : recortada ? urlFoto(recortada.caminho) : null,
    recorte: recortada ? urlFoto(recortada.caminho) : null,
    fotoIa: ia ? urlFoto(ia.caminho) : null,
  }
}

export const CatalogoContext = createContext(null)

export function useCatalogo() {
  const ctx = useContext(CatalogoContext)
  if (!ctx) throw new Error('useCatalogo precisa estar dentro de <CatalogoProvider>')
  return ctx
}
