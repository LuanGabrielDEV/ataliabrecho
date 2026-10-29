import { useCallback, useEffect, useMemo, useState } from 'react'
import { PECAS_DEMO } from './pecasDemo'
import { LOOKS } from './looks'
import { obterSupabase } from '../lib/supabase'
import { CatalogoContext, COLUNAS_PUBLICAS, FONTE_CATALOGO, normalizarPeca } from './catalogoBase'

// Demonstração: junta a foto do "Provador IA" às peças que têm look
const IA_POR_PECA = Object.fromEntries(LOOKS.map((l) => [l.pecaId, l.foto]))
const DEMO = PECAS_DEMO.map((p) => ({ ...p, fotoIa: IA_POR_PECA[p.id] || null }))

export function CatalogoProvider({ children }) {
  const [pecas, setPecas] = useState(FONTE_CATALOGO === 'demo' ? DEMO : [])
  const [carregando, setCarregando] = useState(FONTE_CATALOGO === 'supabase')
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    if (FONTE_CATALOGO !== 'supabase') return
    try {
      const supabase = await obterSupabase()
      const { data, error } = await supabase
        .from('pecas')
        .select(`${COLUNAS_PUBLICAS}, peca_fotos(*)`)
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
    // O setState acontece depois do await (busca de dados), não de forma síncrona: falso positivo.
      // oxlint-disable-next-line react/set-state-in-effect
    carregar()
  }, [carregar])

  const valor = useMemo(() => {
    const ordenadas = [...pecas].sort((a, b) => String(b.chegouEm).localeCompare(String(a.chegouEm)))
    return {
      pecas: ordenadas,
      carregando,
      erro,
      recarregar: () => {
        setCarregando(true)
        return carregar()
      },
      buscar: (id) => pecas.find((p) => p.id === id || p.codigo?.toLowerCase() === String(id).toLowerCase()) || null,
      looks: ordenadas.filter((p) => p.fotoIa && p.status !== 'vendida'),
    }
  }, [pecas, carregando, erro, carregar])

  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>
}
