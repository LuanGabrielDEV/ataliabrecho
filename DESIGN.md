# Design: Atalia Brechó, mundo "Cordel"

Na feira, o folheto de cordel fica pendurado num cordão, cada um único, até alguém levar. No site, as peças ficam penduradas na linha contínua da borboleta da logo.

## Princípios
- **Papel como chão, uma tinta por região.** Fundo de papel bege; o texto e os traços em tinta marrom; o verde-oliva funciona como segunda cor de impressão e domina regiões inteiras (como a faixa de consignação), nunca aparece como enfeite espalhado.
- **A peça é a protagonista.** As fotos reais nunca recebem filtro, a não ser a peça vendida, que fica dessaturada e carimbada.
- **Objetos do mundo, não ornamento:** cordão, prendedor, etiqueta de papel com furo e carimbo de borracha. Não usar gradiente, vidro, card genérico com sombra nem ícone emoji.

## Tokens (`src/index.css`)
| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#efe6d6` | fundo |
| `--papel-claro` | `#f8f2e7` | etiquetas, campos |
| `--papel-escuro` | `#e3d6c1` | fundo de foto carregando |
| `--tinta` | `#2f2017` | texto, botão principal, rodapé |
| `--tinta-suave` | `#5c4737` | texto secundário (≥ 6:1 sobre o papel) |
| `--marrom` | `#633922` | marrom da logo, hover dos botões |
| `--oliva` | `#8f8c22` | cordão, borboleta, numerais (só decorativo) |
| `--oliva-escuro` | `#55531a` | links, região de consignação, chips marcados |
| `--carimbo` | `#7a3420` | carimbo "Vendida" |
| `--linha` | `#d3c3aa` | réguas e bordas |
| `--raio` | `6px` | cantos de papel; pílula só nos chips |

## Tipografia
- **Cartaz:** Abril Fatface (`@fontsource/abril-fatface`), para títulos, preços, numerais e o menu do celular. É uma fat face de cartaz de tipografia de madeira, parente do traço de alto contraste da logo.
- **Texto e interface:** Figtree Variable (`@fontsource-variable/figtree`), pesos 400 a 700.
- Títulos com `text-wrap: balance`; tamanho máximo de 6rem.

## Componentes
- **Marca** (`src/components/Marca.jsx`): `LogoHorizontal`, `Borboleta` e `Simbolo`, vetorizados da logo oficial e coloridos via `currentColor`.
- **Cordão** (`features/cordel/Cordao.jsx`): o SVG do cordão é recalculado pela posição das peças e termina na cauda da borboleta. No celular rola de lado com o dedo.
- **Peça pendurada:** prendedor, foto 3:4, etiqueta de papel levemente girada (código, tamanho, título, preço em letra de cartaz) e botão "Pôr na sacola". Estados: disponível, na sacola, reservada (carimbo oliva), vendida (carimbo marrom com a foto dessaturada).
- **Carimbo:** "cai" sobre a foto uma única vez, quando a peça aparece na tela.
- **Botões:** `.botao` (tinta chapada), `.botao--vazado` e `.botao--papel` (sobre o oliva).
- **Avise-me:** faixa no rodapé que abre o formulário para cima, sem bloquear a tela, e a página própria `/avise-me`.

## Movimento
- **Assinatura:** o balanço do cordão. Ao arrastar, as peças giram até ±5° pelo prendedor e voltam com uma leve sobra de mola (`--mola`). É intencional, porque o pêndulo passa do ponto. É o único lugar onde se usa essa curva.
- O resto usa `--ease` (ease-out exponencial). Com `prefers-reduced-motion` ativado, todo o movimento é desligado.

## Acessibilidade
- Foco visível em oliva-escuro. Alvos de toque com 44px ou mais. Link "Pular para o conteúdo".
- O cordão é uma região rolável, focável e com rótulo. A foto é decorativa e o título da peça é o link.
