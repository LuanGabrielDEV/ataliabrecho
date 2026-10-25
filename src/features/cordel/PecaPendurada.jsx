import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { formatarPreco } from '../../config'
import { useSacola } from '../sacola/Sacola'

function Prendedor() {
  return (
    <svg className="peca__prendedor" viewBox="0 0 22 46" aria-hidden="true">
      <rect x="2" y="1" width="8" height="44" rx="3" />
      <rect x="12" y="1" width="8" height="44" rx="3" />
      <circle cx="11" cy="20" r="4.2" className="peca__mola" />
    </svg>
  )
}

/** Carimbo de borracha que "cai" sobre a foto quando aparece na tela */
function Carimbo({ texto }) {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisto(true), { threshold: 0.6 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={`carimbo${visto ? ' carimbo--batido' : ''}`}>
      {texto}
    </span>
  )
}

export default function PecaPendurada({ peca, prioridade = false }) {
  const { tem, adicionar } = useSacola()
  const naSacola = tem(peca.id)
  const indisponivel = peca.status !== 'disponivel'
  const url = `/peca/${peca.id}`

  let rotulo = 'Pôr na sacola'
  if (peca.status === 'vendida') rotulo = 'Já foi vendida'
  else if (peca.status === 'reservada') rotulo = 'Reservada agora'
  else if (naSacola) rotulo = 'Na sacola'

  return (
    <article className="peca" data-status={peca.status}>
      <Prendedor />
      <Link to={url} className="peca__foto" tabIndex={-1} aria-hidden="true">
        <img
          src={peca.foto}
          alt=""
          width="720"
          height="960"
          loading={prioridade ? 'eager' : 'lazy'}
          fetchPriority={prioridade ? 'high' : undefined}
        />
        {peca.status === 'vendida' && <Carimbo texto="Vendida" />}
        {peca.status === 'reservada' && <Carimbo texto="Reservada" />}
      </Link>
      <div className="peca__etiqueta">
        <p className="peca__codigo">
          <span>#{peca.codigo}</span>
          <span>Tam. {peca.tamanho}</span>
        </p>
        <h3 className="peca__titulo">
          <Link to={url}>{peca.titulo}</Link>
        </h3>
        <p className="peca__preco">{formatarPreco(peca.preco)}</p>
        <button
          type="button"
          className="peca__botao"
          disabled={indisponivel}
          aria-pressed={!indisponivel ? naSacola : undefined}
          onClick={() => !naSacola && adicionar(peca)}
        >
          {naSacola && <Check size={16} strokeWidth={2.2} aria-hidden="true" />}
          {rotulo}
        </button>
      </div>
    </article>
  )
}
