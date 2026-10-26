import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PECAS_DEMO } from './pecasDemo'
import { LOOKS } from './looks'
import { obterSupabase, modoDemonstracao } from '../lib/supabase'

/**
 * De onde vem o catálogo:
 * - "demo": peças de demonstração (fotos reais, dados de exemplo). Padrão.
 * - "supabase": peças cadastradas pela Wirlla no painel /admin.
 * Troque em VITE_CATALOGO depois de cadastrar as primeiras peças.
 */
export const FONTE_CATALOGO =
  import.meta.env.VITE_CATALOGO === 'supabase' && !modoDemonstracao ? 'supabase' : 'demo'

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

// Demonstração: junta a foto do "Provador IA" às peças que têm look
const IA_POR_PECA = Object.fromEntries(LOOKS.map((l) => [l.pecaId, l.foto]))
const DEMO = PECAS_DEMO.map((p) => ({ ...p, fotoIa: IA_POR_PECA[p.id] || null }))

const CatalogoContext = createContext(null)

export function CatalogoProvider({ children }) {
  const [pecas, setPecas] = useState(FONTE_CATALOGO === 'demo' ? DEMO : [])
  const [carregando, setCarregando] = useState(FONTE_CATALOGO === 'supabase')
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    if (FONTE_CATALOGO !== 'supabase') return
    setCarregando(true)
    try {
      const supabase = await obterSupabase()
      const { data, error } = await supabase
        .from('pecas')
        .select('*, peca_fotos(*)')
        .order('chegou_em', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setPecas(data.map(normalizarPeca))
      setErro(null)
    } catch (e) {
      console.error('[catálogo]', e)
      setErro('Não conseguimos carregar as peças agora. Tente atualizar a página.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const valor = useMemo(() => {
    const ordenadas = [...pecas].sort((a, b) => String(b.chegouEm).localeCompare(String(a.chegouEm)))
    return {
      pecas: ordenadas,
      carregando,
      erro,
      recarregar: carregar,
      buscar: (id) => pecas.find((p) => p.id === id || p.codigo?.toLowerCase() === String(id).toLowerCase()) || null,
      looks: ordenadas.filter((p) => p.fotoIa && p.status !== 'vendida'),
    }
  }, [pecas, carregando, erro, carregar])

  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalogo() {
  const ctx = useContext(CatalogoContext)
  if (!ctx) throw new Error('useCatalogo precisa estar dentro de <CatalogoProvider>')
  return ctx
}
