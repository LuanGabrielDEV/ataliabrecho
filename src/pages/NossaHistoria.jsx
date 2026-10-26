import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Handshake, Repeat, ShoppingBag, Sparkles } from 'lucide-react'
import { Simbolo } from '../components/Marca'
import { IconeMarca } from '../components/Cabecalho'
import { siInstagram, siWhatsapp } from '../components/iconesMarca'
import { DIFERENCIAIS, FUNDADORA, HISTORIA } from '../data/historia'
import { CONTATO, linkWhatsapp } from '../config'
import './inicio.css'
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
      <section className="conteiner secao" aria-labelledby="nh-titulo">
        <div className="historia">
          <figure className="historia__retrato">
            {FUNDADORA.foto ? (
              <img src={FUNDADORA.foto} alt={`${FUNDADORA.nome}, criadora da Atalia Brechó`} />
            ) : (
              <div className="historia__marca" aria-hidden="true">
                <Simbolo />
              </div>
            )}
            <blockquote className="historia__frase">
              <p>“{FUNDADORA.frase}”</p>
              <footer>
                <strong>{FUNDADORA.nome}</strong>
                <span>{FUNDADORA.papel}</span>
              </footer>
            </blockquote>
          </figure>
          <div className="historia__texto">
            <h1 id="nh-titulo" className="titulo">
              {HISTORIA.titulo}
            </h1>
            <p className="historia__resumo">{HISTORIA.resumo}</p>
            <div className="nh__texto">
              {HISTORIA.paragrafos.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="conteiner secao" aria-labelledby="nh-dif-titulo">
        <div className="secao-topo">
          <h2 id="nh-dif-titulo" className="titulo">
            O que faz a Atalia ser diferente
          </h2>
        </div>
        <ol className="nh__diferenciais">
          {DIFERENCIAIS.map((d, i) => (
            <li key={d.titulo} className="revelar" style={{ transitionDelay: `${i * 80}ms` }}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="conteiner secao" aria-labelledby="nh-caminhos-titulo">
        <div className="secao-topo">
          <h2 id="nh-caminhos-titulo" className="titulo">
            Como fazer parte
          </h2>
        </div>
        <ul className="nh__caminhos">
          {CAMINHOS.map(({ icone: Icone, titulo, texto, link, acao }) => (
            <li key={titulo} className="revelar">
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

      <section className="conteiner secao" aria-labelledby="nh-contato-titulo">
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
