# Atalia Brechó: site

React + Vite, Supabase e Netlify. O planejamento completo está em [`docs/PLANEJAMENTO.md`](docs/PLANEJAMENTO.md).

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # preencha com os dados do Supabase
npm run dev
```

Sem o `.env.local` o site roda em **modo demonstração**: os formulários funcionam, mas nada é salvo (aparece um aviso no console).

## Configurar o Supabase (uma vez)

1. Crie um projeto em supabase.com.
2. Abra **SQL Editor** e rode os arquivos de `supabase/migrations/` em ordem.
3. Em **Project Settings > API**, copie a *Project URL* e a *anon public key* para o `.env.local`.
4. Em **Authentication > Users**, crie o usuário da Wirlla e rode o `insert into public.admins …` que está no fim da migração.

## Publicar na Netlify

1. Suba o repositório no GitHub e importe na Netlify ("Add new site > Import from Git").
2. O `netlify.toml` já define o build (`npm run build`, pasta `dist`) e o redirecionamento das rotas do React Router.
3. Em **Site settings > Environment variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Estrutura

```
src/
  features/avise-me/   captação "Avise-me no meu tamanho" (faixa + formulário + serviço)
  pages/               páginas por rota
  lib/supabase.js      cliente do banco
  assets/marca/        logo e borboleta em WebP
supabase/migrations/   SQL do banco
docs/                  planejamento
PRODUCT.md             contexto do produto (usado pelas skills de design)
```

## Links úteis

- `/avise-me` é o link para a bio do Instagram. Use `/avise-me?origem=instagram` para saber de onde veio o contato.
