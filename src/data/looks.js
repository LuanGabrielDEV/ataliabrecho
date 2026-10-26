// Provadores: a modelo do "Provador IA" vestindo uma peça real do brechó.
// A foto da modelo é SIMULAÇÃO POR IA; a peça real aparece no espelho.
import { buscarPeca } from './pecasDemo'

const fotos = import.meta.glob('../assets/provador/*.webp', { eager: true, import: 'default' })
const foto = (nome) => fotos[`../assets/provador/${nome}.webp`]

export const LOOKS = [
  { id: 'new-york', foto: foto('look-new-york'), pecaId: 'a123' },
  { id: 'listrada', foto: foto('look-listrada'), pecaId: 'a125' },
  { id: 'amarela', foto: foto('look-amarela'), pecaId: 'a124' },
  { id: 'poa', foto: foto('look-poa'), pecaId: 'a126' },
  { id: 'paete', foto: foto('look-paete'), pecaId: 'a115' },
].map((l) => ({ ...l, peca: buscarPeca(l.pecaId) }))
