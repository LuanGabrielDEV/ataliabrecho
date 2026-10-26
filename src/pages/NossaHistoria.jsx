import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Handshake, Repeat, ShoppingBag, Sparkles } from 'lucide-react'
import { Simbolo } from '../components/Marca'
import { IconeMarca } from '../components/Cabecalho'
import { siInstagram, siWhatsapp } from '../components/iconesMarca'
import { DIFERENCIAIS, FUNDADORA, HISTORIA, MARCOS } from '../data/historia'
import { CONTATO, linkWhatsapp } from '../config'
import './nossa-historia.css'

const CAMINHOS = [
  { icone: ShoppingBag, titulo: 'Comprar', texto: 'Peças únicas, selecionadas e com preço justo.', link: '/comprar', acao: 'Ver as peças' },
  { icone: Repeat, titulo: 'Consignar', texto: 'Suas peças paradas viram renda: 50% de cada venda é seu.', link: '/consigne', acao: 'Quero consignar' },
  { icone: Handshake, titulo: 'Ser parceira', texto: 'Lojas e empreendedoras podem expor peças pelo mesmo modelo.', link: '/consigne', acao: 'Saber mais' },
  { icone: Sparkles, titulo: 'Mala Atalia', texto: 'Uma seleção feita para você experimentar com calma. Em breve.', link: '/avise-me?origem=mala', acao: 'Quero saber quando' },
]

export default function NossaHistoria() {
  useEffect(() => {
    document.title = 'Nossa história · Atalia Brechó'
  }, [])

  return (
    <main id="conteudo" className="nh">
      {/* ---------- Abertura ---------- */}
      <section className="conteiner nh-abertura" aria-labelledby="nh-titulo">
        <figure className="nh-abertura__foto">
          <img src={FUNDADORA.fotoRetrato} alt={`${FUNDADORA.nome}, fundadora da Atalia Brechó`} fetchPriority="high" />
          <figcaption>
            <strong>{FUNDADORA.nome}</strong>
            <span>{FUNDADORA.papel}</span>
          </figcaption>
        </figure>
        <div className="nh-abertura__texto">
          <h1 id="nh-titulo" className="titulo">
            Nossa <em>história</em>
          </h1>
          <p className="nh-abertura__lead">{HISTORIA.abertura}</p>
          <ol className="nh-marcos" aria-label="Marcos da trajetória">
            {MARCOS.map((m) => (
              <li key={m.quando}>
                <strong>{m.quando}</strong>
                <span>{m.oque}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Trajetória e propósito ---------- */}
      <section className="conteiner nh-bloco" aria-labelledby="nh-trajetoria">
        <div className="nh-bloco__texto">
          <h2 id="nh-trajetoria" className="titulo">
            Da Biologia à moda circular
          </h2>
          {HISTORIA.trajetoria.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <h2 className="titulo nh-bloco__subtitulo">Mais do que um brechó</h2>
          {HISTORIA.proposito.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <figure className="nh-bloco__foto revelar">
          <img src={FUNDADORA.fotoTrabalho} alt={`${FUNDADORA.nome} trabalhando`} loading="lazy" />
        </figure>
      </section>

      {/* ---------- O nome ---------- */}
      <section className="conteiner nh-nome" aria-labelledby="nh-nome-titulo">
        <Simbolo className="nh-nome__simbolo" />
        <h2 id="nh-nome-titulo" className="titulo">
          Atalia: <em>“Deus é Exaltado”</em>
        </h2>
        <p>{HISTORIA.nome}</p>
      </section>

      {/* ---------- Diferenciais ---------- */}
      <section className="conteiner nh-secao" aria-labelledby="nh-dif-titulo">
        <div className="secao-topo">
          <h2 id="nh-dif-titulo" className="titulo">
            O que a Atalia defende
          </h2>
        </div>
        <ol className="nh__diferenciais">
          {DIFERENCIAIS.map((d, i) => (
            <li key={d.titulo}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Hoje ---------- */}
      <section className="conteiner nh-hoje" aria-labelledby="nh-hoje-titulo">
        <figure className="nh-hoje__foto">
          <img src={FUNDADORA.fotoSacolas} alt="Sacolas de papel kraft com a marca Atalia Brechó" loading="lazy" />
        </figure>
        <div className="nh-hoje__texto">
          <h2 id="nh-hoje-titulo" className="titulo">
            A Atalia hoje
          </h2>
          <p>{HISTORIA.hoje}</p>
          <p className="nh-hoje__assinatura">{HISTORIA.assinatura}</p>
        </div>
      </section>

      {/* ---------- Como fazer parte ---------- */}
      <section className="conteiner nh-secao" aria-labelledby="nh-caminhos-titulo">
        <div className="secao-topo">
          <h2 id="nh-caminhos-titulo" className="titulo">
            Como fazer parte
          </h2>
        </div>
        <ul className="nh__caminhos">
          {CAMINHOS.map(({ icone: Icone, titulo, texto, link, acao }) => (
            <li key={titulo}>
              <Icone size={24} strokeWidth={1.7} aria-hidden="true" />
              <h3>{titulo}</h3>
              <p>{texto}</p>
              <Link to={link} className="link-seta" viewTransition>
                {acao}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Contato ---------- */}
      <section className="conteiner nh-secao" aria-labelledby="nh-contato-titulo">
        <div className="nh__contato">
          <h2 id="nh-contato-titulo" className="titulo">
            Vamos conversar?
          </h2>
          <p>Tire dúvidas, peça uma peça no seu tamanho ou só diga oi. A gente responde pelo WhatsApp e pelo Instagram.</p>
          <div className="nh__contato-acoes">
            <a className="botao botao--claro" href={linkWhatsapp('Oi, Wirlla! Vim pela página da história da Atalia.')} target="_blank" rel="noreferrer">
              <IconeMarca icone={siWhatsapp} tamanho={18} /> WhatsApp
            </a>
            <a className="botao botao--claro" href={CONTATO.instagram} target="_blank" rel="noreferrer">
              <IconeMarca icone={siInstagram} tamanho={18} /> {CONTATO.instagramUsuario}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
