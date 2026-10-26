import { useEffect, useRef } from 'react'
import PecaNoCabide from './PecaNoCabide'
import './arara.css'

/**
 * Arara de latão que rola de lado. As peças balançam nos cabides
 * quando a arara é arrastada.
 */
export default function Arara({ pecas, rotulo }) {
  const trilhoRef = useRef(null)
  const listaRef = useRef(null)

  useEffect(() => {
    const trilho = trilhoRef.current
    const lista = listaRef.current
    if (!trilho || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ultimoX = trilho.scrollLeft
    let ultimoT = performance.now()
    let parada
    const aoRolar = () => {
      const agora = performance.now()
      const v = (trilho.scrollLeft - ultimoX) / Math.max(agora - ultimoT, 1)
      ultimoX = trilho.scrollLeft
      ultimoT = agora
      lista.style.setProperty('--balanco', `${Math.max(-6, Math.min(6, -v * 3.5)).toFixed(2)}deg`)
      lista.dataset.movendo = ''
      clearTimeout(parada)
      parada = setTimeout(() => {
        delete lista.dataset.movendo
        lista.style.setProperty('--balanco', '0deg')
      }, 90)
    }
    trilho.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      trilho.removeEventListener('scroll', aoRolar)
      clearTimeout(parada)
    }
  }, [])

  return (
    <div className="arara">
      <div className="arara__trilho" ref={trilhoRef} tabIndex={0} role="region" aria-label={rotulo}>
        <ul className="arara__lista" ref={listaRef}>
          {pecas.map((p, i) => (
            <li key={p.id} className="arara__item" style={{ '--peso': [1, 0.7, 1.2][i % 3] }}>
              <PecaNoCabide peca={p} prioridade={i < 3} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
