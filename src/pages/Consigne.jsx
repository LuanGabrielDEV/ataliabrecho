import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Perguntas from '../components/Perguntas'
import { IconeMarca } from '../components/Cabecalho'
import { siWhatsapp } from '../components/iconesMarca'
import { CATEGORIAS, mascararWhatsapp, normalizarWhatsapp } from '../features/avise-me/aviseMe'
import { enviarConsignacao } from '../lib/formularios'
import { FAQ } from '../data/faq'
import { linkWhatsapp } from '../config'
import './consigne.css'

const PASSOS = [
  ['Conte o que você tem', 'Preencha o formulário com seus dados e o tipo de peça que quer consignar.'],
  ['A gente conversa', 'A Atalia entra em contato pelo WhatsApp para combinar a avaliação e a entrega das peças.'],
  ['Suas peças à venda', 'As peças selecionadas são fotografadas e ficam expostas por 60 dias.'],
  ['Vendeu, você recebe', '50% do valor de cada peça vendida é seu, com repasse em até 7 dias úteis.'],
]

const QUANTIDADES = [
  ['ate-10', 'Até 10 peças'],
  ['10-30', 'De 10 a 30'],
  ['mais-30', 'Mais de 30'],
]

const VAZIO = {
  tipo: 'pessoa',
  nome: '',
  whatsapp: '',
  email: '',
  cidade: '',
  empresa: '',
  instagram: '',
  quantidade: 'ate-10',
  categorias: [],
  mensagem: '',
  aceite: false,
}

