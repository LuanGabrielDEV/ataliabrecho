-- =============================================================
-- Atalia Brechó: catálogo (peças + fotos) e armazenamento
-- Rode DEPOIS da 001, no Supabase: SQL Editor > New query > Run
-- =============================================================

-- -------------------------------------------------------------
-- Peças. Cada peça é única: não existe quantidade, só status.
-- -------------------------------------------------------------
create sequence if not exists public.pecas_codigo_seq start 101;

create table if not exists public.pecas (
  id              uuid primary key default gen_random_uuid(),
  codigo          text not null unique default ('A' || nextval('public.pecas_codigo_seq')::text),
  titulo          text not null check (char_length(btrim(titulo)) between 3 and 90),
  descricao       text,
  categoria       text not null check (categoria in
                    ('vestidos','blusas-e-calcas','shorts-e-saias','praia-e-fitness','acessorios')),
  tamanho         text not null,
  preco           numeric(10,2) not null check (preco >= 0),
  preco_original  numeric(10,2) check (preco_original is null or preco_original >= 0),
  cor             text,
  condicao        text not null default 'otimo'
                    check (condicao in ('nova-com-etiqueta','otimo','bom')),
  tecido          text,
  observacao      text,
  -- em centímetros: { "busto": 88, "cintura": 74, "quadril": 96, "comprimento": 92, "ombro": 38, "manga": 58 }
  medidas         jsonb not null default '{}'::jsonb,
  status          text not null default 'disponivel'
                    check (status in ('disponivel','reservada','vendida','oculta')),
  reservada_ate   timestamptz,
  origem          text not null default 'propria' check (origem in ('propria','consignada')),
  consignadora    text,          -- nome de quem consignou (vira tabela própria na fase de consignação)
  destaque        boolean not null default false,
  chegou_em       date not null default current_date,
  vendida_em      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists pecas_vitrine_idx on public.pecas (status, chegou_em desc);
create index if not exists pecas_categoria_idx on public.pecas (categoria);

-- -------------------------------------------------------------
-- Fotos (arquivos no Storage, bucket "pecas")
-- -------------------------------------------------------------
create table if not exists public.peca_fotos (
  id            uuid primary key default gen_random_uuid(),
  peca_id       uuid not null references public.pecas (id) on delete cascade,
  caminho       text not null,                 -- caminho dentro do bucket "pecas"
  ordem         int not null default 0,        -- 0 = foto principal
  recortada     boolean not null default false, -- foto já sem fundo (PNG/WebP transparente)
  gerada_por_ia boolean not null default false, -- "Provador IA": aparece com selo de simulação
  alt           text,
  created_at    timestamptz not null default now()
);

create index if not exists peca_fotos_peca_idx on public.peca_fotos (peca_id, ordem);

-- -------------------------------------------------------------
-- Datas automáticas
-- -------------------------------------------------------------
drop trigger if exists pecas_updated_at on public.pecas;
create trigger pecas_updated_at
  before update on public.pecas
  for each row execute function public.tocar_updated_at();

create or replace function public.pecas_marcar_venda()
returns trigger language plpgsql as $$
begin
  if new.status = 'vendida' and old.status is distinct from 'vendida' then
    new.vendida_em := now();
  elsif new.status <> 'vendida' then
    new.vendida_em := null;
  end if;
  if new.status <> 'reservada' then
    new.reservada_ate := null;
  end if;
  return new;
end;
$$;

drop trigger if exists pecas_venda on public.pecas;
create trigger pecas_venda
  before update on public.pecas
  for each row execute function public.pecas_marcar_venda();

-- -------------------------------------------------------------
-- Regras de acesso
-- -------------------------------------------------------------
alter table public.pecas enable row level security;
alter table public.peca_fotos enable row level security;

drop policy if exists "público vê peças publicadas" on public.pecas;
create policy "público vê peças publicadas" on public.pecas
  for select to anon, authenticated
  using (status <> 'oculta' or public.is_admin());

drop policy if exists "admin gerencia peças" on public.pecas;
create policy "admin gerencia peças" on public.pecas
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "público vê fotos de peças publicadas" on public.peca_fotos;
create policy "público vê fotos de peças publicadas" on public.peca_fotos
  for select to anon, authenticated
  using (exists (select 1 from public.pecas p where p.id = peca_id and (p.status <> 'oculta' or public.is_admin())));

drop policy if exists "admin gerencia fotos" on public.peca_fotos;
create policy "admin gerencia fotos" on public.peca_fotos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------
-- Storage: bucket público "pecas" (leitura aberta, escrita só admin)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pecas', 'pecas', true)
on conflict (id) do nothing;

drop policy if exists "admin envia fotos" on storage.objects;
create policy "admin envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pecas' and public.is_admin());

drop policy if exists "admin altera fotos" on storage.objects;
create policy "admin altera fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'pecas' and public.is_admin());

drop policy if exists "admin apaga fotos" on storage.objects;
create policy "admin apaga fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pecas' and public.is_admin());

-- -------------------------------------------------------------
-- Avise-me: quem avisar quando esta peça chegou
-- -------------------------------------------------------------
create or replace function public.leads_para_peca(p_peca_id uuid)
returns setof public.leads
language sql
stable
security invoker
set search_path = public
as $$
  select l.*
  from leads l
  join pecas p on p.id = p_peca_id
  where l.ativo
    and p.tamanho = any (l.tamanhos)
    and (cardinality(l.categorias) = 0 or p.categoria = any (l.categorias))
  order by l.ultimo_aviso_em nulls first, l.created_at;
$$;
