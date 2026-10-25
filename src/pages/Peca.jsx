import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'
import { siWhatsapp } from 'simple-icons'
import Cordao from '../features/cordel/Cordao'
import { IconeMarca } from '../components/Cabecalho'
import { useSacola } from '../features/sacola/Sacola'
import { CATEGORIAS, CONDICOES, PECAS_DEMO, buscarPeca } from '../data/pecasDemo'
import { formatarPreco, linkWhatsapp } from '../config'
import '../features/cordel/cordel.css'
import './peca.css'

const NOMES_MEDIDAS = {
  busto: 'Busto',
  cintura: 'Cintura',
  quadril: 'Quadril',
  ombro: 'Ombro a ombro',
  manga: 'Manga',
  comprimento: 'Comprimento',
}

export default function Peca() {
  const { id } = useParams()
  const peca = buscarPeca(id)
  const { tem, adicionar } = useSacola()

  useEffect(() => {
    document.title = peca ? `${peca.titulo} · Atalia Brechó` : 'Peça não encontrada · Atalia Brechó'
  }, [peca])

  if (!peca) {
    return (
      <main id="conteudo" className="em-breve conteiner">
        <h1>Essa peça não está mais aqui.</h1>
        <p>Pode ter sido vendida ou retirada do site.</p>
        <Link to="/comprar" className="botao">Ver as peças disponíveis</Link>
      </main>
    )
  }

  const categoria = CATEGORIAS.find((c) => c.slug === peca.categoria)
  const condicao = CONDICOES[peca.condicao]
  const naSacola = tem(peca.id)
  const disponivel = peca.status === 'disponivel'
  const parecidas = PECAS_DEMO.filter((p) => p.id !== peca.id && p.categoria === peca.categoria && p.status !== 'vendida').slice(0, 8)
  const medidas = peca.medidas ? Object.entries(NOMES_MEDIDAS).filter(([k]) => peca.medidas[k]) : []

  return (
    <main id="conteudo" className="peca-pagina">
      <div className="conteiner">
        <nav className="peca-pagina__trilha" aria-label="Você está em">
          <Link to={`/comprar?categoria=${peca.categoria}`}>
            <ChevronLeft size={18} strokeWidth={1.8} aria-hidden="true" /> {categoria?.nome}
          </Link>
        </nav>

        <div className="peca-pagina__grade">
          <figure className="peca-pagina__foto" data-status={peca.status}>
            <svg className="peca-pagina__prendedor" viewBox="0 0 22 46" aria-hidden="true">
              <rect x="2" y="1" width="8" height="44" rx="3" />
              <rect x="12" y="1" width="8" height="44" rx="3" />
              <circle cx="11" cy="20" r="4.2" />
            </svg>
            <img src={peca.foto} alt={`${peca.titulo}, foto real da peça no manequim`} width="720" height="960" fetchPriority="high" />
            {peca.status !== 'disponivel' && (
              <span className="carimbo carimbo--batido">{peca.status === 'vendida' ? 'Vendida' : 'Reservada'}</span>
            )}
            <figcaption>Foto real da peça.</figcaption>
          </figure>

          <div className="peca-pagina__ficha">
            <p className="peca-pagina__codigo">#{peca.codigo}</p>
            <h1>{peca.titulo}</h1>
            <p className="peca-pagina__preco">{formatarPreco(peca.preco)}</p>

            {peca.status === 'reservada' && (
              <p className="peca-pagina__status">
                Alguém está finalizando a compra desta peça. Se o pagamento não for concluído, ela volta para o site.
              </p>
            )}
            {peca.status === 'vendida' && (
              <p className="peca-pagina__status">Esta peça já ganhou uma nova história com outra pessoa.</p>
            )}

            <dl className="peca-pagina__dados">
              <div>
                <dt>Tamanho</dt>
                <dd>{peca.tamanho}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  {condicao.nome}
                  <span>{condicao.descricao}</span>
                </dd>
              </div>
              {peca.tecido && (
                <div>
                  <dt>Tecido</dt>
                  <dd>{peca.tecido}</dd>
                </div>
              )}
              {peca.observacao && (
                <div>
                  <dt>Detalhe</dt>
                  <dd>{peca.observacao}</dd>
                </div>
              )}
            </dl>

            {medidas.length > 0 && (
              <section className="peca-pagina__medidas" aria-labelledby="medidas-titulo">
                <h2 id="medidas-titulo">Medidas</h2>
                <table>
                  <caption className="sr-only">Medidas da peça em centímetros</caption>
                  <tbody>
                    {medidas.map(([k, nome]) => (
                      <tr key={k}>
                        <th scope="row">{nome}</th>
                        <td>{peca.medidas[k]} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>Compare com uma peça sua que veste bem. Na dúvida, chame no WhatsApp.</p>
              </section>
            )}

            <div className="peca-pagina__acoes">
              {disponivel ? (
                <button
                  type="button"
                  className={`botao${naSacola ? ' botao--vazado' : ''}`}
                  aria-pressed={naSacola}
                  onClick={() => !naSacola && adicionar(peca)}
                >
                  {naSacola && <Check size={18} strokeWidth={2.2} aria-hidden="true" />}
                  {naSacola ? 'Está na sacola' : 'Pôr na sacola'}
                </button>
              ) : (
                <Link to={`/avise-me?origem=peca-${peca.status}`} className="botao">
                  Avise-me de peças parecidas
                </Link>
              )}
              {naSacola && <Link to="/sacola" className="link-seta">Ir para a sacola</Link>}
              <a
                className="botao botao--vazado"
                href={linkWhatsapp(`Oi, Atalia! Tenho uma dúvida sobre a peça #${peca.codigo} (${peca.titulo}, tam. ${peca.tamanho}).`)}
                target="_blank"
                rel="noreferrer"
              >
                <IconeMarca icone={siWhatsapp} tamanho={18} /> Tirar dúvida no WhatsApp
              </a>
            </div>

            <p className="peca-pagina__entrega">
              <strong>Entrega:</strong> retirada sem custo em ponto combinado, ou por Uber em Paulista e região, com o
              valor da corrida combinado pelo WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {parecidas.length > 0 && (
        <section className="peca-pagina__parecidas" aria-labelledby="parecidas-titulo">
          <div className="conteiner">
            <h2 id="parecidas-titulo">Mais {categoria?.nome.toLowerCase()}</h2>
          </div>
          <Cordao pecas={parecidas} rotulo={`Mais ${categoria?.nome}. Role para o lado para ver mais.`} />
        </section>
      )}
    </main>
  )
}
