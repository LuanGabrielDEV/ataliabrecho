// ⚠️ DADOS DE DEMONSTRAÇÃO
// As fotos são das peças reais da Atalia. Códigos, preços, tamanhos, medidas,
// cores e descrições são exemplos até o catálogo vir do Supabase.

const fotos = import.meta.glob('../assets/pecas/*.webp', { eager: true, import: 'default' })
const recortes = import.meta.glob('../assets/recortes/*.webp', { eager: true, import: 'default' })
const foto = (nome) => fotos[`../assets/pecas/${nome}.webp`]
const recorte = (nome) => recortes[`../assets/recortes/${nome}.webp`]

export const CATEGORIAS = [
  { slug: 'vestidos', nome: 'Vestidos' },
  { slug: 'blusas-e-calcas', nome: 'Blusas e calças' },
  { slug: 'shorts-e-saias', nome: 'Shorts e saias' },
  { slug: 'praia-e-fitness', nome: 'Praia e fitness' },
  { slug: 'acessorios', nome: 'Acessórios' },
]

export const CONDICOES = {
  'nova-com-etiqueta': { nome: 'Nova com etiqueta', descricao: 'Nunca usada, ainda com a etiqueta da loja.' },
  otimo: { nome: 'Ótimo estado', descricao: 'Pouquíssimo uso, sem marcas nem defeitos.' },
  bom: { nome: 'Bom estado', descricao: 'Sinais leves de uso, descritos na peça.' },
}

export const CORES = [
  { slug: 'preto', nome: 'Preto', hex: '#1e1a17' },
  { slug: 'vermelho', nome: 'Vermelho', hex: '#c8341f' },
  { slug: 'rosa', nome: 'Rosa', hex: '#e6a5b4' },
  { slug: 'laranja', nome: 'Laranja', hex: '#e2622b' },
  { slug: 'verde', nome: 'Verde', hex: '#8fb547' },
  { slug: 'azul', nome: 'Azul', hex: '#2e55b8' },
  { slug: 'marrom', nome: 'Marrom', hex: '#7a5a44' },
  { slug: 'nude', nome: 'Nude', hex: '#e7cdb8' },
  { slug: 'dourado', nome: 'Dourado', hex: '#b48a3c' },
  { slug: 'estampado', nome: 'Estampado', hex: null },
]

// medidas em centímetros, com a peça esticada sobre a mesa
const p = (id, titulo, categoria, tamanho, preco, cor, condicao, medidas, fotoNome, extra = {}) => ({
  id: id.toLowerCase(),
  codigo: id,
  titulo,
  categoria,
  tamanho,
  preco,
  cor,
  condicao,
  medidas,
  foto: foto(fotoNome), // foto original, com o fundo
  recorte: recorte(fotoNome), // mesma foto sem o fundo
  status: 'disponivel',
  chegouEm: '2026-10-20',
  ...extra,
})

