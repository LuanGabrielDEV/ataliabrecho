import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { siWhatsapp } from '../components/iconesMarca'
import { IconeMarca } from '../components/Cabecalho'
import { TAMANHOS_ORDEM } from '../data/pecasDemo'
import { normalizarPeca } from '../data/catalogoBase'
import { formatarPreco } from '../config'
import { mensagemErro, supabaseAdmin } from './supabaseAdmin'

function telefone(w) {
  const d = w.replace(/^55/, '')
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
}

function data(d) {
  return d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'
}

export default function Avisos() {
  const [params, setParams] = useSearchParams()
  const pecaId = params.get('peca')
  const [leads, setLeads] = useState([])
  const [peca, setPeca] = useState(null)
  const [tamanho, setTamanho] = useState('')
  const [mostrarInativos, setMostrarInativos] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const sb = await supabaseAdmin()
      if (pecaId) {
        const [{ data: p, error: e1 }, { data: ls, error: e2 }] = await Promise.all([
          sb.from('pecas').select('*, peca_fotos(*)').eq('id', pecaId).single(),
          sb.rpc('leads_para_peca', { p_peca_id: pecaId }),
        ])
        if (e1 || e2) throw e1 || e2
        setPeca(normalizarPeca(p))
        setLeads(ls)
      } else {
        const { data: ls, error } = await sb.from('leads').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setPeca(null)
        setLeads(ls)
      }
      setErro('')
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [pecaId])

  useEffect(() => {
    // Recarrega ao trocar de peça; o indicador de carregamento precisa ligar antes da busca.
    // oxlint-disable-next-line react/set-state-in-effect
    carregar()
  }, [carregar])

  const visiveis = useMemo(
    () => leads.filter((l) => (mostrarInativos || l.ativo) && (!tamanho || l.tamanhos.includes(tamanho))),
    [leads, tamanho, mostrarInativos],
  )

  function mensagem(lead) {
    const nome = lead.nome.split(' ')[0]
    if (peca) {
      const link = `${location.origin}/peca/${peca.id}`
      return `Oi, ${nome}! Aqui é a Wirlla, da Atalia Brechó. Chegou uma peça no seu tamanho: ${peca.titulo}, tam. ${peca.tamanho}, por ${formatarPreco(peca.preco)}. Veja aqui: ${link}`
    }
    return `Oi, ${nome}! Aqui é a Wirlla, da Atalia Brechó. Chegaram peças novas no seu tamanho: ${location.origin}/comprar`
  }

  async function avisar(lead) {
    window.open(`https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(mensagem(lead))}`, '_blank', 'noopener')
    // Roda em clique (não na renderização): a regra de pureza aponta falso positivo.
    // oxlint-disable-next-line react/purity
    const agora = new Date().toISOString()
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, ultimo_aviso_em: agora } : l)))
    try {
      const sb = await supabaseAdmin()
      await sb.from('leads').update({ ultimo_aviso_em: agora }).eq('id', lead.id)
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  async function alternarAtivo(lead) {
    const ativo = !lead.ativo
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, ativo } : l)))
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.from('leads').update({ ativo }).eq('id', lead.id)
      if (error) throw error
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  return (
    <main className="adm-pagina">
      <div className="adm-cabeca">
        <div>
          <h1>Avise-me</h1>
          <p>
            {leads.filter((l) => l.ativo).length} pessoas querem ser avisadas{peca ? ' desta peça' : ''}.
          </p>
        </div>
      </div>

      {peca && (
        <div className="adm-peca-aviso">
          {(peca.recorte || peca.foto) && <img src={peca.recorte || peca.foto} alt="" />}
          <div>
            <strong>{peca.titulo}</strong>
            <span>
              #{peca.codigo} · Tam. {peca.tamanho} · {formatarPreco(peca.preco)}
            </span>
            <p className="adm-dica">Estas pessoas pediram esse tamanho{peca.categoria ? ' e essa categoria' : ''}.</p>
          </div>
          <button type="button" className="adm-link" onClick={() => setParams({})}>
            Ver todos
          </button>
        </div>
      )}

      {!peca && (
        <div className="adm-ferramentas">
          <div className="adm-chips" role="group" aria-label="Filtrar por tamanho">
            <button type="button" aria-pressed={!tamanho} onClick={() => setTamanho('')}>
              Todos
            </button>
            {TAMANHOS_ORDEM.map((t) => (
              <button key={t} type="button" aria-pressed={tamanho === t} onClick={() => setTamanho(t)}>
                {t}
              </button>
            ))}
          </div>
          <label className="adm-check">
            <input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} /> Mostrar quem pediu para sair
          </label>
        </div>
      )}

      {erro && (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="adm-vazio">Carregando…</p>
      ) : visiveis.length === 0 ? (
        <p className="adm-vazio">
          Ninguém por aqui ainda. Divulgue o link <Link to="/avise-me">/avise-me</Link> na bio do Instagram.
        </p>
      ) : (
        <ul className="adm-leads">
          {visiveis.map((l) => (
            <li key={l.id} data-ativo={l.ativo}>
              <div className="adm-leads__info">
                <strong>{l.nome}</strong>
                <span>{telefone(l.whatsapp)}</span>
                <span className="adm-leads__tags">
                  {l.tamanhos.map((t) => (
                    <em key={t}>{t}</em>
                  ))}
                </span>
                <span className="adm-dica">
                  Desde {data(l.created_at)} · último aviso: {data(l.ultimo_aviso_em)} · veio por: {l.origem}
                </span>
              </div>
              <div className="adm-leads__acoes">
                {l.ativo && (
                  <button type="button" className="adm-botao adm-botao--whats" onClick={() => avisar(l)}>
                    <IconeMarca icone={siWhatsapp} tamanho={18} /> Avisar
                  </button>
                )}
                <button type="button" className="adm-link" onClick={() => alternarAtivo(l)}>
                  {l.ativo ? 'Pediu para sair' : 'Reativar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
