# Design: Atalia Brechó, loja limpa e moderna

Segue o padrão das lojas de brechó online que funcionam: ThredUp e Modare (referências do PDF da Wirlla), Repassa e Enjoei. Fundo claro, uma única família de letra sem serifa, verde-oliva da logo nos botões e destaques, e as peças em primeiro plano.

> Histórico: "Cordel" e "O provador" foram testadas e descartadas. A cliente achou as duas pouco modernas e escolheu explicitamente o padrão do mercado (25/10/2026).

## Princípios
- **A peça é a protagonista.** Foto recortada sobre um fundo claro (`--tile`), tamanho em destaque no canto, nome, estado e preço.
- **Uma cor de ação:** o oliva da marca (`--oliva`) nos botões, selos e links. O resto é neutro.
- **IA com honestidade.** As fotos da modelo do Provador IA sempre levam o selo "Simulação por IA" e mostram a peça real ao lado.
- **Compra sem atrito.** "Adicionar" em todo card, a peça voa até a sacola e a sacola abre como gaveta lateral.

## Tokens (`src/index.css`)
| Token | Valor | Uso |
|---|---|---|
| `--fundo` | `#fbfaf7` | fundo da página |
| `--branco` | `#ffffff` | cabeçalho, faixas, gaveta |
| `--tile` | `#f3efe8` | fundo das fotos de produto e dos ícones |
| `--areia` | `#efe8dc` | banner principal |
| `--linha` | `#e6e0d6` | bordas e divisórias |
| `--tinta` / `--tinta-suave` | `#1f1b17` / `#6a6159` | texto |
| `--oliva` / `--oliva-escura` | `#5f5c1e` / `#4a4816` | botões, faixa de avisos, bloco de consignação |
| `--oliva-clara` | `#eceac9` | selos ("Nova com etiqueta"), item de menu ativo |
| `--raio` / `--raio-card` | `10px` / `14px` | cantos; blocos grandes usam 24px; botões em pílula |

## Tipografia
- **Figtree Variable** em tudo.
- **Títulos:** peso 700 e espaçamento de -0,025em. A palavra de ênfase vai em oliva, sem itálico.
- **Preços:** peso 750 e algarismos tabulares.

## Componentes
- **Cabeçalho:** faixa de avisos em oliva, depois logo, menu em pílulas, Instagram, WhatsApp e sacola. No celular, menu à esquerda e logo centralizada.
- **CardPeca** (`features/catalogo/CardPeca.jsx`) e a grade `.grade-pecas`, com 2 colunas no celular, 3 no tablet e 4 no computador (`.grade-pecas--4`).
- **Página inicial:** banner com duas fotos, atalhos de categoria em círculos, "Acabaram de chegar", faixa de vantagens, looks com a peça real em miniatura, bloco de consignação, galeria do Instagram e faixa do Avise-me.
- **Página da peça:** galeria com "A peça", "Foto original" e "No corpo (IA)" quando houver look; ficha com medidas; "Você também pode gostar".
- **Sacola:** botão "Adicionar" (`BotaoLevar`) com voo até o ícone e gaveta lateral (`Gaveta`, feita com `<dialog>`).

## Movimento
Discreto. Hover com leve zoom nas fotos, entrada suave das seções (`.revelar`, conteúdo visível sem JavaScript), voo da peça até a sacola e gaveta deslizando. Tudo é desligado com `prefers-reduced-motion`.

## Acessibilidade
Foco visível, alvos de toque com 44px ou mais, link "Pular para o conteúdo", e textos alternativos que dizem o que é foto real e o que é simulação por IA.
