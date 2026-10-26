import { useRef } from 'react'
import { Link } from 'react-router-dom'
import BotaoLevar from '../sacola/BotaoLevar'
import { CONDICOES } from '../../data/pecasDemo'
import { formatarPreco } from '../../config'
import './card-peca.css'

const STATUS = { vendida: 'Vendida', reservada: 'Reservada' }

/** Card de produto: foto da peça sobre fundo claro, tamanho, preço e "Adicionar". */
export default function CardPeca({ peca, prioridade = false }) {
  const imagemRef = useRef(null)
  const url = `/peca/${peca.id}`

  return (
    <article className="card-peca" data-status={peca.status}>
      <Link to={url} className="card-peca__foto" tabIndex={-1} aria-hidden="true" viewTransition>
        <img ref={imagemRef} src={peca.recorte || peca.foto} alt="" loading={prioridade ? 'eager' : 'lazy'} />
        <span className="card-peca__tamanho">{peca.tamanho}</span>
        {STATUS[peca.status] ? (
          <span className="card-peca__selo card-peca__selo--status">{STATUS[peca.status]}</span>
        ) : (
          peca.condicao === 'nova-com-etiqueta' && <span className="card-peca__selo">Nova com etiqueta</span>
        )}
      </Link>
      <div className="card-peca__info">
        <h3 className="card-peca__titulo">
          <Link to={url} viewTransition>
            {peca.titulo}
          </Link>
        </h3>
        <p className="card-peca__detalhe">
          Tam. {peca.tamanho} · {CONDICOES[peca.condicao]?.nome}
        </p>
        <p className="card-peca__preco">{formatarPreco(peca.preco)}</p>
      </div>
      <BotaoLevar peca={peca} imagemRef={imagemRef} compacto className="card-peca__botao" />
    </article>
  )
}
