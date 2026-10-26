import { Link } from 'react-router-dom'
import { siFacebook, siInstagram, siWhatsapp } from './iconesMarca'
import { Mail } from 'lucide-react'
import { LogoHorizontal } from './Marca'
import { IconeMarca } from './Cabecalho'
import { CONTATO, linkWhatsapp } from '../config'
import './rodape.css'

const ANO = new Date().getFullYear()

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="conteiner rodape__grade">
        <div className="rodape__marca">
          <LogoHorizontal titulo="Atalia Brechó" />
          <p>Moda com propósito. Brechó de moda circular em {CONTATO.cidade}.</p>
        </div>

        <nav aria-label="Rodapé" className="rodape__links">
          <ul>
            <li><Link to="/comprar">Comprar peças</Link></li>
            <li><Link to="/consigne">Consigne suas peças</Link></li>
            <li><Link to="/avise-me">Avise-me no meu tamanho</Link></li>
            <li><Link to="/duvidas">Dúvidas e contato</Link></li>
            <li><Link to="/politicas">Políticas e termos</Link></li>
          </ul>
        </nav>

        <ul className="rodape__contato">
          <li>
            <a href={linkWhatsapp('Oi, Atalia! Vim pelo site.')} target="_blank" rel="noreferrer">
              <IconeMarca icone={siWhatsapp} tamanho={18} /> {CONTATO.whatsappExibicao}
            </a>
          </li>
          <li>
            <a href={CONTATO.instagram} target="_blank" rel="noreferrer">
              <IconeMarca icone={siInstagram} tamanho={18} /> {CONTATO.instagramUsuario}
            </a>
          </li>
          {CONTATO.facebook && (
            <li>
              <a href={CONTATO.facebook} target="_blank" rel="noreferrer">
                <IconeMarca icone={siFacebook} tamanho={18} /> Facebook
              </a>
            </li>
          )}
          <li>
            <a href={`mailto:${CONTATO.email}`}>
              <Mail size={18} strokeWidth={1.6} aria-hidden="true" /> {CONTATO.email}
            </a>
          </li>
        </ul>
      </div>
      <p className="conteiner rodape__fim">© {ANO} Atalia Brechó</p>
    </footer>
  )
}
