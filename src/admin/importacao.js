/**
 * Importação em massa de peças: leitura da planilha, validação e ligação das fotos.
 * Tudo aqui é função pura (sem tela e sem banco), para ser testável.
 */

export const MAX_LINHAS = 1000
export const EXTENSOES = ['jpg', 'jpeg', 'png', 'webp']

/** minúsculas, sem acento, sem pontuação: "Preço (R$)*" -> "preco r" */
export function chave(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const CATEGORIAS = {
  vestidos: 'vestidos',
  'blusas e calcas': 'blusas-e-calcas',
  'blusas-e-calcas': 'blusas-e-calcas',
  'shorts e saias': 'shorts-e-saias',
  'praia e fitness': 'praia-e-fitness',
  acessorios: 'acessorios',
}
const CONDICOES = {
  'nova com etiqueta': 'nova-com-etiqueta',
  'nova': 'nova-com-etiqueta',
  otimo: 'otimo',
  'otimo estado': 'otimo',
  bom: 'bom',
  'bom estado': 'bom',
}
const CORES = ['preto', 'vermelho', 'rosa', 'laranja', 'verde', 'azul', 'marrom', 'nude', 'dourado', 'estampado']
const STATUS = { disponivel: 'disponivel', reservada: 'reservada', vendida: 'vendida', oculta: 'oculta' }
const ORIGENS = { propria: 'propria', consignada: 'consignada' }
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XG', '34', '36', '38', '40', '42', '44', '46', '48', 'Único']
const TAMANHO_POR_CHAVE = Object.fromEntries(TAMANHOS.map((t) => [chave(t), t]))

// cabeçalho da planilha -> campo interno
const CABECALHOS = {
  id: 'codigo',
  codigo: 'codigo',
  titulo: 'titulo',
  nome: 'titulo',
  categoria: 'categoria',
  tamanho: 'tamanho',
  preco: 'preco',
  'preco r': 'preco',
  'preco original': 'preco_original',
  condicao: 'condicao',
  cor: 'cor',
  tecido: 'tecido',
  observacao: 'observacao',
  descricao: 'descricao',
  status: 'status',
  origem: 'origem',
  consignante: 'consignadora',
  consignadora: 'consignadora',
  destaque: 'destaque',
  'chegou em': 'chegou_em',
}
const OBRIGATORIOS = ['titulo', 'categoria', 'tamanho', 'preco', 'condicao']

const texto = (v) => (v === null || v === undefined ? '' : String(v).trim())

function numero(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN
  // "1.234,50" ou "59,90" ou "R$ 59,90"
  let s = String(v).replace(/[^\d.,-]/g, '')
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = Number(s)
  return s === '' ? NaN : n
}

function dataISO(v) {
  if (v === null || v === undefined || v === '') return null
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return undefined
    // células de data chegam à meia-noite UTC; usa o dia UTC para não escorregar de dia
    return v.toISOString().slice(0, 10)
  }
  const s = String(v).trim()
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return valida(m[3], m[2], m[1])
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return valida(m[1], m[2], m[3])
  return undefined
}
function valida(a, m, d) {
  const dt = new Date(Date.UTC(+a, +m - 1, +d))
  if (dt.getUTCFullYear() !== +a || dt.getUTCMonth() !== +m - 1 || dt.getUTCDate() !== +d) return undefined
  return dt.toISOString().slice(0, 10)
}

function simNao(v) {
  const c = chave(v)
  if (c === '') return false
  if (['sim', 's', 'x', '1', 'true', 'verdadeiro'].includes(c)) return true
  if (['nao', 'n', '0', 'false', 'falso'].includes(c)) return false
  return undefined
}

/**
 * Converte as linhas cruas da planilha (array de arrays) em peças validadas.
 * @param {unknown[][]} linhas primeira linha = cabeçalho
 * @param {{ codigosExistentes?: Set<string> }} opcoes códigos já no banco (em minúsculas)
 */
