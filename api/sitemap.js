// Mapa do site para buscadores: páginas fixas + peças que estão na vitrine.
import { SITE, catalogoNoBanco, consultar, escapar } from './_supabase.js'

const PAGINAS = ['/', '/comprar', '/nossa-historia', '/consigne', '/avise-me', '/duvidas', '/politicas']

export default async function handler(req, res) {
  let pecas = []
  if (catalogoNoBanco()) {
    try {
      pecas = await consultar('pecas?status=in.(disponivel,reservada)&select=codigo,created_at&order=created_at.desc&limit=2000')
    } catch {
      pecas = [] // sem o banco, o mapa sai só com as páginas fixas
    }
  }
  const urls = [
    ...PAGINAS.map((p) => `  <url><loc>${SITE}${p}</loc></url>`),
    ...pecas.map(
      (p) =>
        `  <url><loc>${SITE}/peca/${escapar(encodeURIComponent(p.codigo))}</loc><lastmod>${escapar(String(p.created_at).slice(0, 10))}</lastmod></url>`,
    ),
  ]
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res
    .status(200)
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
}
