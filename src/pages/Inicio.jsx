import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Cordao from '../features/cordel/Cordao'
import { Simbolo } from '../components/Marca'
import { CATEGORIAS, PECAS_DEMO } from '../data/pecasDemo'
import { siInstagram } from 'simple-icons'
import { IconeMarca } from '../components/Cabecalho'
import { CONTATO } from '../config'
import './inicio.css'

const PASSOS = [
  {
    titulo: 'Escolha a peça',
    texto: 'Cada peça tem foto real, código e tamanho. Gostou? Põe na sacola antes que outra pessoa leve.',
  },
  {
    titulo: 'Pague pelo site',
    texto: 'Pix, cartão ou boleto pelo Mercado Pago. Enquanto você paga, a peça fica reservada para você.',
  },
  {
    titulo: 'Retire ou receba',
    texto: 'Retire sem custo em um ponto combinado ou receba por Uber, com o valor da corrida combinado pelo WhatsApp.',
  },
]

export default function Inicio() {
  useEffect(() => {
    document.title = 'Atalia Brechó · Moda com propósito'
  }, [])

  return (
    <main id="conteudo">
      {/* ---------- Abertura: título + cordão de peças ---------- */}
      <section className="abertura" aria-labelledby="abertura-titulo">
        <div className="conteiner abertura__texto">
          <h1 id="abertura-titulo">O novo nem sempre precisa ser novo.</h1>
          <p>
            Roupas e acessórios de segunda mão, escolhidos peça por peça em Paulista, PE. Cada uma é única: quando sai,
            não volta.
          </p>
        </div>

        <div className="abertura__vitrine">
          <div className="conteiner abertura__legenda">
            <h2>Acabaram de chegar</h2>
            <Link to="/comprar" className="link-seta">
              Ver todas as peças <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
          <Cordao pecas={PECAS_DEMO.slice(0, 8)} rotulo="Peças que acabaram de chegar. Role para o lado para ver mais." />
        </div>
      </section>

      {/* ---------- Como comprar ---------- */}
      <section className="folheto conteiner" aria-labelledby="como-titulo">
        <h2 id="como-titulo" className="titulo-secao">Como funciona a compra</h2>
        <ol className="folheto__passos">
          {PASSOS.map((p, i) => (
            <li key={p.titulo}>
              <span className="folheto__numero" aria-hidden="true">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Índice de categorias ---------- */}
      <section className="indice conteiner" aria-labelledby="indice-titulo">
        <h2 id="indice-titulo" className="titulo-secao">Procure por</h2>
        <ul className="indice__lista">
          {CATEGORIAS.map((c) => (
            <li key={c.slug}>
              <Link to={`/comprar?categoria=${c.slug}`}>
                <span>{c.nome}</span>
                <ArrowRight size={28} strokeWidth={1.4} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Consignação (segunda tinta: oliva) ---------- */}
      <section className="consigne" aria-labelledby="consigne-titulo">
        <div className="conteiner consigne__grade">
          <div>
            <h2 id="consigne-titulo">Seu guarda-roupa pode ganhar outra história.</h2>
            <p className="consigne__texto">
              Deixe com a Atalia as peças que você não usa mais: a gente expõe, divulga e vende. Vale para quem quer
              desapegar e também para lojas e empreendedoras que querem ser parceiras.
            </p>
            <div className="consigne__acoes">
              <Link to="/consigne" className="botao botao--papel">Quero consignar</Link>
              <Link to="/politicas#consignacao" className="consigne__termos">Ler os termos</Link>
            </div>
          </div>
          <dl className="consigne__termos-lista">
            <div>
              <dt>50%</dt>
              <dd>do valor de cada peça vendida fica com você.</dd>
            </div>
            <div>
              <dt>60 dias</dt>
              <dd>de exposição para cada peça.</dd>
            </div>
            <div>
              <dt>7 dias úteis</dt>
              <dd>no máximo para o repasse depois da venda.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------- Avise-me ---------- */}
      <section className="aviso-tamanho conteiner" aria-labelledby="aviso-titulo">
        <div className="aviso-tamanho__etiqueta">
          <h2 id="aviso-titulo">Não achou no seu tamanho?</h2>
          <p>Peça de brechó não repete. Deixe seu WhatsApp e seus tamanhos e a gente te chama quando chegar algo para você.</p>
          <Link to="/avise-me?origem=inicio" className="botao">Quero ser avisada</Link>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="insta" aria-labelledby="insta-titulo">
        <div className="conteiner">
          <h2 id="insta-titulo" className="insta__chamada">Acompanhe a Atalia no Instagram</h2>
          <a className="insta__usuario" href={CONTATO.instagram} target="_blank" rel="noreferrer">
            <IconeMarca icone={siInstagram} tamanho={48} />
            <span>{CONTATO.instagramUsuario}</span>
          </a>
          <p className="insta__texto">Peças novas, looks e novidades do brechó. Siga e não perca a próxima peça no seu tamanho.</p>
          <a className="botao" href={CONTATO.instagram} target="_blank" rel="noreferrer">
            Seguir no Instagram
          </a>
        </div>
      </section>

      {/* ---------- Propósito ---------- */}
      <section className="proposito conteiner" aria-labelledby="proposito-titulo">
        <Simbolo className="proposito__simbolo" />
        <div>
          <h2 id="proposito-titulo">Moda com propósito.</h2>
          <p>
            A Atalia Brechó foi criada por Wirlla Dantas, bióloga e empreendedora, para prolongar a vida das roupas e
            tornar o consumo consciente acessível. Cada peça pode ganhar uma nova história.
          </p>
          <Link to="/nossa-historia" className="link-seta">
            Conheça nossa história <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
