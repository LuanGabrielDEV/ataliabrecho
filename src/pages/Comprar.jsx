import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import PecaNoCabide from '../features/arara/PecaNoCabide'
import { CATEGORIAS, CONDICOES, CORES, PECAS_DEMO } from '../data/pecasDemo'
import {
  FAIXAS_PRECO,
  ORDENS,
  aplicarFiltros,
  contarFiltrosAtivos,
  escreverFiltros,
  lerFiltros,
  tamanhosDisponiveis,
} from '../features/catalogo/filtros'
import './comprar.css'

const alternar = (lista, v) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v])

function Filtros({ filtros, mudar, limpar, tamanhos, id }) {
  return (
    <div className="filtros__grupos">
      <fieldset className="filtros__grupo">
        <legend>Tamanho</legend>
        <div className="filtros__chips">
          {tamanhos.map((t) => (
            <label key={t} className="am-chip">
              <input type="checkbox" checked={filtros.tamanhos.includes(t)} onChange={() => mudar({ tamanhos: alternar(filtros.tamanhos, t) })} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filtros__grupo">
        <legend>Cor</legend>
        <div className="filtros__cores">
          {CORES.map((c) => (
            <label key={c.slug} className="filtros__cor">
              <input type="checkbox" checked={filtros.cores.includes(c.slug)} onChange={() => mudar({ cores: alternar(filtros.cores, c.slug) })} />
              <span className="filtros__amostra" style={c.hex ? { background: c.hex } : undefined} data-estampado={!c.hex || undefined} aria-hidden="true" />
              <span>{c.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filtros__grupo">
        <legend>Estado da peça</legend>
        {Object.entries(CONDICOES).map(([slug, c]) => (
          <label key={slug} className="filtros__linha">
            <input type="checkbox" checked={filtros.condicoes.includes(slug)} onChange={() => mudar({ condicoes: alternar(filtros.condicoes, slug) })} />
            <span>{c.nome}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filtros__grupo">
        <legend>Preço</legend>
        <label className="filtros__linha">
          <input type="radio" name={`${id}-preco`} checked={!filtros.preco} onChange={() => mudar({ preco: '' })} />
          <span>Qualquer preço</span>
        </label>
        {FAIXAS_PRECO.map((f) => (
          <label key={f.slug} className="filtros__linha">
            <input type="radio" name={`${id}-preco`} checked={filtros.preco === f.slug} onChange={() => mudar({ preco: f.slug })} />
            <span>{f.nome}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filtros__grupo">
        <legend className="sr-only">Peças vendidas</legend>
        <label className="filtros__linha">
          <input type="checkbox" checked={filtros.vendidas} onChange={() => mudar({ vendidas: !filtros.vendidas })} />
          <span>Mostrar também as já vendidas</span>
        </label>
      </fieldset>

      {contarFiltrosAtivos(filtros) > 0 && (
        <button type="button" className="filtros__limpar" onClick={limpar}>
          Limpar filtros
        </button>
      )}
    </div>
  )
}

export default function Comprar() {
  const id = useId()
  const [params, setParams] = useSearchParams()
  const filtros = useMemo(() => lerFiltros(params), [params])
  const [painelAberto, setPainelAberto] = useState(false)

  const daCategoria = useMemo(
    () => PECAS_DEMO.filter((p) => !filtros.categoria || p.categoria === filtros.categoria),
    [filtros.categoria],
  )
  const pecas = useMemo(() => aplicarFiltros(PECAS_DEMO, filtros), [filtros])
  const tamanhos = useMemo(() => tamanhosDisponiveis(daCategoria), [daCategoria])
  const categoria = CATEGORIAS.find((c) => c.slug === filtros.categoria)
  const ativos = contarFiltrosAtivos(filtros)

  const mudar = (parcial) => setParams(escreverFiltros({ ...filtros, ...parcial }), { replace: true })
  const limpar = () => setParams(escreverFiltros({ ...lerFiltros(new URLSearchParams()), categoria: filtros.categoria, ordem: filtros.ordem }), { replace: true })

  useEffect(() => {
    document.title = `${categoria ? categoria.nome : 'Comprar peças'} · Atalia Brechó`
  }, [categoria])

  const disponiveis = pecas.filter((p) => p.status === 'disponivel').length

  return (
    <main id="conteudo" className="comprar">
      <div className="conteiner">
        <header className="comprar__topo">
          <h1 className="titulo">{categoria ? categoria.nome : 'Comprar peças'}</h1>
          <p>
            {disponiveis} {disponiveis === 1 ? 'peça disponível' : 'peças disponíveis'}. Cada uma é única.
          </p>
        </header>

        <nav className="comprar__categorias" aria-label="Categorias">
          <ul>
            <li>
              <Link to="/comprar" viewTransition aria-current={!filtros.categoria ? 'page' : undefined}>Todas</Link>
            </li>
            {CATEGORIAS.map((c) => (
              <li key={c.slug}>
                <Link to={`/comprar?categoria=${c.slug}`} aria-current={filtros.categoria === c.slug ? 'page' : undefined}>
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="comprar__barra">
          <button
            type="button"
            className="comprar__filtrar"
            aria-expanded={painelAberto}
            aria-controls={`${id}-filtros`}
            onClick={() => setPainelAberto((a) => !a)}
          >
            <SlidersHorizontal size={18} strokeWidth={1.7} aria-hidden="true" />
            Filtrar{ativos > 0 && ` (${ativos})`}
          </button>
          <label className="comprar__ordem">
            <span>Ordenar</span>
            <select value={filtros.ordem} onChange={(e) => mudar({ ordem: e.target.value })}>
              {ORDENS.map((o) => (
                <option key={o.slug} value={o.slug}>{o.nome}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="comprar__corpo">
          <aside className={`filtros${painelAberto ? ' filtros--aberto' : ''}`} id={`${id}-filtros`} aria-label="Filtros">
            <div className="filtros__cabeca">
              <h2>Filtrar peças</h2>
              <button type="button" className="filtros__fechar" onClick={() => setPainelAberto(false)} aria-label="Fechar filtros">
                <X size={22} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
            <Filtros filtros={filtros} mudar={mudar} limpar={limpar} tamanhos={tamanhos} id={id} />
            <button type="button" className="botao filtros__ver" onClick={() => setPainelAberto(false)}>
              Ver {pecas.length} {pecas.length === 1 ? 'peça' : 'peças'}
            </button>
          </aside>

          <section className="comprar__resultado" aria-live="polite" aria-label="Peças">
            {pecas.length === 0 ? (
              <div className="comprar__vazio">
                <h2>Nenhuma peça com esses filtros agora.</h2>
                <p>Peças novas chegam toda semana. Deixe seu tamanho e a gente te avisa quando chegar algo para você.</p>
                <div className="comprar__vazio-acoes">
                  <Link to="/avise-me?origem=catalogo-vazio" className="botao">Quero ser avisada</Link>
                  {ativos > 0 && (
                    <button type="button" className="botao botao--vazado" onClick={limpar}>Limpar filtros</button>
                  )}
                </div>
              </div>
            ) : (
              <ul className="araras">
                {pecas.map((p, i) => (
                  <li key={p.id} className="araras__item">
                    <PecaNoCabide peca={p} prioridade={i < 4} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
