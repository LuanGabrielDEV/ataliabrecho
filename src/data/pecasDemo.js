// ⚠️ DADOS DE DEMONSTRAÇÃO
// Fotos reais das peças da Atalia; códigos, preços, tamanhos e medidas são
// exemplos até o catálogo vir do Supabase. Não publicar assim.
import vestidoLaranja from '../assets/pecas/vestido-laranja.webp'
import vestidoFloral from '../assets/pecas/vestido-floral-marinho.webp'
import vestidoNude from '../assets/pecas/vestido-longo-nude.webp'
import vestidoBronze from '../assets/pecas/vestido-cetim-bronze.webp'
import conjuntoFerrugem from '../assets/pecas/conjunto-alca-ferrugem.webp'
import conjuntoFloral from '../assets/pecas/conjunto-floral-estampado.webp'
import alfaiataria from '../assets/pecas/conjunto-alfaiataria-marrom.webp'
import calcaVermelha from '../assets/pecas/calca-vermelha.webp'
import brincoTurquesa from '../assets/pecas/brinco-argola-turquesa.webp'
import brincoVerde from '../assets/pecas/brinco-ondas-verde.webp'

export const CATEGORIAS = [
  { slug: 'vestidos', nome: 'Vestidos' },
  { slug: 'blusas-e-calcas', nome: 'Blusas e calças' },
  { slug: 'shorts-e-saias', nome: 'Shorts e saias' },
  { slug: 'praia-e-fitness', nome: 'Praia e fitness' },
  { slug: 'acessorios', nome: 'Acessórios' },
]

export const PECAS_DEMO = [
  { id: 'a101', codigo: 'A101', titulo: 'Vestido reto laranja', categoria: 'vestidos', tamanho: 'M', preco: 49, status: 'disponivel', foto: vestidoLaranja },
  { id: 'a102', codigo: 'A102', titulo: 'Conjunto de alça ferrugem e short preto', categoria: 'shorts-e-saias', tamanho: 'P', preco: 55, status: 'disponivel', foto: conjuntoFerrugem },
  { id: 'a103', codigo: 'A103', titulo: 'Vestido floral marinho', categoria: 'vestidos', tamanho: 'G', preco: 59, status: 'reservada', foto: vestidoFloral },
  { id: 'a104', codigo: 'A104', titulo: 'Conjunto de alfaiataria marrom', categoria: 'blusas-e-calcas', tamanho: '40', preco: 89, status: 'disponivel', foto: alfaiataria },
  { id: 'a105', codigo: 'A105', titulo: 'Brinco argola turquesa', categoria: 'acessorios', tamanho: 'Único', preco: 20, status: 'disponivel', foto: brincoTurquesa },
  { id: 'a106', codigo: 'A106', titulo: 'Vestido de cetim bronze com renda', categoria: 'vestidos', tamanho: 'P', preco: 69, status: 'vendida', foto: vestidoBronze },
  { id: 'a107', codigo: 'A107', titulo: 'Top floral e saia estampada', categoria: 'shorts-e-saias', tamanho: 'M', preco: 58, status: 'disponivel', foto: conjuntoFloral },
  { id: 'a108', codigo: 'A108', titulo: 'Vestido longo nude', categoria: 'vestidos', tamanho: 'M', preco: 79, status: 'disponivel', foto: vestidoNude },
  { id: 'a109', codigo: 'A109', titulo: 'Calça vermelha de cintura alta', categoria: 'blusas-e-calcas', tamanho: '38', preco: 45, status: 'disponivel', foto: calcaVermelha },
  { id: 'a110', codigo: 'A110', titulo: 'Brinco ondas verde', categoria: 'acessorios', tamanho: 'Único', preco: 20, status: 'disponivel', foto: brincoVerde },
]
