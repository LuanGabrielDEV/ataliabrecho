# Atalia Brechó: site

React + Vite, Supabase e Vercel. O planejamento completo está em [`docs/PLANEJAMENTO.md`](docs/PLANEJAMENTO.md) e o guia visual em [`DESIGN.md`](DESIGN.md).

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # já vem com a URL e a chave pública do Supabase
npm run dev
```

## Configurar o Supabase (uma vez)

1. No painel do Supabase, abra **SQL Editor** e rode, **nesta ordem**:
   - `supabase/migrations/20261025_001_admin_e_leads.sql`
   - `supabase/migrations/20261026_002_pecas_e_fotos.sql`
   - `supabase/migrations/20261026_003_formularios.sql`
   - `supabase/migrations/20261029_004_seguranca.sql` (privacidade das peças consignadas, Avise-me e limites de envio)
   - `supabase/migrations/20261029_005_codigo_manual.sql` (aceita o ID informado na planilha de importação sem repetir códigos)
2. Em **Authentication > Users > Add user**, crie o usuário da Wirlla (e-mail e senha) e marque **Auto Confirm User**.
3. No **SQL Editor**, transforme esse usuário em administradora:
   ```sql
   insert into public.admins (user_id, nome)
   select id, 'Wirlla Dantas' from auth.users where email = 'ataliabrecho@gmail.com';
   ```
4. Em **Authentication > URL Configuration**, coloque o endereço do site (ex.: `https://ataliabrecho.vercel.app`) em *Site URL*. Isso faz o link de "Esqueci a senha" funcionar.
5. Em **Authentication > Sign In / Providers**, desligue **Allow new users to sign up**. Só a Wirlla deve ter conta.

## Painel da Wirlla: `/admin`

- **Peças:** cadastrar, editar, apagar, trocar status (disponível, reservada, vendida, oculta) direto na lista e buscar por nome ou código.
- **Fotos:** envio pelo celular. O site reduz a foto antes de enviar. Marque **Sem fundo** nas fotos recortadas e **Provador IA** nas fotos geradas por IA (essas ganham o selo de simulação).
- **Mensagens:** pedidos de consignação e parceria (com situação: nova, em contato, aceita, recusada) e mensagens do formulário de contato, com botão para responder pelo WhatsApp.
- **Avise-me:** lista de quem quer ser avisada, com filtro por tamanho. Depois de salvar uma peça, o botão **"Avisar quem pediu este tamanho"** mostra só as pessoas certas, e **Avisar** abre o WhatsApp com a mensagem pronta.

## Catálogo: demonstração ou peças reais

A variável `VITE_CATALOGO` decide de onde vêm as peças do site:

- `demo` (padrão): peças de demonstração, com as fotos reais e dados de exemplo.
- `supabase`: as peças cadastradas no painel.

Quando a Wirlla cadastrar as primeiras peças, troque para `supabase`, no `.env.local` e na Vercel.

## Publicar na Vercel

1. Importe o repositório do GitHub ("Add New > Project"). O framework Vite é detectado sozinho.
2. O `vercel.json` já define o build, o redirecionamento das rotas (`/admin`, `/peca/...`) e o cache dos arquivos estáticos.
3. Em **Settings > Environment Variables**, cadastre `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_CATALOGO`. Depois de alterar, faça **Redeploy** (as variáveis `VITE_*` entram no build).

## Importar várias peças de uma vez

No painel, aba **Importar**:

1. Baixe o modelo (`public/modelo-importacao-pecas.xlsx`): aba "Peças" com listas suspensas e aba "Instruções".
2. Uma peça por linha. A coluna **ID** é opcional (vazia = o sistema gera A128, A129...).
3. Salve as fotos com o ID no nome: `A127.jpg` (principal), `A127_2.jpg`, `A127_3.jpg`. Sufixos `_recorte` (sem fundo) e `_ia` (Provador IA). Peça sem ID: `linha5.jpg` (número da linha na planilha) ou o título exato.
4. Escolha a planilha e as fotos (ou a pasta) e confira a prévia. Só depois de confirmar as peças são gravadas.

Regras: sem foto real a linha não entra; ID que já existe é pulado (nada é sobrescrito); até 1000 linhas por planilha. A lógica fica em `src/admin/importacao.js` e a tela em `src/admin/Importar.jsx`.

## Fotos sem fundo (recorte)

O site mostra, nos cartões, a foto recortada sobre o fundo bege; na página da peça, a original. Dois jeitos de gerar o recorte, ambos gratuitos e mantendo a foto original:

- **No painel (navegador):** no cadastro da peça, botão **Tirar o fundo** em cada foto ou **Tirar o fundo de todas as fotos**; na aba **Importar**, a opção "Tirar o fundo da foto principal de cada peça". É feito no aparelho, uma foto por vez, e baixa um modelo de 40 a 80 MB na primeira vez. Usa `@imgly/background-removal`, de licença **AGPL-3.0**.
- **Script em lote (no seu computador):** `python scripts/recortar-fotos.py fotos/ recortes/` gera `A127_recorte.png` para cada foto principal, prontos para escolher junto das originais na aba Importar. Instalação: `pip install "rembg[cpu,cli]" pillow`. O script só aceita modelos de código livre (`isnet-general-use`, `birefnet-general`, `u2net`); o modelo `bria-rmbg` é proibido para uso comercial e fica bloqueado.

Recorte automático erra em renda, tule, alças finas e peça no cabide: sempre confira o resultado.

## Onde mexer

```
src/
  admin/               painel /admin (login, peças, fotos, avise-me)
  data/catalogo.jsx    carrega as peças (demo ou Supabase)
  data/historia.js     textos e fotos de "Nossa história"
  data/faq.js          perguntas frequentes
  pages/Politicas.jsx  privacidade, compras/trocas e termos de consignação
  data/pecasDemo.js    peças de demonstração
  config.js            WhatsApp, Instagram, e-mail
  features/            sacola, avise-me, card de produto
  pages/               páginas por rota
supabase/migrations/   SQL do banco (rodar em ordem)
```

## Links úteis

- `/avise-me` é o link para a bio do Instagram. Use `/avise-me?origem=instagram` para saber de onde veio cada contato.
- `/admin` é o painel da Wirlla.
