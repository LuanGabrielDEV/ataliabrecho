import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Borboleta } from '../../components/Marca'
import PecaPendurada from './PecaPendurada'
import './cordel.css'

const TOPO = 56 // espaço acima das peças, onde voa a borboleta (igual ao padding-top da lista)
const Y_PRENDEDOR = TOPO + 12 // onde o cordão passa pelos prendedores
const Y_FOLGA = TOPO // altura do cordão entre uma peça e outra (sobe)

/** Catmull-Rom -> curvas de Bézier, para o cordão passar suave por todos os pontos */
function caminhoSuave(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

/**
 * O cordão: a linha contínua da borboleta da logo atravessa a tela e as
 * peças ficam penduradas nela. No celular, rola de lado com o dedo.
 */
export default function Cordao({ pecas, rotulo }) {
  const trilhoRef = useRef(null)
  const faixaRef = useRef(null)
  const borboletaRef = useRef(null)
  const [geo, setGeo] = useState({ w: 0, d: '' })

  const medir = useCallback(() => {
    const faixa = faixaRef.current
    if (!faixa) return
    const w = faixa.scrollWidth
    const centros = [...faixa.querySelectorAll('.cordao__item')].map((el) => el.offsetLeft + el.offsetWidth / 2)
    const b = borboletaRef.current
    // a ponta da linha da borboleta fica no canto inferior esquerdo do desenho
    const fim = b ? [b.offsetLeft + 2, b.offsetTop + b.offsetHeight * 0.965] : [w, Y_FOLGA]
    const pts = [[-8, Y_FOLGA - 4]]
    centros.forEach((c, i) => {
      pts.push([c, Y_PRENDEDOR])
      const prox = centros[i + 1]
      if (prox !== undefined) pts.push([(c + prox) / 2, Y_FOLGA])
    })
    pts.push(fim)
    setGeo({ w, d: caminhoSuave(pts) })
  }, [])

  useLayoutEffect(() => {
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(faixaRef.current)
    return () => ro.disconnect()
  }, [medir, pecas.length])

  // Balanço: as peças balançam um pouco quando o cordão é arrastado
  useEffect(() => {
    const trilho = trilhoRef.current
    const faixa = faixaRef.current
    if (!trilho || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ultimoX = trilho.scrollLeft
    let ultimoT = performance.now()
    let parada
    const aoRolar = () => {
      const agora = performance.now()
      const v = (trilho.scrollLeft - ultimoX) / Math.max(agora - ultimoT, 1)
      ultimoX = trilho.scrollLeft
      ultimoT = agora
      const angulo = Math.max(-5, Math.min(5, -v * 3))
      faixa.style.setProperty('--balanco', `${angulo.toFixed(2)}deg`)
      faixa.dataset.movendo = ''
      clearTimeout(parada)
      parada = setTimeout(() => {
        delete faixa.dataset.movendo
        faixa.style.setProperty('--balanco', '0deg')
      }, 90)
    }
    trilho.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      trilho.removeEventListener('scroll', aoRolar)
      clearTimeout(parada)
    }
  }, [])

  return (
    <div className="cordao">
      <div className="cordao__trilho" ref={trilhoRef} tabIndex={0} role="region" aria-label={rotulo}>
        <div className="cordao__faixa" ref={faixaRef}>
          <svg className="cordao__linha" width={geo.w} height={TOPO + 40} aria-hidden="true">
            <path d={geo.d} />
          </svg>
          <ul className="cordao__lista">
          {pecas.map((p, i) => (
            <li key={p.id} className="cordao__item" style={{ '--peso': i % 3 === 1 ? 0.7 : i % 3 === 2 ? 1.2 : 1 }}>
              <PecaPendurada peca={p} prioridade={i < 2} />
            </li>
          ))}
          <li className="cordao__borboleta" ref={borboletaRef} aria-hidden="true">
            <Borboleta />
          </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
