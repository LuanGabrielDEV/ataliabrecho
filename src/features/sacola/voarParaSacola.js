/**
 * A peça "voa" do cabide (ou do espelho) até o ícone da sacola no cabeçalho.
 * Usa uma cópia da imagem em position: fixed e a Web Animations API.
 * Sem movimento reduzido, sem alvo ou sem imagem: não faz nada (a sacola
 * ainda recebe a peça normalmente).
 */
export function voarParaSacola(imagem) {
  const alvo = document.querySelector('.cabecalho__sacola')
  if (!imagem || !alvo || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pularSacola(alvo)
    return
  }

  const de = imagem.getBoundingClientRect()
  const para = alvo.getBoundingClientRect()
  if (!de.width) return

  const copia = imagem.cloneNode(true)
  copia.removeAttribute('id')
  copia.setAttribute('aria-hidden', 'true')
  Object.assign(copia.style, {
    position: 'fixed',
    left: `${de.left}px`,
    top: `${de.top}px`,
    width: `${de.width}px`,
    height: `${de.height}px`,
    objectFit: 'contain',
    margin: '0',
    zIndex: '90',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 12px 16px rgb(42 31 24 / 0.3))',
  })
  document.body.appendChild(copia)

  const dx = para.left + para.width / 2 - (de.left + de.width / 2)
  const dy = para.top + para.height / 2 - (de.top + de.height / 2)
  const escala = Math.min(28 / de.height, 1)

  const animacao = copia.animate(
    [
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 80}px) scale(${0.55 + escala * 0.3}) rotate(-8deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${escala}) rotate(6deg)`, opacity: 0.2 },
    ],
    { duration: 820, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' },
  )
  animacao.onfinish = () => {
    copia.remove()
    pularSacola(alvo)
  }
}

function pularSacola(alvo) {
  if (!alvo) return
  alvo.classList.remove('pulo')
  // força o navegador a reiniciar a animação
  void alvo.offsetWidth
  alvo.classList.add('pulo')
}
