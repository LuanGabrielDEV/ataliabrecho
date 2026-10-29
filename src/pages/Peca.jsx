import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { siWhatsapp } from '../components/iconesMarca'
import CardPeca from '../features/catalogo/CardPeca'
import '../features/catalogo/card-peca.css'
import BotaoLevar from '../features/sacola/BotaoLevar'
import { IconeMarca } from '../components/Cabecalho'
import { CATEGORIAS, CONDICOES } from '../data/pecasDemo'
import { useCatalogo } from '../data/catalogoBase'
import { formatarPreco, linkWhatsapp } from '../config'
import './peca.css'

export default function Peca() {
  const { id } = useParams()
  const { pecas, buscar, carregando } = useCatalogo()
  const peca = buscar(id)
  const recorteRef = useRef(null)
  const [vista, setVista] = useState('peca')

  useEffect(() => {
    document.title = peca ? `${peca.titulo} · Atalia Brechó` : 'Peça não encontrada · Atalia Brechó'
  }, [peca])

  if (!peca && carregando) {
    return (
      <main id="conteudo" className="em-breve conteiner">
        <p>Carregando a peça…</p>
      </main>
    )
  }

  if (!peca) {
    return (
      <main id="conteudo" className="em-breve conteiner">
        <h1>Essa peça não está mais aqui.</h1>
        <p>Pode ter sido vendida ou retirada do site.</p>
        <Link to="/comprar" className="botao" viewTransition>
          Ver as peças disponíveis
        </Link>
      </main>
    )
  }

  const categoria = CATEGORIAS.find((c) => c.slug === peca.categoria)
  const condicao = CONDICOES[peca.condicao]
  const parecidas = pecas.filter((p) => p.id !== peca.id && p.categoria === peca.categoria && p.status !== 'vendida').slice(0, 8)
  const STATUS = { vendida: 'Vendida', reservada: 'Reservada' }

  return (
    <main id="conteudo" className="peca-pagina">
      <div className="conteiner">
        <nav className="peca-pagina__trilha" aria-label="Você está em">
          <Link to={`/comprar?categoria=${peca.categoria}`} viewTransition>
            <ChevronLeft size={18} strokeWidth={1.8} aria-hidden="true" /> {categoria?.nome}
          </Link>
        </nav>

        <div className="peca-pagina__grade">
          <div className="peca-pagina__vitrine" data-status={peca.status}>
            <figure className="peca-pagina__foto" data-vista={vista}>
              {vista === 'peca' && (
                <img ref={recorteRef} src={peca.recorte || peca.foto} alt={`${peca.titulo}, foto real da peça sem o fundo`} fetchPriority="high" />
              )}
              {vista === 'original' && (
                <img src={peca.foto} alt={`${peca.titulo}, foto original da peça no manequim`} width="720" height="960" />
              )}
              {vista === 'look' && peca.fotoIa && (
                <>
                  <img src={peca.fotoIa} alt={`Modelo gerada por IA vestindo ${peca.titulo.toLowerCase()}`} />
                </>
              )}
              {STATUS[peca.status] && <span className="peca-pagina__status-selo">{STATUS[peca.status]}</span>}
            </figure>

            <div className="peca-pagina__vistas" role="group" aria-label="Escolher foto">
              <button type="button" aria-pressed={vista === 'peca'} onClick={() => setVista('peca')}>
                A peça
              </button>
              <button type="button" aria-pressed={vista === 'original'} onClick={() => setVista('original')}>
                Foto original
              </button>
              {peca.fotoIa && (
                <button type="button" aria-pressed={vista === 'look'} onClick={() => setVista('look')}>
                  No corpo (IA)
                </button>
              )}
            </div>
          </div>

          <div className="peca-pagina__ficha">
            <p className="peca-pagina__codigo">
              #{peca.codigo} <span aria-hidden="true">·</span> {categoria?.nome}
            </p>
            <h1 className="titulo">{peca.titulo}</h1>
            <p className="peca-pagina__preco">{formatarPreco(peca.preco)}</p>

            {peca.status === 'reservada' && (
              <p className="peca-pagina__aviso">
                Alguém está finalizando a compra desta peça. Se o pagamento não for concluído, ela volta para o site.
              </p>
            )}
            {peca.status === 'vendida' && (
              <p className="peca-pagina__aviso">Esta peça já ganhou uma nova história com outra pessoa.</p>
            )}

            <div className="peca-pagina__acoes">
              {peca.status === 'disponivel' ? (
                <BotaoLevar peca={peca} imagemRef={recorteRef} className="peca-pagina__levar" />
              ) : (
                <Link to={`/avise-me?origem=peca-${peca.status}`} className="botao" viewTransition>
                  Avise-me de peças parecidas
                </Link>
              )}
              <a
                className="botao botao--vazado"
                href={linkWhatsapp(`Oi, Atalia! Tenho uma dúvida sobre a peça #${peca.codigo} (${peca.titulo}, tam. ${peca.tamanho}).`)}
                target="_blank"
                rel="noreferrer"
              >
                <IconeMarca icone={siWhatsapp} tamanho={18} /> Tirar dúvida
              </a>
            </div>

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
            <div className="secao-topo">
              <h2 id="parecidas-titulo" className="titulo">
                Você também pode gostar
              </h2>
            </div>
            <ul className="grade-pecas grade-pecas--4">
              {parecidas.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <CardPeca peca={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
