import { Plus } from 'lucide-react'
import './perguntas.css'

/** Lista de perguntas e respostas que abrem e fecham (usa <details>, acessível por padrão). */
export default function Perguntas({ itens }) {
  return (
    <div className="perguntas">
      {itens.map((item) => (
        <details key={item.p} className="perguntas__item">
          <summary>
            <span>{item.p}</span>
            <Plus size={20} strokeWidth={1.8} aria-hidden="true" />
          </summary>
          <p>{item.r}</p>
        </details>
      ))}
    </div>
  )
}
