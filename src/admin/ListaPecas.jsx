import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { mensagemErro, supabaseAdmin } from './supabaseAdmin'
import { FONTE_CATALOGO, normalizarPeca } from '../data/catalogoBase'
import { formatarPreco } from '../config'
import { STATUS } from './status'


export default function ListaPecas() {
  const [pecas, setPecas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [salvando, setSalvando] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const sb = await supabaseAdmin()
      const { data, error } = await sb
        .from('pecas')
        .select('*, peca_fotos(*)')
        .order('chegou_em', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setPecas(data.map(normalizarPeca))
      setErro('')
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    // O setState acontece depois do await (busca de dados), não de forma síncrona: falso positivo.
      // oxlint-disable-next-line react/set-state-in-effect
    carregar()
  }, [carregar])

  async function mudarStatus(peca, status) {
    setSalvando(peca.id)
    const anterior = peca.status
    setPecas((ps) => ps.map((p) => (p.id === peca.id ? { ...p, status } : p)))
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.from('pecas').update({ status }).eq('id', peca.id)
      if (error) throw error
    } catch (e) {
      setPecas((ps) => ps.map((p) => (p.id === peca.id ? { ...p, status: anterior } : p)))
      setErro(mensagemErro(e))
    } finally {
      setSalvando(null)
    }
  }

  const contagem = useMemo(() => {
    const c = { todas: pecas.length, disponivel: 0, reservada: 0, vendida: 0, oculta: 0 }
    pecas.forEach((p) => (c[p.status] += 1))
    return c
  }, [pecas])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return pecas.filter(
      (p) =>
        (filtro === 'todas' || p.status === filtro) &&
        (!termo || p.titulo.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo)),
    )
  }, [pecas, busca, filtro])

  return (
    <main className="adm-pagina">
      <div className="adm-cabeca">
        <div>
          <h1>Peças</h1>
          <p>
            {contagem.disponivel} disponíveis · {contagem.reservada} reservadas · {contagem.vendida} vendidas
          </p>
        </div>
        <Link to="/admin/pecas/nova" className="adm-botao">
          <Plus size={18} aria-hidden="true" /> Nova peça
        </Link>
      </div>

      {FONTE_CATALOGO === 'demo' && (
        <p className="adm-aviso" role="status">
          <strong>Atenção:</strong> o site ainda está mostrando as peças de demonstração. As peças cadastradas aqui só aparecem na
          vitrine depois que a variável <code>VITE_CATALOGO</code> for trocada para <code>supabase</code> (na Vercel, com novo deploy).
        </p>
      )}

      <div className="adm-ferramentas">
        <label className="adm-busca">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar peça</span>
          <input type="search" placeholder="Buscar por nome ou código" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="adm-chips" role="group" aria-label="Filtrar por status">
          {['todas', 'disponivel', 'reservada', 'vendida', 'oculta'].map((s) => (
            <button key={s} type="button" aria-pressed={filtro === s} onClick={() => setFiltro(s)}>
              {s === 'todas' ? 'Todas' : STATUS[s]} <span>{contagem[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {erro && (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="adm-vazio">Carregando…</p>
      ) : visiveis.length === 0 ? (
        <div className="adm-vazio">
          {pecas.length === 0 ? (
            <>
              <p>Nenhuma peça cadastrada ainda.</p>
              <Link to="/admin/pecas/nova" className="adm-botao">
                Cadastrar a primeira peça
              </Link>
            </>
          ) : (
            <p>Nenhuma peça com esse filtro.</p>
          )}
        </div>
      ) : (
        <ul className="adm-lista">
          {visiveis.map((p) => (
            <li key={p.id} data-status={p.status}>
              <Link to={`/admin/pecas/${p.id}`} className="adm-lista__foto" aria-hidden="true" tabIndex={-1}>
                {p.recorte || p.foto ? <img src={p.recorte || p.foto} alt="" loading="lazy" /> : <span>sem foto</span>}
              </Link>
              <div className="adm-lista__info">
                <Link to={`/admin/pecas/${p.id}`} className="adm-lista__titulo">
                  {p.titulo}
                </Link>
                <span>
                  #{p.codigo} · Tam. {p.tamanho} · <strong>{formatarPreco(p.preco)}</strong>
                </span>
              </div>
              <label className="adm-lista__status">
                <span className="sr-only">Status de {p.titulo}</span>
                <select value={p.status} disabled={salvando === p.id} onChange={(e) => mudarStatus(p, e.target.value)}>
                  {Object.entries(STATUS).map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
