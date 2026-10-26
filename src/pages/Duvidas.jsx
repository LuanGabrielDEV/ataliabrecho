import { useEffect, useId, useState } from 'react'
import { Mail, MapPin } from 'lucide-react'
import Perguntas from '../components/Perguntas'
import { IconeMarca } from '../components/Cabecalho'
import { siInstagram, siWhatsapp } from '../components/iconesMarca'
import { FAQ } from '../data/faq'
import { enviarMensagem } from '../lib/formularios'
import { CONTATO, linkWhatsapp } from '../config'
import './consigne.css'
import './duvidas.css'

const ASSUNTOS = [
  ['compra', 'Compra de uma peça'],
  ['consignacao', 'Consignação'],
  ['parceria', 'Parceria'],
  ['mala', 'Mala Atalia'],
  ['outro', 'Outro assunto'],
]

function FormContato() {
  const id = useId()
  const [d, setD] = useState({ nome: '', contato: '', assunto: 'compra', mensagem: '' })
  const [erros, setErros] = useState({})
  const [estado, setEstado] = useState('editando')
  const [erroEnvio, setErroEnvio] = useState('')

  const mudar = (k, v) => {
    setD((x) => ({ ...x, [k]: v }))
    if (erros[k]) setErros((x) => ({ ...x, [k]: undefined }))
  }

  async function enviar(e) {
    e.preventDefault()
    if (new FormData(e.currentTarget).get('site')) return
    const encontrados = {}
    if (d.nome.trim().length < 2) encontrados.nome = 'Escreva seu nome.'
    if (d.contato.trim().length < 5) encontrados.contato = 'Deixe um WhatsApp ou e-mail para a gente responder.'
    if (d.mensagem.trim().length < 5) encontrados.mensagem = 'Escreva sua mensagem.'
    setErros(encontrados)
    const primeiro = Object.keys(encontrados)[0]
    if (primeiro) {
      document.getElementById(`${id}-${primeiro}`)?.focus()
      return
    }
    setEstado('enviando')
    setErroEnvio('')
    try {
      await enviarMensagem(d)
      setEstado('enviado')
    } catch (err) {
      setErroEnvio(err.message)
      setEstado('editando')
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="cs-sucesso" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <h3>Mensagem enviada!</h3>
        <p>Obrigada, {d.nome.trim().split(/\s+/)[0]}. A Atalia responde pelo contato que você deixou.</p>
      </div>
    )
  }

  const erro = (k) => (erros[k] ? <p className="am-erro" id={`${id}-${k}-erro`}>{erros[k]}</p> : null)
  const desc = (k) => (erros[k] ? `${id}-${k}-erro` : undefined)

  return (
    <form className="am-form cs-form" onSubmit={enviar} noValidate aria-label="Formulário de contato">
      <div className="cs-linha">
        <div className="am-campo">
          <label htmlFor={`${id}-nome`}>Seu nome</label>
          <input id={`${id}-nome`} autoComplete="name" value={d.nome} onChange={(e) => mudar('nome', e.target.value)} aria-invalid={!!erros.nome} aria-describedby={desc('nome')} maxLength={80} />
          {erro('nome')}
        </div>
        <div className="am-campo">
          <label htmlFor={`${id}-contato`}>WhatsApp ou e-mail</label>
          <input id={`${id}-contato`} value={d.contato} onChange={(e) => mudar('contato', e.target.value)} aria-invalid={!!erros.contato} aria-describedby={desc('contato')} maxLength={120} />
          {erro('contato')}
        </div>
      </div>
      <div className="am-campo">
        <label htmlFor={`${id}-assunto`}>Assunto</label>
        <select id={`${id}-assunto`} className="dv-select" value={d.assunto} onChange={(e) => mudar('assunto', e.target.value)}>
          {ASSUNTOS.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="am-campo">
        <label htmlFor={`${id}-mensagem`}>Mensagem</label>
        <textarea id={`${id}-mensagem`} rows={4} value={d.mensagem} onChange={(e) => mudar('mensagem', e.target.value)} aria-invalid={!!erros.mensagem} aria-describedby={desc('mensagem')} maxLength={2000} />
        {erro('mensagem')}
      </div>
      <div className="am-armadilha" aria-hidden="true">
        <label>
          Site <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {erroEnvio && (
        <p className="am-erro am-erro--envio" role="alert">
          {erroEnvio}
        </p>
      )}
      <button type="submit" className="botao cs-enviar" disabled={estado === 'enviando'} aria-busy={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando…' : 'Enviar mensagem'}
      </button>
    </form>
  )
}

export default function Duvidas() {
  useEffect(() => {
    document.title = 'Dúvidas e contato · Atalia Brechó'
  }, [])

  return (
    <main id="conteudo" className="duvidas">
      <section className="conteiner dv-topo" aria-labelledby="dv-titulo">
        <h1 id="dv-titulo" className="titulo">
          Dúvidas e <em>contato</em>
        </h1>
        <p>As perguntas mais comuns estão aqui. Se a sua não estiver, fale com a gente: a resposta mais rápida é pelo WhatsApp.</p>
      </section>

      <div className="conteiner dv-grade">
        <div className="dv-perguntas">
          {FAQ.map((g) => (
            <section key={g.grupo} aria-labelledby={`dv-${g.grupo}`}>
              <h2 id={`dv-${g.grupo}`}>{g.grupo}</h2>
              <Perguntas itens={g.itens} />
            </section>
          ))}
        </div>

        <aside className="dv-contato" aria-labelledby="dv-contato-titulo">
          <h2 id="dv-contato-titulo">Fale com a Atalia</h2>
          <ul>
            <li>
              <a href={linkWhatsapp('Oi, Atalia! Vim pela página de dúvidas.')} target="_blank" rel="noreferrer">
                <IconeMarca icone={siWhatsapp} tamanho={20} />
                <span>
                  <strong>WhatsApp</strong>
                  {CONTATO.whatsappExibicao}
                </span>
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram} target="_blank" rel="noreferrer">
                <IconeMarca icone={siInstagram} tamanho={20} />
                <span>
                  <strong>Instagram</strong>
                  {CONTATO.instagramUsuario}
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTATO.email}`}>
                <Mail size={20} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  <strong>E-mail</strong>
                  {CONTATO.email}
                </span>
              </a>
            </li>
            <li>
              <span className="dv-local">
                <MapPin size={20} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  <strong>Onde estamos</strong>
                  {CONTATO.cidade}. Brechó online, com retirada combinada.
                </span>
              </span>
            </li>
          </ul>
        </aside>
      </div>

      <section className="conteiner cs-secao dv-form" aria-labelledby="dv-form-titulo">
        <div className="cs-form-texto">
          <h2 id="dv-form-titulo" className="titulo">
            Prefere escrever?
          </h2>
          <p>Mande sua mensagem por aqui e a Atalia responde pelo WhatsApp ou e-mail que você deixar.</p>
        </div>
        <div className="cs-form-caixa">
          <FormContato />
        </div>
      </section>
    </main>
  )
}
