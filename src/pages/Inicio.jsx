import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Recycle, Shirt, Tag } from 'lucide-react'
import CardPeca from '../features/catalogo/CardPeca'
import { IconeMarca } from '../components/Cabecalho'
import { siInstagram } from '../components/iconesMarca'
import { Simbolo } from '../components/Marca'
import { CATEGORIAS } from '../data/pecasDemo'
import { useCatalogo } from '../data/catalogo'
import { DIFERENCIAIS, FUNDADORA, HISTORIA } from '../data/historia'
import { CONTATO } from '../config'
import '../features/catalogo/card-peca.css'
import './inicio.css'

const VANTAGENS = [
  { icone: Shirt, titulo: 'Peças selecionadas', texto: 'Escolhidas uma a uma, com fotos reais e medidas.' },
  { icone: Tag, titulo: 'Preço justo', texto: 'Moda boa sem pagar preço de loja.' },
  { icone: MapPin, titulo: 'Retirada grátis', texto: 'Em Paulista, PE, ou entrega por Uber.' },
  { icone: Recycle, titulo: 'Moda circular', texto: 'Cada peça ganha uma nova história.' },
]

export default function Inicio() {
  useEffect(() => {
    document.title = 'Atalia Brechó · Moda com propósito'
  }, [])

  const { pecas, looks } = useCatalogo()
  const NOVIDADES = pecas.filter((p) => p.status !== 'vendida').slice(0, 8)
  const capa = looks[0]
  const capa2 = looks[1]

  return (
    <main id="conteudo" className="inicio">
      {/* ---------- Banner principal ---------- */}
      <section className="conteiner banner" aria-labelledby="banner-titulo">
        <div className="banner__texto">
          <h1 id="banner-titulo" className="titulo">
            O novo nem sempre precisa ser <em>novo</em>.
          </h1>
          <p>
            Roupas e acessórios de segunda mão, selecionados peça por peça em Paulista, PE. Cada peça é única: quando sai,
            não volta.
          </p>
          <div className="banner__acoes">
            <Link to="/comprar" className="botao" viewTransition>
              Comprar peças
            </Link>
            <Link to="/consigne" className="botao botao--vazado" viewTransition>
              Quero consignar
            </Link>
          </div>
        </div>
        {capa && (
          <div className="banner__fotos">
            <Link to={`/peca/${capa.id}`} className="banner__foto banner__foto--1" viewTransition>
              <img src={capa.fotoIa} alt={`Modelo gerada por IA vestindo ${capa.titulo.toLowerCase()}`} fetchPriority="high" />
              <span className="selo-ia">Simulação por IA</span>
              <span className="banner__etiqueta">
                {capa.titulo} <strong>R$ {capa.preco}</strong>
              </span>
            </Link>
            {capa2 && (
              <Link to={`/peca/${capa2.id}`} className="banner__foto banner__foto--2" viewTransition>
                <img src={capa2.fotoIa} alt={`Modelo gerada por IA vestindo ${capa2.titulo.toLowerCase()}`} />
                <span className="selo-ia">Simulação por IA</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ---------- Categorias ---------- */}
      <section className="conteiner categorias" aria-label="Categorias">
        <ul className="categorias__lista">
          {CATEGORIAS.map((c) => {
            const amostra = pecas.find((p) => p.categoria === c.slug && p.status === 'disponivel')
            return (
              <li key={c.slug}>
                <Link to={`/comprar?categoria=${c.slug}`} viewTransition>
                  <span className="categorias__foto">{amostra && <img src={amostra.recorte || amostra.foto} alt="" loading="lazy" />}</span>
                  <span className="categorias__nome">{c.nome}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ---------- Novidades ---------- */}
      <section className="conteiner secao" aria-labelledby="novidades-titulo">
        <div className="secao-topo">
          <div>
            <h2 id="novidades-titulo" className="titulo">
              Acabaram de chegar
            </h2>
            <p>Peças únicas. Gostou? Garanta antes que outra pessoa leve.</p>
          </div>
          <Link to="/comprar" className="link-seta" viewTransition>
            Ver todas <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <ul className="grade-pecas grade-pecas--4">
          {NOVIDADES.map((p, i) => (
            <li key={p.id} className="revelar" style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
              <CardPeca peca={p} prioridade={i < 4} />
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Vantagens ---------- */}
      <section className="vantagens" aria-label="Por que comprar na Atalia">
        <ul className="conteiner vantagens__lista">
          {VANTAGENS.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo}>
              <Icone size={26} strokeWidth={1.6} aria-hidden="true" />
              <div>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Looks ---------- */}
      {looks.length > 1 && (
      <section className="conteiner secao" aria-labelledby="looks-titulo">
        <div className="secao-topo">
          <div>
            <h2 id="looks-titulo" className="titulo">
              Inspire-se nos looks
            </h2>
            <p>Peças reais do brechó vestidas por uma modelo criada por IA, para você ver o caimento.</p>
          </div>
        </div>
        <ul className="looks">
          {looks.slice(1, 5).map((l) => (
            <li key={l.id} className="revelar">
              <Link to={`/peca/${l.id}`} className="look" viewTransition>
                <span className="look__foto">
                  <img src={l.fotoIa} alt={`Modelo gerada por IA vestindo ${l.titulo.toLowerCase()}`} loading="lazy" />
                  <span className="selo-ia">Simulação por IA</span>
                  <span className="look__peca">
                    <img src={l.recorte || l.foto} alt="" loading="lazy" />
                  </span>
                </span>
                <span className="look__nome">{l.titulo}</span>
                <span className="look__preco">
                  R$ {l.preco} · Tam. {l.tamanho}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* ---------- Quem está por trás ---------- */}
      <section className="conteiner secao" aria-labelledby="historia-titulo">
        <div className="historia">
          <figure className="historia__retrato">
            {FUNDADORA.foto ? (
              <img src={FUNDADORA.foto} alt={`${FUNDADORA.nome}, criadora da Atalia Brechó`} loading="lazy" />
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
            <h2 id="historia-titulo" className="titulo">
              {HISTORIA.titulo}
            </h2>
            <p className="historia__resumo">{HISTORIA.resumo}</p>
            <ul className="historia__diferenciais">
              {DIFERENCIAIS.map((d) => (
                <li key={d.titulo}>
                  <h3>{d.titulo}</h3>
                  <p>{d.texto}</p>
                </li>
              ))}
            </ul>
            <Link to="/nossa-historia" className="botao botao--vazado" viewTransition>
              Conheça a história da Atalia
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Consignação ---------- */}
      <section className="conteiner secao" aria-labelledby="consigne-titulo">
        <div className="consigne">
          <div className="consigne__texto">
            <h2 id="consigne-titulo" className="titulo">
              Desapegue e ganhe com suas roupas
            </h2>
            <p>
              Deixe com a Atalia as peças que você não usa mais. A gente fotografa, expõe e vende, e você recebe metade do
              valor. Vale também para lojas e empreendedoras parceiras.
            </p>
            <div className="consigne__acoes">
              <Link to="/consigne" className="botao botao--claro" viewTransition>
                Quero consignar
              </Link>
              <Link to="/politicas#consignacao" className="consigne__link" viewTransition>
                Ler os termos
              </Link>
            </div>
          </div>
          <ol className="consigne__passos">
            <li>
              <strong>50% para você</strong>
              <span>do valor de cada peça vendida.</span>
            </li>
            <li>
              <strong>60 dias de exposição</strong>
              <span>para cada peça.</span>
            </li>
            <li>
              <strong>Repasse em até 7 dias úteis</strong>
              <span>depois da venda.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="conteiner secao insta" aria-labelledby="insta-titulo">
        <div className="secao-topo">
          <div>
            <h2 id="insta-titulo" className="titulo">
              Siga <em>{CONTATO.instagramUsuario}</em>
            </h2>
            <p>Novidades, looks e peças novas da Atalia. Siga para não perder a próxima no seu tamanho.</p>
          </div>
          <a className="botao" href={CONTATO.instagram} target="_blank" rel="noreferrer">
            <IconeMarca icone={siInstagram} tamanho={18} /> Seguir no Instagram
          </a>
        </div>
        <a className="insta__grade" href={CONTATO.instagram} target="_blank" rel="noreferrer" aria-label={`Abrir o Instagram ${CONTATO.instagramUsuario}`}>
          {[looks[2], NOVIDADES[0], looks[3], NOVIDADES[3], looks[4], NOVIDADES[5]].filter(Boolean).map((x, i) =>
            i % 2 === 0 && x.fotoIa ? (
              <span key={i} className="insta__item insta__item--foto">
                <img src={x.fotoIa} alt="" loading="lazy" />
              </span>
            ) : (
              <span key={i} className="insta__item">
                <img src={x.recorte || x.foto} alt="" loading="lazy" />
              </span>
            ),
          )}
        </a>
      </section>

      {/* ---------- Avise-me ---------- */}
      <section className="conteiner secao" aria-labelledby="aviso-titulo">
        <div className="aviso-faixa">
          <div>
            <h2 id="aviso-titulo" className="titulo">
              Não achou no seu tamanho?
            </h2>
            <p>Deixe seu WhatsApp e seus tamanhos. A gente te avisa quando chegar uma peça para você.</p>
          </div>
          <Link to="/avise-me?origem=inicio" className="botao" viewTransition>
            Quero ser avisada
          </Link>
        </div>
      </section>
    </main>
  )
}
