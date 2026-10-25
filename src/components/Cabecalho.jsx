import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { siWhatsapp } from 'simple-icons'
import { LogoHorizontal } from './Marca'
import { useSacola } from '../features/sacola/Sacola'
import { linkWhatsapp } from '../config'
import './cabecalho.css'

const LINKS = [
  { to: '/comprar', texto: 'Comprar peças' },
  { to: '/consigne', texto: 'Consigne suas peças' },
  { to: '/duvidas', texto: 'Dúvidas e contato' },
]

export function IconeMarca({ icone, tamanho = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} fill="currentColor" aria-hidden="true">
      <path d={icone.path} />
    </svg>
  )
}

export default function Cabecalho() {
  const { itens, aviso } = useSacola()
  const [aberto, setAberto] = useState(false)

  return (
    <header className="cabecalho">
      <div className="cabecalho__barra conteiner">
        <Link to="/" className="cabecalho__logo">
          <LogoHorizontal titulo="Atalia Brechó" />
        </Link>

        <nav className={`cabecalho__nav${aberto ? ' cabecalho__nav--aberta' : ''}`} id="menu-principal" aria-label="Principal">
          <ul>
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} onClick={() => setAberto(false)}>{l.texto}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cabecalho__acoes">
          <a
            className="cabecalho__icone cabecalho__whats"
            href={linkWhatsapp('Oi, Atalia! Vim pelo site.')}
            target="_blank"
            rel="noreferrer"
            aria-label="Falar no WhatsApp"
          >
            <IconeMarca icone={siWhatsapp} />
          </a>
          <Link to="/sacola" className="cabecalho__icone cabecalho__sacola" aria-label={`Sacola, ${itens.length} ${itens.length === 1 ? 'peça' : 'peças'}`}>
            <ShoppingBag size={22} strokeWidth={1.6} aria-hidden="true" />
            {itens.length > 0 && <span className="cabecalho__contador" aria-hidden="true">{itens.length}</span>}
          </Link>
          <button
            type="button"
            className="cabecalho__icone cabecalho__menu"
            aria-expanded={aberto}
            aria-controls="menu-principal"
            onClick={() => setAberto((a) => !a)}
          >
            {aberto ? <X size={24} strokeWidth={1.6} aria-hidden="true" /> : <Menu size={24} strokeWidth={1.6} aria-hidden="true" />}
            <span className="sr-only">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
          </button>
        </div>
      </div>

      <div className="cabecalho__aviso" role="status" aria-live="polite">
        {aviso && (
          <p key={aviso.id}>
            {aviso.texto} <Link to="/sacola">Ver sacola</Link>
          </p>
        )}
      </div>
    </header>
  )
}
