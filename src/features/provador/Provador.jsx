import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import BotaoLevar from '../sacola/BotaoLevar'
import { formatarPreco } from '../../config'
import './provador.css'

/**
 * Liga a abertura da cortina à rolagem: escreve --p (0 a 1) no elemento,
 * conforme a seção passa pela tela. O CSS deriva o resto.
 */
function useProgressoRolagem(ref, ativo) {
  useEffect(() => {
    const el = ref.current
    if (!el || !ativo) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1')
      return
    }
    let quadro = 0
    const medir = () => {
      quadro = 0
      const r = el.getBoundingClientRect()
      const curso = r.height - innerHeight
      const p = curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 1
      el.style.setProperty('--p', p.toFixed(4))
    }
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    medir()
    addEventListener('scroll', pedir, { passive: true })
    addEventListener('resize', pedir)
    return () => {
      removeEventListener('scroll', pedir)
      removeEventListener('resize', pedir)
      cancelAnimationFrame(quadro)
    }
  }, [ref, ativo])
}

export function Cortinas() {
  return (
    <>
      <span className="cortina cortina--esq" aria-hidden="true" />
      <span className="cortina cortina--dir" aria-hidden="true" />
      <span className="cabine__varao" aria-hidden="true" />
    </>
  )
}

/**
 * Um provador: a modelo (simulação por IA) atrás da cortina e, no espelho,
 * a peça real recortada. modo="abertura" abre sozinho ao carregar;
 * modo="rolagem" abre conforme a pessoa rola.
 */
export default function Provador({ look, numero, total, modo = 'rolagem', chamada }) {
  const ref = useRef(null)
  const recorteRef = useRef(null)
  const { peca } = look
  useProgressoRolagem(ref, modo === 'rolagem')

  useEffect(() => {
    if (modo !== 'abertura') return
    const el = ref.current
    const t = setTimeout(() => el?.setAttribute('data-aberto', ''), 350)
    return () => clearTimeout(t)
  }, [modo])

  return (
    <article ref={ref} className={`provador provador--${modo}`} aria-labelledby={`provador-${look.id}`}>
      <div className="provador__palco">
        {chamada && <div className="provador__chamada">{chamada}</div>}
        <div className="provador__cabine">
          <img
            className="provador__modelo"
            src={look.foto}
            alt={`Modelo gerada por IA vestindo ${peca.titulo.toLowerCase()}`}
            width="960"
            height="1440"
            loading={modo === 'abertura' ? 'eager' : 'lazy'}
            fetchPriority={modo === 'abertura' ? 'high' : undefined}
          />
          <span className="selo-ia provador__selo">Simulação por IA</span>
          <Cortinas />
        </div>

        <figure className="espelho">
          <div className="espelho__vidro">
            <img ref={recorteRef} src={peca.recorte} alt={`${peca.titulo}, foto real da peça`} loading="lazy" />
          </div>
          <figcaption>A peça real</figcaption>
        </figure>

        <div className="provador__etiqueta">
          <p className="provador__numero">
            Provador {numero}
            {total ? ` de ${total}` : ''}
          </p>
          <h3 className="titulo provador__titulo" id={`provador-${look.id}`}>
            <Link to={`/peca/${peca.id}`} viewTransition>
              {peca.titulo}
            </Link>
          </h3>
          <p className="provador__dados">
            Tam. {peca.tamanho} <span aria-hidden="true">·</span> #{peca.codigo}
          </p>
          <p className="provador__preco">{formatarPreco(peca.preco)}</p>
          <div className="provador__acoes">
            <BotaoLevar peca={peca} imagemRef={recorteRef} />
            <Link to={`/peca/${peca.id}`} className="link-seta" viewTransition>
              Medidas e detalhes
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
