import { useCallback, useEffect, useState } from 'react'
import { siWhatsapp } from '../components/iconesMarca'
import { IconeMarca } from '../components/Cabecalho'
import { mensagemErro, supabaseAdmin } from './supabaseAdmin'

const STATUS_SOLICITACAO = {
  nova: 'Nova',
  'em-contato': 'Em contato',
  aceita: 'Aceita',
  recusada: 'Recusada',
}
const QUANTIDADE = { 'ate-10': 'até 10 peças', '10-30': '10 a 30 peças', 'mais-30': 'mais de 30 peças' }
const ASSUNTO = { compra: 'Compra', consignacao: 'Consignação', parceria: 'Parceria', mala: 'Mala Atalia', outro: 'Outro' }

const data = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

function telefone(w) {
  const d = w.replace(/^55/, '')
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
}

/** Monta link de WhatsApp quando o contato digitado parece um telefone */
function whatsDoContato(contato) {
  const d = contato.replace(/\D/g, '')
  if (d.length === 10 || d.length === 11) return `55${d}`
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) return d
  return null
}

export default function Mensagens() {
  const [aba, setAba] = useState('consignacao')
  const [solicitacoes, setSolicitacoes] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      const sb = await supabaseAdmin()
      const [a, b] = await Promise.all([
        sb.from('solicitacoes_consignacao').select('*').order('created_at', { ascending: false }),
        sb.from('mensagens_contato').select('*').order('created_at', { ascending: false }),
      ])
      if (a.error || b.error) throw a.error || b.error
      setSolicitacoes(a.data)
      setMensagens(b.data)
      setErro('')
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function atualizar(tabela, id, campos, setLista) {
    setLista((ls) => ls.map((x) => (x.id === id ? { ...x, ...campos } : x)))
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.from(tabela).update(campos).eq('id', id)
      if (error) throw error
    } catch (e) {
      setErro(mensagemErro(e))
      carregar()
    }
  }

  const novasSol = solicitacoes.filter((s) => s.status === 'nova').length
  const novasMsg = mensagens.filter((m) => m.status === 'nova').length

  return (
    <main className="adm-pagina">
      <div className="adm-cabeca">
        <div>
          <h1>Mensagens</h1>
          <p>Pedidos de consignação, parcerias e mensagens do formulário de contato.</p>
        </div>
      </div>

      <div className="adm-chips" role="tablist" aria-label="Tipo de mensagem">
        <button type="button" role="tab" aria-selected={aba === 'consignacao'} aria-pressed={aba === 'consignacao'} onClick={() => setAba('consignacao')}>
          Consignação e parceria <span>{novasSol ? `${novasSol} nova${novasSol > 1 ? 's' : ''}` : solicitacoes.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={aba === 'contato'} aria-pressed={aba === 'contato'} onClick={() => setAba('contato')}>
          Contato <span>{novasMsg ? `${novasMsg} nova${novasMsg > 1 ? 's' : ''}` : mensagens.length}</span>
        </button>
      </div>

      {erro && (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="adm-vazio">Carregando…</p>
      ) : aba === 'consignacao' ? (
        solicitacoes.length === 0 ? (
          <p className="adm-vazio">Nenhum pedido de consignação ainda.</p>
        ) : (
          <ul className="adm-leads adm-msgs">
            {solicitacoes.map((s) => (
              <li key={s.id} data-nova={s.status === 'nova'}>
                <div className="adm-leads__info">
                  <strong>
                    {s.nome} {s.tipo === 'loja' && <em className="adm-tag">Loja: {s.empresa}</em>}
                  </strong>
                  <span>
                    {telefone(s.whatsapp)}
                    {s.email && ` · ${s.email}`}
                    {s.cidade && ` · ${s.cidade}`}
                    {s.instagram && ` · ${s.instagram}`}
                  </span>
                  <span>
                    {QUANTIDADE[s.quantidade]}
                    {s.categorias?.length > 0 && ` · ${s.categorias.join(', ').replaceAll('-', ' ')}`}
                  </span>
                  {s.mensagem && <p className="adm-msgs__texto">“{s.mensagem}”</p>}
                  <span className="adm-dica">Recebido em {data(s.created_at)}</span>
                </div>
                <div className="adm-msgs__acoes">
                  <a
                    className="adm-botao adm-botao--whats"
                    href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Oi, ${s.nome.split(' ')[0]}! Aqui é a Wirlla, da Atalia Brechó. Recebi seu pedido de ${s.tipo === 'loja' ? 'parceria' : 'consignação'} pelo site.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => s.status === 'nova' && atualizar('solicitacoes_consignacao', s.id, { status: 'em-contato' }, setSolicitacoes)}
                  >
                    <IconeMarca icone={siWhatsapp} tamanho={18} /> Responder
                  </a>
                  <label className="adm-campo">
                    <span className="sr-only">Situação</span>
                    <select value={s.status} onChange={(e) => atualizar('solicitacoes_consignacao', s.id, { status: e.target.value }, setSolicitacoes)}>
                      {Object.entries(STATUS_SOLICITACAO).map(([v, t]) => (
                        <option key={v} value={v}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : mensagens.length === 0 ? (
        <p className="adm-vazio">Nenhuma mensagem ainda.</p>
      ) : (
        <ul className="adm-leads adm-msgs">
          {mensagens.map((m) => {
            const whats = whatsDoContato(m.contato)
            const email = m.contato.includes('@') ? m.contato : null
            return (
              <li key={m.id} data-nova={m.status === 'nova'}>
                <div className="adm-leads__info">
                  <strong>
                    {m.nome} <em className="adm-tag">{ASSUNTO[m.assunto]}</em>
                  </strong>
                  <span>{m.contato}</span>
                  <p className="adm-msgs__texto">“{m.mensagem}”</p>
                  <span className="adm-dica">Recebida em {data(m.created_at)}</span>
                </div>
                <div className="adm-msgs__acoes">
                  {whats && (
                    <a
                      className="adm-botao adm-botao--whats"
                      href={`https://wa.me/${whats}?text=${encodeURIComponent(`Oi, ${m.nome.split(' ')[0]}! Aqui é a Wirlla, da Atalia Brechó. Recebi sua mensagem pelo site.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => atualizar('mensagens_contato', m.id, { status: 'respondida' }, setMensagens)}
                    >
                      <IconeMarca icone={siWhatsapp} tamanho={18} /> Responder
                    </a>
                  )}
                  {email && (
                    <a className="adm-botao adm-botao--vazado" href={`mailto:${email}?subject=${encodeURIComponent('Atalia Brechó')}`} onClick={() => atualizar('mensagens_contato', m.id, { status: 'respondida' }, setMensagens)}>
                      Responder por e-mail
                    </a>
                  )}
                  <button
                    type="button"
                    className="adm-link"
                    onClick={() => atualizar('mensagens_contato', m.id, { status: m.status === 'nova' ? 'respondida' : 'nova' }, setMensagens)}
                  >
                    {m.status === 'nova' ? 'Marcar como respondida' : 'Marcar como nova'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
