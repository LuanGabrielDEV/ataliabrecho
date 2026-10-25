import { useEffect, useId, useRef, useState } from 'react'
import AviseMeForm from './AviseMeForm'
import { lerEstadoFaixa, salvarEstadoFaixa } from './aviseMe'
import { Borboleta } from '../../components/Marca'

const ATRASO_MS = 2500

/**
 * Faixa discreta no rodapé da tela. Não bloqueia a navegação:
 * aparece pouco depois de abrir o site, abre o formulário para cima
 * quando a pessoa toca nela e some por 7 dias se for fechada.
 */
export default function AviseMeFaixa() {
  const id = useId()
  const [visivel, setVisivel] = useState(false)
  const [aberta, setAberta] = useState(false)
  const [cadastrada, setCadastrada] = useState(false)
  const gatilhoRef = useRef(null)

  useEffect(() => {
    if (lerEstadoFaixa() === 'oculta') return
    const t = setTimeout(() => setVisivel(true), ATRASO_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!aberta) return
    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        setAberta(false)
        gatilhoRef.current?.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberta])

  if (!visivel) return null

  const fechar = () => {
    if (!cadastrada) salvarEstadoFaixa({ fechadaEm: Date.now() })
    setVisivel(false)
  }

  const aoCadastrar = () => {
    setCadastrada(true)
    salvarEstadoFaixa({ cadastrada: true })
  }

  return (
    <aside className={`am-faixa${aberta ? ' am-faixa--aberta' : ''}`} aria-label="Avisos de peças novas">
      <div className="am-faixa__barra">
        <Borboleta className="am-faixa__borboleta" />
        <button
          ref={gatilhoRef}
          type="button"
          className="am-faixa__gatilho"
          aria-expanded={aberta}
          aria-controls={`${id}-painel`}
          onClick={() => (cadastrada ? fechar() : setAberta((a) => !a))}
        >
          <span className="am-faixa__texto">
            {cadastrada ? (
              <strong>Pronto! Você vai ser avisada.</strong>
            ) : (
              <>
                <strong>Cada peça é única.</strong> Quer saber quando chegar uma no seu tamanho?
              </>
            )}
          </span>
          <span className="am-faixa__acao">{cadastrada ? 'Fechar' : aberta ? 'Agora não' : 'Me avise'}</span>
        </button>
        <button type="button" className="am-faixa__fechar" onClick={fechar} aria-label="Fechar aviso">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div id={`${id}-painel`} className="am-faixa__painel" hidden={!aberta}>
        <h2 className="am-faixa__titulo" id={`${id}-titulo`}>
          Avise-me no meu tamanho
        </h2>
        <p className="am-faixa__intro">
          Peça de brechó não repete. Deixe seu WhatsApp e seus tamanhos e a gente te chama quando chegar algo para
          você.
        </p>
        <AviseMeForm origem="faixa" tituloId={`${id}-titulo`} onSucesso={aoCadastrar} />
      </div>
    </aside>
  )
}
