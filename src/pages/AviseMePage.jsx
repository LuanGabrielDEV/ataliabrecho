import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AviseMeForm from '../features/avise-me/AviseMeForm'
import { salvarEstadoFaixa } from '../features/avise-me/aviseMe'
import { LogoHorizontal } from '../components/Marca'

/**
 * Página própria para o link da bio do Instagram e dos status do WhatsApp:
 * ataliabrecho.com.br/avise-me
 */
export default function AviseMePage() {
  useEffect(() => {
    document.title = 'Avise-me no meu tamanho · Atalia Brechó'
  }, [])

  const origem = new URLSearchParams(window.location.search).get('origem') || 'pagina'

  return (
    <main id="conteudo" className="am-pagina">
      <Link to="/" className="am-pagina__logo" aria-label="Atalia Brechó, ir para o início">
        <LogoHorizontal />
      </Link>
      <h1 className="am-pagina__titulo" id="am-pagina-titulo">
        Avise-me no meu tamanho
      </h1>
      <p className="am-pagina__intro">
        Peça de brechó não repete. Deixe seu WhatsApp e seus tamanhos e a gente te chama quando chegar algo para você.
      </p>
      <AviseMeForm
        origem={origem}
        tituloId="am-pagina-titulo"
        onSucesso={() => salvarEstadoFaixa({ cadastrada: true })}
      />
    </main>
  )
}
