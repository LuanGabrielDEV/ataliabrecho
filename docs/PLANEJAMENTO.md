# Atalia Brechó: planejamento do site

> Versão 2 do planejamento (25/10/2026). Entrega, parceria e captação de contatos definidas.

## 1. Público e propósito

- **Quem chega:** mulheres de Paulista/PE (Janga e arredores) e da Região Metropolitana do Recife. A maioria vem do Instagram e do WhatsApp pelo celular e procura roupa bonita, selecionada e barata. Um segundo público quer desapegar de roupas e ganhar dinheiro com elas (consignação).
- **O que precisam fazer:** achar uma peça no seu tamanho e com as medidas certas, ter confiança no estado dela, pagar e combinar a entrega ou retirada.
- **Verdade da marca:** cada peça é **única** e chega com curadoria de uma bióloga que fala de consumo consciente. Isso a diferencia de loja de departamento e de marketplace genérico.
- **Modo:** páginas de marca (Início, História, Consigne) = *Persuade*; Catálogo e Checkout = *Operate*; Painel /admin = *Operate*.

## 2. Stack e infraestrutura

| Camada | Escolha |
|---|---|
| Front | React + Vite + React Router |
| Hospedagem | Netlify (deploy pelo GitHub) |
| Banco, fotos e login | Supabase (Postgres + Storage + Auth) |
| Pagamento | Mercado Pago (Checkout Pro: Pix, cartão e boleto). Conta da Atalia ainda vai ser criada, então a v1 usa **modo de teste** |
| Funções de servidor | Netlify Functions: criar preferência de pagamento, receber webhook, enviar e-mail dos formulários |
| Atendimento | WhatsApp (links `wa.me` com mensagem pronta) |

## 3. Escopo

### Fase 1: núcleo
- **Início:** banner principal, vantagens, peças recém-chegadas, chamada para consignação, faixa de captação de contatos.
- **Comprar peças (catálogo):** categorias (Vestidos, Blusas e Calças, Shorts e Saias, Moda Praia e Fitness, Acessórios), filtros (tamanho, cor, estado, preço), página da peça com fotos, medidas e status.
- **Sacola + checkout** Mercado Pago, com reserva temporária da peça.
- **Consigne / Seja parceira:** uma página só, porque a parceria com lojas e empreendedoras segue o mesmo modelo da consignação (50/50, 60 dias, repasse em até 7 dias úteis). O formulário pergunta se quem envia é pessoa física ou loja/empreendedora.
- **Avise-me no meu tamanho:** faixa discreta no rodapé, mais a página `/avise-me` para o link da bio do Instagram. ✅ Construído.
- **Dúvidas frequentes + Contato:** formulário enviado para ataliabrecho@gmail.com, WhatsApp, Instagram e Facebook.
- **Políticas e termos:** privacidade (LGPD), trocas e devoluções, termos de consignação.
- **Painel /admin:** peças, fotos, status, pedidos, consignadoras, repasses, formulários recebidos, contatos captados, bairros de entrega.

### Fase 2
Mala Atalia, Nossa história, Moda circular e impacto, **Estações Atalia**, **Depoimentos** e **Mentoria**.

### Fora do escopo
Programa de trocas por crédito (substituído pela consignação), blog e envio nacional.

## 4. Entrega
- **Retirada combinada:** grátis, com ponto combinado pelo WhatsApp.
- **Entrega por Uber:** não existe taxa fixa. O valor depende da corrida no momento, então o checkout cobra **só as peças** e a entrega é combinada e paga à parte pelo WhatsApp. Na hora de pagar, a cliente vê o aviso "valor da entrega combinado pelo WhatsApp conforme a corrida".

## 5. Fotos
- Foto real (manequim) sempre como **primeira** imagem.
- Fotos de "Provadores IA" aparecem depois, com o selo **"Simulação por IA"** e o aviso "a peça real está nas fotos anteriores".

## 6. Banco de dados (Supabase)

Cada peça é única, então não existe quantidade em estoque, só **status**.