function validar(d) {
  const e = {}
  if (d.nome.trim().length < 2) e.nome = 'Escreva seu nome.'
  if (!normalizarWhatsapp(d.whatsapp)) e.whatsapp = 'Informe um WhatsApp com DDD, ex.: (81) 99999-8888.'
  if (d.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = 'Esse e-mail parece incompleto.'
  if (d.tipo === 'loja' && !d.empresa.trim()) e.empresa = 'Escreva o nome da loja ou do negócio.'
  if (!d.aceite) e.aceite = 'Para enviar, é preciso concordar com os termos de consignação.'
  return e
}

function Formulario() {
  const id = useId()
  const formRef = useRef(null)
  const [d, setD] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [enviado, setEnviado] = useState(false)

  const mudar = (k, v) => {
    setD((x) => ({ ...x, [k]: v }))
    if (erros[k]) setErros((x) => ({ ...x, [k]: undefined }))
  }

  async function enviar(e) {
    e.preventDefault()
    setErroEnvio('')
    if (new FormData(e.currentTarget).get('site')) return // armadilha para robôs
    const encontrados = validar(d)
    setErros(encontrados)
    const primeiro = Object.keys(encontrados)[0]
    if (primeiro) {
      formRef.current?.querySelector(`[data-campo="${primeiro}"]`)?.focus()
      return
    }
    setEnviando(true)
    try {
      await enviarConsignacao(d)
      setEnviado(true)
    } catch (err) {
      setErroEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    const nome = d.nome.trim().split(/\s+/)[0]
    return (
      <div className="cs-sucesso" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <CheckCircle2 size={36} strokeWidth={1.6} aria-hidden="true" />
        <h3>Recebemos, {nome}!</h3>
        <p>A Atalia vai entrar em contato pelo WhatsApp para combinar os próximos passos. Se quiser adiantar, mande fotos das peças agora:</p>
        <a
          className="botao"
          href={linkWhatsapp(`Oi, Atalia! Sou ${d.nome.trim()} e acabei de preencher o formulário de ${d.tipo === 'loja' ? 'parceria' : 'consignação'} no site. Seguem fotos das peças:`)}
          target="_blank"
          rel="noreferrer"
        >
          <IconeMarca icone={siWhatsapp} tamanho={18} /> Enviar fotos pelo WhatsApp
        </a>
      </div>
    )
  }

  const erroId = (k) => (erros[k] ? `${id}-${k}-erro` : undefined)
  const erro = (k) => (erros[k] ? <p className="am-erro" id={erroId(k)}>{erros[k]}</p> : null)

  return (
    <form ref={formRef} className="am-form cs-form" onSubmit={enviar} noValidate aria-labelledby="cs-form-titulo">
      <fieldset className="am-grupo">
        <legend>Você é</legend>
        <div className="cs-tipo">
          {[
            ['pessoa', 'Pessoa física', 'Quero desapegar das minhas roupas'],
            ['loja', 'Loja ou empreendedora', 'Quero ser parceira da Atalia'],
          ].map(([v, t, s]) => (
            <label key={v} className="cs-tipo__opcao">
              <input type="radio" name={`${id}-tipo`} checked={d.tipo === v} onChange={() => mudar('tipo', v)} />
              <span>
                <strong>{t}</strong>
                <small>{s}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="cs-linha">
        <div className="am-campo">
          <label htmlFor={`${id}-nome`}>Seu nome</label>
          <input id={`${id}-nome`} data-campo="nome" autoComplete="name" value={d.nome} onChange={(e) => mudar('nome', e.target.value)} aria-invalid={!!erros.nome} aria-describedby={erroId('nome')} maxLength={80} />
          {erro("nome")}
        </div>
        <div className="am-campo">
          <label htmlFor={`${id}-whats`}>WhatsApp com DDD</label>
          <input id={`${id}-whats`} data-campo="whatsapp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(81) 99999-8888" value={d.whatsapp} onChange={(e) => mudar('whatsapp', mascararWhatsapp(e.target.value))} aria-invalid={!!erros.whatsapp} aria-describedby={erroId('whatsapp')} />
          {erro("whatsapp")}
        </div>
      </div>

      {d.tipo === 'loja' && (
        <div className="cs-linha">
          <div className="am-campo">
            <label htmlFor={`${id}-empresa`}>Nome da loja ou negócio</label>
            <input id={`${id}-empresa`} data-campo="empresa" autoComplete="organization" value={d.empresa} onChange={(e) => mudar('empresa', e.target.value)} aria-invalid={!!erros.empresa} aria-describedby={erroId('empresa')} maxLength={80} />
            {erro("empresa")}
          </div>
          <div className="am-campo">
            <label htmlFor={`${id}-insta`}>Instagram (opcional)</label>
            <input id={`${id}-insta`} placeholder="@sualoja" value={d.instagram} onChange={(e) => mudar('instagram', e.target.value)} maxLength={60} />
          </div>
        </div>
      )}

      <div className="cs-linha">
        <div className="am-campo">
          <label htmlFor={`${id}-email`}>E-mail (opcional)</label>
          <input id={`${id}-email`} data-campo="email" type="email" autoComplete="email" value={d.email} onChange={(e) => mudar('email', e.target.value)} aria-invalid={!!erros.email} aria-describedby={erroId('email')} />
          {erro("email")}
        </div>
        <div className="am-campo">
          <label htmlFor={`${id}-cidade`}>Cidade e bairro (opcional)</label>
          <input id={`${id}-cidade`} placeholder="Ex.: Paulista, Janga" value={d.cidade} onChange={(e) => mudar('cidade', e.target.value)} maxLength={80} />
        </div>
      </div>

      <fieldset className="am-grupo">
        <legend>Quantas peças, mais ou menos?</legend>
        <div className="am-chips">
          {QUANTIDADES.map(([v, t]) => (
            <label key={v} className="am-chip">
              <input type="radio" name={`${id}-qtd`} checked={d.quantidade === v} onChange={() => mudar('quantidade', v)} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="am-grupo">
        <legend>
          Que tipo de peça? <span className="am-opcional">(opcional)</span>
        </legend>
        <div className="am-chips">
          {CATEGORIAS.map((c) => (
            <label key={c.valor} className="am-chip">
              <input
                type="checkbox"
                checked={d.categorias.includes(c.valor)}
                onChange={() =>
                  mudar('categorias', d.categorias.includes(c.valor) ? d.categorias.filter((x) => x !== c.valor) : [...d.categorias, c.valor])
                }
              />
              <span>{c.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="am-campo">
        <label htmlFor={`${id}-msg`}>Quer contar mais alguma coisa? (opcional)</label>
        <textarea id={`${id}-msg`} rows={3} value={d.mensagem} onChange={(e) => mudar('mensagem', e.target.value)} maxLength={1000} placeholder="Marcas, estado das peças, melhor horário para falar…" />
      </div>

      <div className="am-campo am-campo--check">
        <input id={`${id}-aceite`} data-campo="aceite" type="checkbox" checked={d.aceite} onChange={(e) => mudar('aceite', e.target.checked)} aria-invalid={!!erros.aceite} aria-describedby={erroId('aceite')} />
        <label htmlFor={`${id}-aceite`}>
          Li e concordo com os <Link to="/politicas#consignacao">termos de consignação</Link> e autorizo a Atalia a me contatar pelo WhatsApp.
        </label>
        {erro("aceite")}
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

      <button type="submit" className="botao cs-enviar" disabled={enviando} aria-busy={enviando}>
        {enviando ? 'Enviando…' : d.tipo === 'loja' ? 'Quero ser parceira' : 'Quero consignar'}
      </button>
    </form>
  )
}

export default function Consigne() {
  useEffect(() => {
    document.title = 'Consigne suas peças · Atalia Brechó'
  }, [])

  const perguntas = FAQ.find((g) => g.grupo.startsWith('Consignação'))?.itens || []

  return (
    <main id="conteudo" className="consigne-pagina">
      <section className="conteiner cs-abertura" aria-labelledby="cs-titulo">
        <div>
          <h1 id="cs-titulo" className="titulo">
            Desapegue e ganhe com <em>suas roupas</em>
          </h1>
          <p>
            Aquela peça que está parada no armário pode ganhar uma nova história e virar renda para você. Na Atalia, quem
            consigna recebe metade de cada venda. Vale para quem quer desapegar e para lojas e empreendedoras parceiras.
          </p>
          <a href="#formulario" className="botao">
            Quero consignar
          </a>
        </div>
        <dl className="cs-termos">
          <div>
            <dt>50%</dt>
            <dd>do valor de cada peça vendida é seu</dd>
          </div>
          <div>
            <dt>60 dias</dt>
            <dd>de exposição para cada peça</dd>
          </div>
          <div>
            <dt>7 dias úteis</dt>
            <dd>no máximo para o repasse depois da venda</dd>
          </div>
        </dl>
      </section>

      <section className="conteiner cs-secao" aria-labelledby="cs-como">
        <div className="secao-topo">
          <h2 id="cs-como" className="titulo">
            Como funciona
          </h2>
        </div>
        <ol className="cs-passos">
          {PASSOS.map(([t, x], i) => (
            <li key={t}>
              <span aria-hidden="true">{i + 1}</span>
              <h3>{t}</h3>
              <p>{x}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="conteiner cs-secao cs-parceria" aria-labelledby="cs-parceria">
        <h2 id="cs-parceria" className="titulo">
          Tem loja ou é empreendedora?
        </h2>
        <p>
          A parceria com a Atalia funciona pelo mesmo modelo da consignação: suas peças ganham mais vitrine e cada venda é
          dividida meio a meio. É uma forma de fazer a moda circular e de fortalecer outras mulheres que empreendem.
        </p>
      </section>

      <section className="conteiner cs-secao cs-form-secao" id="formulario" aria-labelledby="cs-form-titulo">
        <div className="cs-form-texto">
          <h2 id="cs-form-titulo" className="titulo">
            Vamos começar?
          </h2>
          <p>Preencha o formulário e a Atalia entra em contato pelo WhatsApp. Não precisa enviar as peças agora.</p>
        </div>
        <div className="cs-form-caixa">
          <Formulario />
        </div>
      </section>

      <section className="conteiner cs-secao" aria-labelledby="cs-duvidas">
        <div className="secao-topo">
          <h2 id="cs-duvidas" className="titulo">
            Dúvidas sobre consignação
          </h2>
          <Link to="/duvidas" className="link-seta" viewTransition>
            Ver todas as dúvidas
          </Link>
        </div>
        <Perguntas itens={perguntas} />
      </section>
    </main>
  )
}
