import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { siInstagram } from '../components/iconesMarca'
import Provador from '../features/provador/Provador'
import Arara from '../features/arara/Arara'
import { IconeMarca } from '../components/Cabecalho'
import { Simbolo } from '../components/Marca'
import { CATEGORIAS, PECAS_DEMO } from '../data/pecasDemo'
import { LOOKS } from '../data/looks'
import { CONTATO } from '../config'
import './inicio.css'

const NOVIDADES = [...PECAS_DEMO]
  .filter((p) => p.status !== 'vendida')
  .sort((a, b) => b.chegouEm.localeCompare(a.chegouEm))
  .slice(0, 10)

const PASSOS = [
  ['Escolha', 'Cada peça tem foto real, medidas e código. Gostou? Leve antes que outra pessoa leve.'],
  ['Pague', 'Pix, cartão ou boleto pelo Mercado Pago. Enquanto você paga, a peça fica reservada.'],
  ['Receba', 'Retire sem custo em um ponto combinado ou receba por Uber, com o valor da corrida combinado no WhatsApp.'],
]

export default function Inicio() {
  useEffect(() => {
    document.title = 'Atalia Brechó · Moda com propósito'
  }, [])

  const [primeiro, ...demais] = LOOKS

  return (
    <main id="conteudo" className="inicio">
      {/* ---------- Abertura: a primeira cortina se abre sozinha ---------- */}
      <section className="abertura" aria-label="Abertura">
        <Provador
          look={primeiro}
          numero={1}
          total={LOOKS.length}
          modo="abertura"
          chamada={
            <>
              <h1 className="titulo">
                O novo nem sempre precisa ser <em>novo</em>.
              </h1>
              <p>Peças únicas de segunda mão, escolhidas uma a uma em Paulista, PE. Role a página e entre nos provadores.</p>
            </>
          }
        />
      </section>

      {/* ---------- Provadores: cada cortina abre com a rolagem ---------- */}
      <section className="provadores" aria-labelledby="provadores-titulo">
        <header className="conteiner provadores__topo revelar">
          <h2 id="provadores-titulo" className="titulo">
            Entre nos <em>provadores</em>
          </h2>
          <p>
            Role para abrir cada cortina. A modelo é uma simulação feita por IA; no espelho está a peça real, do jeito que
            ela chega até você.
          </p>
        </header>
        {demais.map((look, i) => (
          <Provador key={look.id} look={look} numero={i + 2} total={LOOKS.length} modo="rolagem" />
        ))}
      </section>

      {/* ---------- Arara de novidades ---------- */}
      <section className="novidades" aria-labelledby="novidades-titulo">
        <div className="conteiner novidades__topo revelar">
          <h2 id="novidades-titulo" className="titulo">
            Recém-chegadas na <em>arara</em>
          </h2>
          <Link to="/comprar" className="link-seta" viewTransition>
            Ver todas as peças <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
        <Arara pecas={NOVIDADES} rotulo="Peças recém-chegadas. Role para o lado para ver mais." />
      </section>

      {/* ---------- Categorias com as próprias peças ---------- */}
      <section className="indice conteiner" aria-labelledby="indice-titulo">
        <h2 id="indice-titulo" className="titulo revelar">
          Procure por
        </h2>
        <ul className="indice__lista">
          {CATEGORIAS.map((c) => {
            const amostras = PECAS_DEMO.filter((p) => p.categoria === c.slug && p.status !== 'vendida').slice(0, 3)
            return (
              <li key={c.slug} className="revelar">
                <Link to={`/comprar?categoria=${c.slug}`} viewTransition>
                  <span className="indice__nome">{c.nome}</span>
                  <span className="indice__amostras" aria-hidden="true">
                    {amostras.map((p) => (
                      <img key={p.id} src={p.recorte} alt="" loading="lazy" />
                    ))}
                  </span>
                  <ArrowRight className="indice__seta" size={26} strokeWidth={1.3} aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ---------- Como comprar ---------- */}
      <section className="passos conteiner" aria-labelledby="passos-titulo">
        <h2 id="passos-titulo" className="titulo revelar">
          Do provador <em>para casa</em>
        </h2>
        <ol className="passos__lista">
          {PASSOS.map(([titulo, texto], i) => (
            <li key={titulo} className="revelar" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="passos__numero titulo" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Consignação: uma cortina inteira ---------- */}
      <section className="consigne" aria-labelledby="consigne-titulo">
        <div className="conteiner consigne__grade">
          <div className="revelar">
            <h2 id="consigne-titulo" className="titulo">
              Seu guarda-roupa pode ganhar <em>outra história</em>.
            </h2>
            <p className="consigne__texto">
              Deixe com a Atalia as peças que você não usa mais: a gente expõe, divulga e vende. Vale para quem quer
              desapegar e também para lojas e empreendedoras que querem ser parceiras.
            </p>
            <div className="consigne__acoes">
              <Link to="/consigne" className="botao botao--claro" viewTransition>
                Quero consignar
              </Link>
              <Link to="/politicas#consignacao" className="consigne__termos" viewTransition>
                Ler os termos
              </Link>
            </div>
          </div>
          <dl className="consigne__termos-lista revelar">
            <div>
              <dt className="titulo">50%</dt>
              <dd>do valor de cada peça vendida fica com você.</dd>
            </div>
            <div>
              <dt className="titulo">60 dias</dt>
              <dd>de exposição para cada peça.</dd>
            </div>
            <div>
              <dt className="titulo">7 dias úteis</dt>
              <dd>no máximo para o repasse depois da venda.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="insta" aria-labelledby="insta-titulo">
        <div className="conteiner">
          <h2 id="insta-titulo" className="insta__chamada revelar">
            Acompanhe a Atalia no Instagram
          </h2>
          <a className="insta__usuario titulo revelar" href={CONTATO.instagram} target="_blank" rel="noreferrer">
            <IconeMarca icone={siInstagram} tamanho={48} />
            <span>
              <em>@</em>ataliabrecho
            </span>
          </a>
          <div className="insta__rodape revelar">
            <p>Peças novas, looks e novidades do brechó. Siga e não perca a próxima peça no seu tamanho.</p>
            <a className="botao" href={CONTATO.instagram} target="_blank" rel="noreferrer">
              Seguir no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Avise-me ---------- */}
      <section className="aviso-tamanho conteiner" aria-labelledby="aviso-titulo">
        <div className="aviso-tamanho__etiqueta revelar">
          <h2 id="aviso-titulo" className="titulo">
            Não achou no seu <em>tamanho</em>?
          </h2>
          <p>Peça de brechó não repete. Deixe seu WhatsApp e seus tamanhos e a gente te chama quando chegar algo para você.</p>
          <Link to="/avise-me?origem=inicio" className="botao" viewTransition>
            Quero ser avisada
          </Link>
        </div>
      </section>

      {/* ---------- Propósito ---------- */}
      <section className="proposito conteiner" aria-labelledby="proposito-titulo">
        <Simbolo className="proposito__simbolo revelar" />
        <div className="revelar">
          <h2 id="proposito-titulo" className="titulo">
            Moda com <em>propósito</em>.
          </h2>
          <p>
            A Atalia Brechó foi criada por Wirlla Dantas, bióloga e empreendedora, para prolongar a vida das roupas e
            tornar o consumo consciente acessível. Cada peça pode ganhar uma nova história.
          </p>
          <Link to="/nossa-historia" className="link-seta" viewTransition>
            Conheça nossa história <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