| Tabela | Campos principais |
|---|---|
| `categorias` | nome, slug, ordem |
| `pecas` | código (#A123), título, slug, descrição, categoria_id, marca, tamanho, medidas (jsonb: busto, cintura, quadril, comprimento, ombro), preço, preço_original, condição (nova com etiqueta / ótimo / bom), cor, tecido, status (`disponivel` / `reservada` / `vendida` / `oculta`), reservada_ate, origem (`propria` / `consignada`), consignacao_id, destaque, created_at, vendida_em |
| `peca_fotos` | peca_id, caminho no Storage, ordem, alt, **gerada_por_ia** (bool) |
| `consignadoras` | nome, WhatsApp, e-mail, chave Pix |
| `consignacoes` | consignadora_id, data_entrada, data_limite (+60 dias), versao_termos, status |
| `repasses` | peca_id, consignadora_id, valor_venda, valor_repasse (50%), data_venda, prazo (7 dias úteis), pago_em |
| `pedidos` | código, nome, WhatsApp, e-mail, tipo_entrega (`retirada` / `uber`), bairro e endereço (texto), total das peças, valor_entrega_combinado (preenchido depois, no painel), status (`aguardando_pagamento` / `pago` / `cancelado` / `entregue`), mp_preference_id, created_at |
| `itens_pedido` | pedido_id, peca_id, preço no momento da compra |
| `pagamentos` | pedido_id, mp_payment_id, método, status, valor, payload do webhook |
| `solicitacoes_consignacao` | tipo (`pessoa` / `loja`), nome, empresa/loja, Instagram, WhatsApp, cidade/bairro, qtd aproximada, tipos de peça, fotos, aceite dos termos, status |
| `mensagens_contato` | nome, contato, assunto, mensagem, status |
| `leads` ✅ | nome, WhatsApp (único), tamanhos, categorias de interesse, consentimento + data + versão da política, origem (faixa / página / instagram), ativo, último aviso |
| `admins` ✅ | user_id, nome (quem acessa o painel) |
| `faq` | pergunta, resposta, categoria, ordem |
| *(fase 2)* `pedidos_mala`, `estacoes`, `depoimentos` | |

**Regras (RLS):** o público lê peças não ocultas, categorias e FAQ, e só **insere** pedidos, formulários e leads. Leads entram pela função `registrar_aviso`, que valida os dados e junta os tamanhos se o WhatsApp já existir. Todo o resto exige login de administradora.

**Automações:**
- reserva expira em 15 min sem pagamento e a peça volta a ficar disponível;
- webhook de pagamento aprovado marca a peça como vendida e cria o repasse se ela for consignada;
- o painel alerta sobre consignações perto dos 60 dias e repasses perto do prazo.

## 7. Identidade
- Paleta a partir da logo: verde-oliva, bege/nude, marrom terroso e um toque dourado.
- A borboleta em traço contínuo serve como elemento gráfico (divisórias, estados vazios, carregamento).
- Mensagens: "Moda com propósito.", "O novo nem sempre precisa ser novo." e "Cada peça pode ganhar uma nova história."
- **Direção visual atual: O provador** (ver `DESIGN.md`): cortinas de linho guiadas pela rolagem, espelho com a peça real, araras de latão, sacola em gaveta. Substituiu a direção anterior, (ver `DESIGN.md`). As peças ficam penduradas na linha da borboleta, com letra de cartaz, etiquetas de papel e carimbo "Vendida". ✅ Página inicial construída.

## 8. Pendências
- [x] Entrega: retirada ou Uber com valor combinado na hora.
- [x] Captação de contatos: "Avise-me no meu tamanho".
- [ ] Conta Mercado Pago da Atalia (até lá, modo teste).
- [ ] Reenviar as 4 fotos corrompidas: ROKU5828, SGMQ6854, GHDC6281, JNJC3608.
- [ ] Número de WhatsApp da Atalia, links do Instagram e do Facebook (hoje são marcadores em `src/config.js`) e domínio.
- [ ] Termos de consignação vigentes (texto oficial).

## 9. Captação de contatos: "Avise-me no meu tamanho" ✅
- **Faixa no rodapé:** aparece 2,5 s depois de abrir o site, sem bloquear nada. Ao tocar, abre o formulário para cima; se fechar, some por 7 dias; depois do cadastro, não aparece mais.
- **Página `/avise-me`:** para a bio do Instagram e os status do WhatsApp. Aceita `?origem=instagram` para saber de onde veio cada contato.
- **Campos:** nome, WhatsApp com máscara, tamanhos (PP a XG e 34 a 48), categorias de interesse (opcional) e consentimento LGPD obrigatório.
- **Uso no dia a dia:** quando chega uma peça M, o painel lista quem pediu M (função `leads_para_tamanho`) e a Wirlla chama pelo WhatsApp. Quem responder "sair" é marcado como inativo.
