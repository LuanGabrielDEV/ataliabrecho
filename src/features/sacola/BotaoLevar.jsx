import { Check } from 'lucide-react'
import { useSacola } from './Sacola'
import { voarParaSacola } from './voarParaSacola'

/**
 * "Levar esta": põe a peça na sacola e faz a imagem voar até o ícone.
 * `imagemRef` aponta para a <img> que vai voar (recorte da peça).
 */
export default function BotaoLevar({ peca, imagemRef, className = '', compacto = false }) {
  const { tem, adicionar, abrirGaveta } = useSacola()
  const naSacola = tem(peca.id)

  if (peca.status === 'vendida') {
    return (
      <button type="button" className={`levar ${className}`} disabled>
        Já foi vendida
      </button>
    )
  }
  if (peca.status === 'reservada') {
    return (
      <button type="button" className={`levar ${className}`} disabled>
        Reservada agora
      </button>
    )
  }

  if (naSacola) {
    return (
      <button type="button" className={`levar levar--na-sacola ${className}`} onClick={abrirGaveta}>
        <Check size={16} strokeWidth={2.2} aria-hidden="true" />
        Na sacola{compacto ? '' : ' · ver'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`levar ${className}`}
      onClick={() => {
        voarParaSacola(imagemRef?.current)
        adicionar(peca)
      }}
    >
      {compacto ? 'Levar' : 'Levar esta'}
    </button>
  )
}