export function lerPlanilha(linhas, { codigosExistentes = new Set() } = {}) {
  if (!linhas || linhas.length === 0) {
    return { erroGeral: 'A planilha está vazia.', itens: [] }
  }

  const mapa = {} // campo -> índice da coluna
  linhas[0].forEach((cab, i) => {
    const campo = CABECALHOS[chave(cab)]
    if (campo && mapa[campo] === undefined) mapa[campo] = i
  })
  const faltando = OBRIGATORIOS.filter((c) => mapa[c] === undefined)
  if (faltando.length) {
    const nomes = { titulo: 'Título', categoria: 'Categoria', tamanho: 'Tamanho', preco: 'Preço', condicao: 'Condição' }
    return {
      erroGeral: `Não encontrei as colunas: ${faltando.map((c) => nomes[c]).join(', ')}. Use o modelo de planilha do painel e não mude os cabeçalhos.`,
      itens: [],
    }
  }

  const corpo = linhas.slice(1)
  // ignora linhas totalmente vazias, mas guarda o número real da linha no Excel
  const preenchidas = corpo
    .map((cels, i) => ({ cels, linha: i + 2 }))
    .filter(({ cels }) => cels.some((c) => texto(c) !== ''))

  if (preenchidas.length === 0) return { erroGeral: 'A planilha não tem nenhuma peça preenchida.', itens: [] }
  if (preenchidas.length > MAX_LINHAS) {
    return { erroGeral: `A planilha tem ${preenchidas.length} peças. O limite é ${MAX_LINHAS} por vez.`, itens: [] }
  }

  const lê = (cels, campo) => (mapa[campo] === undefined ? undefined : cels[mapa[campo]])
  const vistos = new Map() // código (minúsculo) -> primeira linha

  const itens = preenchidas.map(({ cels, linha }) => {
    const erros = []
    const avisos = []

    const codigo = texto(lê(cels, 'codigo')).replace(/\s+/g, '')
    if (codigo && !/^[A-Za-z0-9-]{1,20}$/.test(codigo)) {
      erros.push('ID inválido: use só letras, números e hífen, até 20 caracteres, sem espaço.')
    }
    if (codigo) {
      const k = codigo.toLowerCase()
      if (vistos.has(k)) erros.push(`ID repetido na planilha (já usado na linha ${vistos.get(k)}).`)
      else vistos.set(k, linha)
    }

    const titulo = texto(lê(cels, 'titulo'))
    if (titulo.length < 3 || titulo.length > 90) erros.push('Título precisa ter de 3 a 90 caracteres.')

    const categoria = CATEGORIAS[chave(lê(cels, 'categoria'))]
    if (!categoria) erros.push(`Categoria não reconhecida: "${texto(lê(cels, 'categoria'))}".`)

    const tamanhoBruto = lê(cels, 'tamanho')
    const tamanho = TAMANHO_POR_CHAVE[chave(typeof tamanhoBruto === 'number' ? String(tamanhoBruto) : tamanhoBruto)]
    if (!tamanho) erros.push(`Tamanho não reconhecido: "${texto(tamanhoBruto)}".`)

    const preco = numero(lê(cels, 'preco'))
    if (preco === null || Number.isNaN(preco) || preco < 0) erros.push('Preço inválido ou vazio.')

    let precoOriginal = numero(lê(cels, 'preco_original'))
    if (Number.isNaN(precoOriginal) || (precoOriginal !== null && precoOriginal < 0)) {
      erros.push('Preço original inválido.')
      precoOriginal = null
    }

    const condicao = CONDICOES[chave(lê(cels, 'condicao'))]
    if (!condicao) erros.push(`Condição não reconhecida: "${texto(lê(cels, 'condicao'))}".`)

    const corBruta = chave(lê(cels, 'cor'))
    let cor = null
    if (corBruta) {
      if (CORES.includes(corBruta)) cor = corBruta
      else avisos.push(`Cor "${texto(lê(cels, 'cor'))}" não está na lista; a peça entra sem cor.`)
    }

    const statusBruto = chave(lê(cels, 'status'))
    const status = statusBruto === '' ? 'disponivel' : STATUS[statusBruto]
    if (!status) erros.push(`Status não reconhecido: "${texto(lê(cels, 'status'))}".`)

    const origemBruta = chave(lê(cels, 'origem'))
    const origem = origemBruta === '' ? 'propria' : ORIGENS[origemBruta]
    if (!origem) erros.push(`Origem não reconhecida: "${texto(lê(cels, 'origem'))}".`)

    const destaque = simNao(lê(cels, 'destaque'))
    if (destaque === undefined) erros.push('Destaque: use Sim ou Não.')

    const chegouBruto = lê(cels, 'chegou_em')
    const chegou = dataISO(chegouBruto)
    if (chegou === undefined) erros.push('Data "Chegou em" inválida (use dia/mês/ano).')

    const consignadora = texto(lê(cels, 'consignadora'))
    if (origem === 'consignada' && !consignadora) avisos.push('Peça consignada sem o nome de quem consignou.')

    const existe = codigo ? codigosExistentes.has(codigo.toLowerCase()) : false

    return {
      linha,
      codigo: codigo || null,
      existe,
      erros,
      avisos,
      // linha pronta para gravar em `pecas` (o código só entra se foi informado)
      dados: {
        ...(codigo ? { codigo } : {}),
        titulo,
        categoria,
        tamanho,
        preco,
        preco_original: precoOriginal,
        condicao,
        cor,
        tecido: texto(lê(cels, 'tecido')) || null,
        observacao: texto(lê(cels, 'observacao')) || null,
        descricao: texto(lê(cels, 'descricao')) || null,
        status,
        origem,
        consignadora: origem === 'consignada' ? consignadora || null : null,
        destaque: destaque === true,
        ...(chegou ? { chegou_em: chegou } : {}),
      },
    }
  })

  return { erroGeral: null, itens }
}

