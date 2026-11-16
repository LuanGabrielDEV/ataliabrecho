import { Link } from 'react-router-dom'
import { formatarPreco } from '../../config'
import './rolo-pecas.css'

/**
 * Rolo de fotos: faixa de peças que passa devagar na horizontal.
 * A lista é repetida para o laço ficar contínuo; a cópia fica escondida de leitores de tela e do teclado.
 * Com movimento reduzido, vira uma faixa comum que a pessoa rola com o dedo.
 */
export default function RoloPecas({ pecas }) {
  if (pecas.length < 6) return null

  const grupo = (copia) => (
    <ul className="rolo__grupo" aria-hidden={copia || undefined}>
      {pecas.map((p) => (
        <li key={p.id}>
          <Link to={`/peca/${p.id}`} className="rolo__item" tabIndex={copia ? -1 : undefined} viewTransition>
            <span className="rolo__foto">
              <img src={p.recorte || p.foto} alt="" loading="lazy" />
            </span>
            <span className="rolo__nome">{p.titulo}</span>
            <span className="rolo__preco">
              {formatarPreco(p.preco)} · Tam. {p.tamanho}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="rolo">
      <div className="rolo__faixa">
        {grupo(false)}
        {grupo(true)}
      </div>
    </div>
  )
}
