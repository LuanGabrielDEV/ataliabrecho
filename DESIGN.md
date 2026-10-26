# Design: Atalia Brechó, mundo "O provador"

Comprar roupa é experimentar, e o site funciona como uma cabine de provador. Cortinas de linho verde-oliva se abrem e revelam cada look; no espelho aparece a peça real. As peças ficam penduradas em cabides, numa arara de latão.

> Substituiu a direção "Cordel" em 25/10/2026. A cliente achou o visual anterior simples: faltava movimento, sofisticação e fotos melhores.

## Princípios
- **A cortina é a única grande massa de cor.** O linho oliva aparece só nas cortinas e na faixa de consignação. O resto é parede nude e tinta.
- **A peça sempre recortada.** As fotos reais ficam sem fundo (`src/assets/recortes`), penduradas em cabides ou dentro do espelho. A foto original continua disponível na página da peça ("Foto original").
- **IA com honestidade.** A modelo do Provador IA sempre traz o selo "Simulação por IA", e a peça real aparece ao lado, no espelho.
- **Latão como acabamento:** varão da cortina, tubo da arara, cabide e moldura do espelho.

## Tokens (`src/index.css`)
| Token | Valor | Uso |
|---|---|---|
| `--parede` | `#f2ebe1` | fundo |
| `--parede-clara` | `#faf6f0` | superfícies, gaveta, etiquetas |
| `--parede-funda` | `#e6dbcb` | fundo da cabine |
| `--linho` / `--linho-escuro` / `--linho-claro` | `#6b6830` / `#4f4d1f` / `#8c8946` | cortinas, ênfase em itálico, hover de botão |
| `--latao` / `--latao-escuro` | `#b08d4f` / `#8a6c36` | varões, araras, cabides, moldura do espelho, rótulos pequenos |
| `--tinta` / `--tinta-suave` | `#2a1f18` / `#5e4c3f` | texto, botões |
| `--raio` | `4px` | etiquetas e botões; arco só no espelho |

## Tipografia
- **Títulos:** Bodoni Moda Variable (`@fontsource-variable/bodoni-moda`, com eixo óptico e itálico). Peso 500. O *itálico em linho* marca a palavra que importa ("ser *novo*", "nos *provadores*").
- **Texto e interface:** Figtree Variable.
- **Rótulos pequenos** (provador, código, Instagram): caixa alta, espaçamento de 0,14em, cor de latão escuro.

## Componentes
- **Provador** (`features/provador/Provador.jsx`), com dois modos. Em `abertura`, a cortina se abre sozinha ao carregar. Em `rolagem`, a seção tem 190svh, o palco fica fixo na tela e a cortina abre conforme a rolagem (`--p` vai de 0 a 1 e o CSS deriva `--abre` e `--mostra`).
- **Espelho em arco:** moldura dupla de latão e um único reflexo diagonal.
- **Peça no cabide** (`features/arara/PecaNoCabide.jsx`) e **Arara** horizontal com balanço ao arrastar. No catálogo, a grade `.araras` desenha um tubo de latão por fileira.
- **Botão "Levar esta"** (`features/sacola/BotaoLevar.jsx`): a peça voa até a sacola (`voarParaSacola.js`, com a Web Animations API) e o ícone dá um pulo.
- **Gaveta da sacola** (`features/sacola/Gaveta.jsx`): um `<dialog>` que desliza da direita.

## Movimento
- **Assinatura:** as cortinas guiadas pela rolagem e a peça que voa para a sacola.
- **Mola (`--mola`):** usada só no balanço dos cabides e no pulo da sacola. É intencional, porque um pêndulo passa do ponto. O detector marca isso como aviso, e foi aceito.
- **Entradas:** `.revelar`, um assentamento suave. O conteúdo já é visível sem JavaScript.
- **Troca de página:** View Transitions (`viewTransition` nos links do React Router).
- Com `prefers-reduced-motion`, a cortina já aparece aberta e não há voo nem animações.

## Avisos aceitos do detector
- `bounce-easing`: a curva `--mola`, explicada acima.
- `side-tab` em `.consigne::before`: é o varão de latão sobre a faixa de linho, um objeto do mundo, não uma faixa decorativa.

## Acessibilidade
- Foco visível, alvos de toque com 44px ou mais, link "Pular para o conteúdo".
- Texto alternativo diz o que é real ("foto real da peça") e o que é simulação ("modelo gerada por IA").
- A gaveta usa um `<dialog>` nativo: foco preso enquanto aberta, Esc fecha.
