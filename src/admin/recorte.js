/**
 * Recorte de fundo no navegador (a foto não sai do aparelho).
 *
 * Usa @imgly/background-removal (licença AGPL-3.0; o código do site é público em
 * https://github.com/LuanGabrielDEV/ataliabrecho). Na primeira vez a biblioteca baixa o modelo
 * (40 a 80 MB) e guarda no cache do navegador. A biblioteca só é carregada quando alguém clica
 * em recortar, então não pesa no painel nem no site.
 *
 * Só uma foto é processada por vez (fila), para não travar o aparelho nem estourar a memória.
 */

let fila = Promise.resolve()

export function recorteDisponivel() {
  return typeof WebAssembly === 'object' && typeof createImageBitmap === 'function'
}

/** Celulares e computadores modestos usam o modelo menor (40 MB), um pouco menos preciso. */
function escolherModelo() {
  const fraco = (navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(pointer: coarse)').matches
  return fraco ? 'isnet_quint8' : 'isnet_fp16'
}

/** Reduz a foto antes do recorte: fica bem mais rápido e o site usa no máximo 1400 px. */
async function reduzir(arquivo, ladoMax = 1400) {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error('Não consegui ler esta foto.'))), 'image/png'),
  )
}

/**
 * Tira o fundo de uma foto.
 * @param {Blob|File} arquivo foto original (JPG, PNG, WebP)
 * @param {{ aoProgredir?: (info: { etapa: 'baixando' | 'recortando', fracao: number }) => void }} opcoes
 * @returns {Promise<File>} PNG com fundo transparente, nomeado "<original>_recorte.png"
 */
export function removerFundo(arquivo, { aoProgredir } = {}) {
  const executar = async () => {
    const entrada = await reduzir(arquivo)
    const { default: imglyRemoveBackground } = await import('@imgly/background-removal')
    const resultado = await imglyRemoveBackground(entrada, {
      model: escolherModelo(),
      output: { format: 'image/png' },
      progress: (chave, atual, total) => {
        if (!aoProgredir || !total) return
        aoProgredir({ etapa: String(chave).startsWith('fetch') ? 'baixando' : 'recortando', fracao: atual / total })
      },
    })
    const nomeBase = (arquivo.name || 'foto').replace(/\.[^.]+$/, '').replace(/[\s_-]+(recorte|ia)$/i, '')
    return new File([resultado], `${nomeBase}_recorte.png`, { type: 'image/png' })
  }
  // encadeia: a próxima só começa quando a anterior termina (com sucesso ou erro)
  const tarefa = fila.then(executar, executar)
  fila = tarefa.catch(() => {})
  return tarefa
}

export function mensagemRecorte(e) {
  const m = e?.message || String(e)
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) {
    return 'Não consegui baixar o modelo de recorte. Confira a internet e tente de novo.'
  }
  if (/memory|allocation|out of/i.test(m)) {
    return 'Faltou memória neste aparelho para recortar. Tente uma foto menor ou use um computador.'
  }
  return `Não consegui recortar esta foto. ${m}`
}
