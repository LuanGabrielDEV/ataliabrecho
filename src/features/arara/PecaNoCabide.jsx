import { useRef } from 'react'
import { Link } from 'react-router-dom'
import BotaoLevar from '../sacola/BotaoLevar'
import { formatarPreco } from '../../config'
import './arara.css'

function Cabide() {
  return (
    <svg className="cabide" viewBox="0 0 120 52" aria-hidden="true">
      <path d="M60 22 V14 a7 7 0 1 1 7 -7" fill="none" strokeLinecap="round" />
      <path d="M60 22 L6 46 Q2 48 6 49 H114 Q118 48 114 46 Z" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

const STATUS = { vendida: 'Vendida', reservada: 'Reservada' }

/** Uma peça recortada pendurada no cabide, com etiqueta e "Levar". */
export default function PecaNoCabide({ peca, prioridade = false }) {
  const recorteRef = useRef(null)
  const url = `/peca/${peca.id}`

  return (
    <article className="cabideiro" data-status={peca.status}>
      <Link to={url} className="cabideiro__peca" tabIndex={-1} aria-hidden="true" viewTransition>
        <Cabide />
        <img
          ref={recorteRef}
          src={peca.recorte || peca.foto}
          alt=""
          loading={prioridade ? 'eager' : 'lazy'}
        />
        {STATUS[peca.status] && <span className="cabideiro__status">{STATUS[peca.status]}</span>}
      </Link>
      <div className="cabideiro__etiqueta">
        <p className="cabideiro__dados">
          <span>Tam. {peca.tamanho}</span>
          <span>#{peca.codigo}</span>
        </p>
        <h3 className="cabideiro__titulo">
          <Link to={url} viewTransition>
            {peca.titulo}
          </Link>
        </h3>
        <p className="cabideiro__preco">{formatarPreco(peca.preco)}</p>
        <BotaoLevar peca={peca} imagemRef={recorteRef} compacto className="cabideiro__levar" />
      </div>
    </article>
  )
}