/* ------------------------------------------------------------------ */
/* Fotos                                                               */
/* ------------------------------------------------------------------ */

/**
 * Interpreta o nome de um arquivo de foto.
 * "A127.jpg", "A127_2.jpg", "A127-2.png", "A127 (2).jpg", "A127_recorte.png", "A127_ia.webp",
 * "linha5.jpg", "Vestido floral midi_2.jpg"
 *
 * Um nome como "VES-12.jpg" pode ser o ID "VES-12" ou a foto 12 do ID "VES".
 * Por isso devolvemos as duas leituras e quem liga as fotos decide pelo que existe na planilha.
 */
export function interpretarNomeFoto(nomeArquivo) {
  const ponto = nomeArquivo.lastIndexOf('.')
  const ext = ponto < 0 ? '' : nomeArquivo.slice(ponto + 1).toLowerCase()
  if (!EXTENSOES.includes(ext)) return null
  let base = nomeArquivo.slice(0, ponto).trim()

  let recortada = ext === 'png'
  let ia = false
  let ordemParenteses = null

  // marcadores no fim do nome, em qualquer ordem: _recorte, _ia, (2)
  for (let guarda = 0; guarda < 4; guarda++) {
    let m = base.match(/^(.*?)[\s_-]+(?:recorte|sem[\s_-]*fundo)$/i)
    if (m) { recortada = true; base = m[1].trim(); continue }
    m = base.match(/^(.*?)[\s_-]+ia$/i)
    if (m) { ia = true; recortada = false; base = m[1].trim(); continue }
    m = base.match(/^(.*?)\s*\((\d{1,2})\)$/)
    if (m) { ordemParenteses = +m[2]; base = m[1].trim(); continue }
    break
  }
  if (!base) return null

  const sufixo = base.match(/^(.+?)[_-](\d{1,2})$/)
  return {
    base,
    ordemParenteses,
    semSufixo: sufixo ? sufixo[1].trim() : null,
    ordemSufixo: sufixo ? +sufixo[2] : null,
    recortada,
    ia,
    extensao: ext,
  }
}

/**
 * Liga os arquivos de foto às peças.
 * Peça com ID: casa pelo ID. Peça sem ID: casa por "linhaN" ou pelo título exato.
 * Devolve { fotosPorLinha: Map<linha, foto[]>, orfas: arquivo[] }.
 */
export function ligarFotos(itens, arquivos) {
  const alvo = new Map() // chave -> linha
  for (const it of itens) {
    if (it.codigo) {
      if (!alvo.has(chave(it.codigo))) alvo.set(chave(it.codigo), it.linha) // ID repetido: vale a primeira linha
    }
    else {
      alvo.set(`linha ${it.linha}`, it.linha)
      const t = chave(it.dados.titulo)
      if (t && !alvo.has(t)) alvo.set(t, it.linha)
    }
  }
  // "linha 5" e "linha5" valem igual
  const achar = (texto) => alvo.get(chave(texto).replace(/^linha(\d+)$/, 'linha $1'))

  const fotosPorLinha = new Map()
  const orfas = []
  for (const arquivo of arquivos) {
    const info = interpretarNomeFoto(arquivo.name)
    let linha
    let ordem = 1
    if (info) {
      linha = achar(info.base)
      if (linha !== undefined) ordem = info.ordemParenteses ?? 1
      else if (info.semSufixo) {
        linha = achar(info.semSufixo)
        if (linha !== undefined) ordem = info.ordemSufixo
      }
    }
    if (linha === undefined) {
      orfas.push(arquivo)
      continue
    }
    if (!fotosPorLinha.has(linha)) fotosPorLinha.set(linha, [])
    fotosPorLinha.get(linha).push({ arquivo, ordem, recortada: info.recortada, ia: info.ia, extensao: info.extensao })
  }

  for (const lista of fotosPorLinha.values()) {
    // fotos reais primeiro, depois as do Provador IA; dentro de cada grupo, pela ordem do nome
    lista.sort((a, b) => Number(a.ia) - Number(b.ia) || a.ordem - b.ordem || a.arquivo.name.localeCompare(b.arquivo.name, 'pt-BR', { numeric: true }))
  }
  return { fotosPorLinha, orfas }
}

/**
 * Situação final de cada linha:
 *  - 'erro'    : tem erro de preenchimento
 *  - 'existe'  : ID já está no banco, será pulada
 *  - 'sem-foto': não tem nenhuma foto real
 *  - 'pronta'  : pode ser importada
 */
export function classificar(itens, fotosPorLinha) {
  return itens.map((it) => {
    const fotos = fotosPorLinha.get(it.linha) || []
    const reais = fotos.filter((f) => !f.ia)
    let situacao = 'pronta'
    if (it.erros.length) situacao = 'erro'
    else if (it.existe) situacao = 'existe'
    else if (reais.length === 0) situacao = 'sem-foto'
    return { ...it, fotos, situacao }
  })
}
