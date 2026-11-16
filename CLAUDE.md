# CLAUDE.md — Atalia Brechó

Site de um brechó de moda circular (Paulista/PE). Leia `PRODUCT.md` (marca, público, regras de conteúdo) e `DESIGN.md` (tokens e componentes) antes de mexer na interface.

## Como trabalhar
Planejar, enviar as opções e só então aplicar. Para mudanças que tocam 3+ arquivos, escreva um plano curto antes. Responder sempre em português do Brasil.

## 1. Stack
- **Front:** React 19, Vite 8, React Router 7, JavaScript (sem TypeScript), CSS puro por página/componente com tokens em `src/index.css`. Ícones: `lucide-react`. Fonte: Figtree Variable.
- **Dados:** Supabase (Postgres com RLS, Storage `pecas`, Auth do painel, RPCs, Edge Function `avisar-novo-cadastro`). Migrações em `supabase/migrations/`.
- **Catálogo:** `VITE_CATALOGO=demo` (peças em código) ou `supabase` (banco). Variáveis `VITE_*` entram no build: mudou, precisa de novo deploy.
- **Hospedagem:** Vercel (Hobby), deploy automático da branch `main`. Funções em `api/` (`peca.js` para prévia de links, `sitemap.js`). Rewrites em `vercel.json`.
- **Painel:** `/admin` (peças, importação em massa por Excel, avisos, mensagens, recorte de fundo no navegador).
- **Fora do escopo agora:** pagamento (Mercado Pago).

## 2. Comandos
- `npm run dev` — servidor local (http://localhost:5173).
- `npm run lint` — oxlint. Deve passar sem avisos novos.
- `npm run build` — build de produção em `dist/`.
- `npm run preview` — serve o build.
- Não há suíte de testes. Lógica crítica (importação, regras SQL) foi testada com scripts Node e um Postgres local; ao alterar, reteste do mesmo jeito.
- **Antes de concluir qualquer tarefa:** `npm run lint && npm run build`.

## 3. Regras
1. **Segurança:** nunca ler nem commitar `.env*`. Chave `service_role` jamais no front. O público (`anon`) só lê as colunas liberadas em `pecas` (GRANT por coluna). Formulários públicos passam por RPCs com limite de envios e campo honeypot. Nada de `dangerouslySetInnerHTML`; em `api/` escape todo texto antes de montar HTML.
2. **Validação:** valide entradas nas fronteiras (RPCs no SQL, `src/lib/formularios.js`, `src/admin/importacao.js`). Mensagens de erro em português, humanas e acionáveis.
3. **Conteúdo:** não inventar depoimentos, números de impacto nem clientes. Fotos geradas por IA sempre com o selo "Simulação por IA" e a peça real ao lado. Preços via `formatarPreco` (`src/config.js`).
4. **Design:** usar os tokens (`--oliva`, `--tile`, `--linha`...) em vez de hex soltos. A direção visual (limpa, moderna, estilo ThredUp/Repassa/Enjoei) foi escolhida pela cliente: não trocar de conceito. Uma só cor de ação (oliva). Sem aparência genérica de template de IA (sem gradientes roxos, sem blocos cheios de emoji, sem cards aninhados, sem texto de enchimento).
5. **Movimento:** discreto, sem `useState` em animação de ponteiro/scroll, e sempre desligado em `prefers-reduced-motion`.
6. **Acessibilidade e celular:** a maioria do público e a administradora usam celular. Alvos de toque ≥ 44px, foco visível, `font-size` ≥ 16px em campos (evita zoom no iPhone). Conferir em 390×844 e 1440×900, sem rolagem horizontal.
7. **SEO:** títulos e descrições por página via `usePagina` (`src/lib/seo.js`). Se o domínio mudar, o endereço fica em quatro arquivos (lista no README).
8. **Licenças:** não adicionar modelos ou bibliotecas com licença não comercial (ex.: `bria-rmbg` é CC BY-NC e está bloqueado).
9. **Git:** commits pequenos em português, direto na `main` só quando o usuário pedir push. Nunca `push --force`.

## 4. Mapa rápido
- `src/pages/` páginas públicas; `src/features/` catálogo, sacola, avise-me; `src/components/` cabeçalho, rodapé, perguntas.
- `src/data/` catálogo, demo, FAQ, história; `src/lib/` Supabase, SEO, formulários.
- `src/admin/` painel; `api/` funções da Vercel; `scripts/recortar-fotos.py` recorte em lote.
