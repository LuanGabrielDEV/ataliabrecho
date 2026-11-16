// Prévia de link de uma peça (WhatsApp, Instagram, Facebook, Telegram...).
// Esses aplicativos não executam JavaScript, então não enxergam o título e a foto que o site monta
// no navegador. O vercel.json manda só os robôs de prévia para cá; pessoas continuam indo para o site.
import { SITE, catalogoNoBanco, consultar, escapar, urlFoto } from './_supabase.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CODIGO = /^[A-Za-z0-9-]{1,20}$/

const preco = (valor) => {
  const n = Number(valor)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })
}

async function buscarPeca(id) {
  if (!catalogoNoBanco()) return null
  const filtro = UUID.test(id) ? `id=eq.${id}` : CODIGO.test(id) ? `codigo=ilike.${id}` : null
  if (!filtro) return null
  const linhas = await consultar(
    `pecas?${filtro}&select=codigo,titulo,tamanho,preco,status,peca_fotos(caminho,ordem,recortada,gerada_por_ia)&limit=1`,
  )
  return linhas[0] || null
}

function pagina({ titulo, descricao, imagem, url }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapar(titulo)}</title>
<meta name="description" content="${escapar(descricao)}">
<link rel="canonical" href="${escapar(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Atalia Brechó">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${escapar(titulo)}">
<meta property="og:description" content="${escapar(descricao)}">
<meta property="og:url" content="${escapar(url)}">
<meta property="og:image" content="${escapar(imagem)}">
<meta name="twitter:card" content="summary_large_image">
</head>
<body><h1>${escapar(titulo)}</h1><p>${escapar(descricao)}</p><p><a href="${escapar(url)}">Ver no site da Atalia Brechó</a></p></body>
</html>`
}

export default async function handler(req, res) {
  const id = String(req.query?.id || '').slice(0, 40)
  let peca = null
  try {
    peca = await buscarPeca(id)
  } catch {
    peca = null // se o banco não responder, a prévia genérica ainda funciona
  }

  let dados = {
    titulo: 'Atalia Brechó · Moda com propósito',
    descricao: 'Moda circular em Paulista/PE. Peças únicas de segunda mão, selecionadas uma a uma.',
    imagem: `${SITE}/og-atalia.jpg`,
    url: CODIGO.test(id) || UUID.test(id) ? `${SITE}/peca/${id}` : `${SITE}/`,
  }
  if (peca) {
    const fotos = [...(peca.peca_fotos || [])].filter((f) => !f.gerada_por_ia).sort((a, b) => a.ordem - b.ordem)
    const foto = fotos.find((f) => !f.recortada) || fotos[0]
    const situacao = peca.status === 'vendida' ? ' (vendida)' : peca.status === 'reservada' ? ' (reservada)' : ''
    dados = {
      titulo: `${peca.titulo} · Atalia Brechó`,
      descricao: `Tamanho ${peca.tamanho} · ${preco(peca.preco)}${situacao}. Peça única de segunda mão.`,
      imagem: foto ? urlFoto(foto.caminho) : dados.imagem,
      url: `${SITE}/peca/${peca.codigo}`,
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.status(200).send(pagina(dados))
}
