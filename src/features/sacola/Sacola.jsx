import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const SacolaContext = createContext(null)
const CHAVE = 'atalia:sacola'

function ler() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/**
 * Sacola guardada no aparelho da cliente. Cada peça é única, então
 * não existe quantidade: a peça está ou não está na sacola.
 * A reserva de verdade acontece no checkout (servidor).
 */
export function SacolaProvider({ children }) {
  const [itens, setItens] = useState(ler)
  const [aviso, setAviso] = useState(null)
  const [gavetaAberta, setGavetaAberta] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch {
      /* sem armazenamento: a sacola vale só nesta visita */
    }
  }, [itens])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3600)
    return () => clearTimeout(t)
  }, [aviso])

  const adicionar = useCallback((peca) => {
    setItens((atual) =>
      atual.some((p) => p.id === peca.id)
        ? atual
        : [
            ...atual,
            {
              id: peca.id,
              codigo: peca.codigo,
              titulo: peca.titulo,
              tamanho: peca.tamanho,
              preco: peca.preco,
              foto: peca.foto,
              recorte: peca.recorte,
            },
          ],
    )
    setAviso({ id: Date.now(), texto: `${peca.titulo} está na sacola.` })
  }, [])

  const remover = useCallback((id) => setItens((atual) => atual.filter((p) => p.id !== id)), [])
  const abrirGaveta = useCallback(() => {
    setAviso(null)
    setGavetaAberta(true)
  }, [])
  const fecharGaveta = useCallback(() => setGavetaAberta(false), [])

  const valor = useMemo(
    () => ({
      itens,
      total: itens.reduce((s, p) => s + p.preco, 0),
      tem: (id) => itens.some((p) => p.id === id),
      adicionar,
      remover,
      aviso,
      gavetaAberta,
      abrirGaveta,
      fecharGaveta,
    }),
    [itens, adicionar, remover, aviso, gavetaAberta, abrirGaveta, fecharGaveta],
  )

  return <SacolaContext.Provider value={valor}>{children}</SacolaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSacola() {
  const ctx = useContext(SacolaContext)
  if (!ctx) throw new Error('useSacola precisa estar dentro de <SacolaProvider>')
  return ctx
}
