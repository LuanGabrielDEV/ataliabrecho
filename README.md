# Atalia Brechó: site

React + Vite, Supabase e Netlify. O planejamento completo está em [`docs/PLANEJAMENTO.md`](docs/PLANEJAMENTO.md) e o guia visual em [`DESIGN.md`](DESIGN.md).

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
2. Em **Authentication > Users > Add user**, crie o usuário da Wirlla (e-mail e senha) e marque **Auto Confirm User**.
3. No **SQL Editor**, transforme esse usuário em administradora:
   ```sql
   insert into public.admins (user_id, nome)
   select id, 'Wirlla Dantas' from auth.users where email = 'ataliabrecho@gmail.com';
   ```
4. Em **Authentication > URL Configuration**, coloque o endereço do site (ex.: `https://ataliabrecho.netlify.app`) em *Site URL*. Isso faz o link de "Esqueci a senha" funcionar.
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

Quando a Wirlla cadastrar as primeiras peças, troque para `supabase`, no `.env.local` e na Netlify.

## Publicar na Netlify

1. Importe o repositório do GitHub ("Add new site > Import from Git").
2. O `netlify.toml` já define o build e o redirecionamento das rotas.
3. Em **Site settings > Environment variables**, cadastre `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_CATALOGO`.

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