export const PECAS_DEMO = [
  p('A101', 'Vestido reto laranja', 'vestidos', 'M', 49, 'laranja', 'otimo', { busto: 88, cintura: 74, quadril: 96, comprimento: 92 }, 'vestido-laranja', { chegouEm: '2026-10-24', tecido: 'Crepe com elastano' }),
  p('A102', 'Conjunto de alça ferrugem e short preto', 'shorts-e-saias', 'P', 55, 'laranja', 'otimo', { busto: 80, cintura: 66, comprimento: 38 }, 'conjunto-alca-ferrugem', { chegouEm: '2026-10-24' }),
  p('A103', 'Vestido floral marinho', 'vestidos', 'G', 59, 'estampado', 'bom', { busto: 96, cintura: 82, quadril: 104, comprimento: 98 }, 'vestido-floral-marinho', { chegouEm: '2026-10-24', status: 'reservada', observacao: 'Pequeno fio puxado na barra, quase imperceptível.' }),
  p('A104', 'Conjunto de alfaiataria marrom', 'blusas-e-calcas', '40', 89, 'marrom', 'otimo', { busto: 92, cintura: 76, quadril: 100, comprimento: 102 }, 'conjunto-alfaiataria-marrom', { chegouEm: '2026-10-23', tecido: 'Alfaiataria com forro' }),
  p('A105', 'Brinco argola turquesa', 'acessorios', 'Único', 20, 'azul', 'nova-com-etiqueta', null, 'brinco-argola-turquesa', { chegouEm: '2026-10-23' }),
  p('A106', 'Vestido de cetim bronze com renda', 'vestidos', 'P', 69, 'dourado', 'otimo', { busto: 82, cintura: 68, quadril: 90, comprimento: 86 }, 'vestido-cetim-bronze', { chegouEm: '2026-10-23', status: 'vendida' }),
  p('A107', 'Top floral e saia estampada', 'shorts-e-saias', 'M', 58, 'estampado', 'otimo', { busto: 86, cintura: 72, comprimento: 44 }, 'conjunto-floral-estampado', { chegouEm: '2026-10-22' }),
  p('A108', 'Vestido longo nude', 'vestidos', 'M', 79, 'nude', 'nova-com-etiqueta', { busto: 86, cintura: 70, quadril: 98, comprimento: 140 }, 'vestido-longo-nude', { chegouEm: '2026-10-22' }),
  p('A109', 'Calça vermelha de cintura alta', 'blusas-e-calcas', '38', 45, 'vermelho', 'otimo', { cintura: 70, quadril: 98, comprimento: 96 }, 'calca-vermelha', { chegouEm: '2026-10-22' }),
  p('A110', 'Brinco ondas verde', 'acessorios', 'Único', 20, 'verde', 'nova-com-etiqueta', null, 'brinco-ondas-verde', { chegouEm: '2026-10-21' }),
  p('A111', 'Vestido preto blusado', 'vestidos', 'M', 45, 'preto', 'bom', { busto: 90, cintura: 72, quadril: 96, comprimento: 94 }, 'vestido-preto-blusado', { chegouEm: '2026-10-21' }),
  p('A112', 'Vestido longo vinho de cetim', 'vestidos', 'P', 89, 'vermelho', 'otimo', { busto: 82, cintura: 66, comprimento: 138 }, 'vestido-longo-vinho', { chegouEm: '2026-10-21' }),
  p('A113', 'Vestido longo azul royal', 'vestidos', 'M', 85, 'azul', 'otimo', { busto: 88, cintura: 70, comprimento: 142 }, 'vestido-longo-azul', { chegouEm: '2026-10-20' }),
  p('A114', 'Vestido floral rosa', 'vestidos', 'G', 52, 'rosa', 'otimo', { busto: 98, cintura: 84, quadril: 106, comprimento: 96 }, 'vestido-floral-rosa', { chegouEm: '2026-10-20' }),
  p('A115', 'Top vermelho e saia de paetê', 'shorts-e-saias', 'P', 62, 'preto', 'otimo', { busto: 80, cintura: 64, comprimento: 40 }, 'saia-paete-preta', { chegouEm: '2026-10-20' }),
  p('A116', 'Cropped verde e short branco', 'shorts-e-saias', 'M', 48, 'verde', 'bom', { busto: 84, cintura: 70, comprimento: 36 }, 'cropped-verde-short-branco', { chegouEm: '2026-10-19' }),
  p('A117', 'Camisa estampada com laço', 'blusas-e-calcas', 'M', 39, 'estampado', 'otimo', { busto: 96, comprimento: 64, manga: 58 }, 'camisa-estampada-laco', { chegouEm: '2026-10-19' }),
  p('A118', 'Camisa verde-limão translúcida', 'blusas-e-calcas', 'G', 35, 'verde', 'otimo', { busto: 104, comprimento: 70 }, 'camisa-verde-limao', { chegouEm: '2026-10-19' }),
  p('A119', 'Maiô estampado pôr do sol', 'praia-e-fitness', 'M', 55, 'estampado', 'otimo', { busto: 84, comprimento: 62 }, 'maio-por-do-sol', { chegouEm: '2026-10-18' }),
  p('A120', 'Conjunto fitness top e legging azul', 'praia-e-fitness', 'P', 59, 'azul', 'otimo', { cintura: 62, comprimento: 90 }, 'conjunto-fitness-azul', { chegouEm: '2026-10-18' }),
  p('A121', 'Biquíni vermelho e azul', 'praia-e-fitness', 'M', 35, 'vermelho', 'nova-com-etiqueta', null, 'biquini-vermelho-azul', { chegouEm: '2026-10-18' }),
  p('A123', 'Camiseta New York e short de sarja', 'shorts-e-saias', 'M', 49, 'rosa', 'otimo', { busto: 92, comprimento: 62 }, 'camiseta-new-york-short', { chegouEm: '2026-10-24' }),
  p('A124', 'Camiseta mostarda e calça jeans', 'blusas-e-calcas', '38', 65, 'laranja', 'otimo', { busto: 90, cintura: 72, quadril: 98, comprimento: 100 }, 'camiseta-amarela-jeans', { chegouEm: '2026-10-24' }),
  p('A125', 'Regata listrada e calça branca', 'blusas-e-calcas', '38', 72, 'estampado', 'otimo', { busto: 84, cintura: 70, quadril: 96, comprimento: 104 }, 'regata-listrada-calca-branca', { chegouEm: '2026-10-24' }),
  p('A126', 'Blusa de poá e calça jeans', 'blusas-e-calcas', '40', 68, 'preto', 'otimo', { busto: 94, cintura: 74, quadril: 100, comprimento: 100 }, 'blusa-poa-jeans', { chegouEm: '2026-10-23' }),
  p('A122', 'Maiô floral com bojo', 'praia-e-fitness', 'G', 49, 'estampado', 'otimo', { busto: 92, comprimento: 66 }, 'maio-floral', { chegouEm: '2026-10-18', status: 'vendida' }),
]

export function buscarPeca(id) {
  return PECAS_DEMO.find((x) => x.id === id) || null
}

export const TAMANHOS_ORDEM = ['PP', 'P', 'M', 'G', 'GG', 'XG', '34', '36', '38', '40', '42', '44', '46', '48', 'Único']
