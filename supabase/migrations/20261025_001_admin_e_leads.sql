-- =============================================================
-- Atalia Brechó: administradoras + captação "Avise-me"
-- Rode no Supabase: SQL Editor > New query > colar > Run
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- Administradoras (quem pode ver e editar dados no painel)
-- -------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nome       text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admin lê admins" on public.admins;
create policy "admin lê admins" on public.admins
  for select to authenticated using (public.is_admin());

-- -------------------------------------------------------------
-- Leads: "Avise-me quando chegar peça no meu tamanho"
-- -------------------------------------------------------------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null check (char_length(btrim(nome)) between 2 and 80),
  -- formato E.164 sem "+": 55 + DDD + número (ex.: 5581999998888)
  whatsapp          text not null unique check (whatsapp ~ '^55[1-9][0-9]9?[0-9]{8}$'),
  tamanhos          text[] not null check (cardinality(tamanhos) between 1 and 20),
  categorias        text[] not null default '{}',
  consentimento     boolean not null check (consentimento),
  consentimento_em  timestamptz not null default now(),
  versao_politica   text not null,
  origem            text not null default 'site',   -- faixa, pagina, instagram, inicio...
  ativo             boolean not null default true,  -- false = pediu para sair
  ultimo_aviso_em   timestamptz,
  observacoes       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists leads_tamanhos_idx   on public.leads using gin (tamanhos);
create index if not exists leads_categorias_idx on public.leads using gin (categorias);

alter table public.leads enable row level security;

-- O público NÃO lê nem escreve direto na tabela: só pela função abaixo.
drop policy if exists "admin gerencia leads" on public.leads;
create policy "admin gerencia leads" on public.leads
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.tocar_updated_at();

-- -------------------------------------------------------------
-- Cadastro público. Se o WhatsApp já existe, junta os tamanhos e
-- as categorias, reativa o contato e devolve 'atualizado'.
-- Nunca devolve dados de outras pessoas.
-- -------------------------------------------------------------
create or replace function public.registrar_aviso(
  p_nome            text,
  p_whatsapp        text,
  p_tamanhos        text[],
  p_categorias      text[],
  p_consentimento   boolean,
  p_versao_politica text,
  p_origem          text default 'site'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existia boolean;
  v_tamanhos_validos text[] := array[
    'PP','P','M','G','GG','XG',
    '34','36','38','40','42','44','46','48',
    'Único'
  ];
  v_categorias_validas text[] := array[
    'vestidos','blusas-e-calcas','shorts-e-saias','praia-e-fitness','acessorios'
  ];
begin
  if p_consentimento is not true then
    raise exception 'consentimento_obrigatorio';
  end if;
  if not (p_tamanhos <@ v_tamanhos_validos) then
    raise exception 'tamanho_invalido';
  end if;
  if not (coalesce(p_categorias, '{}') <@ v_categorias_validas) then
    raise exception 'categoria_invalida';
  end if;

  select exists (select 1 from leads where whatsapp = p_whatsapp) into v_existia;

  insert into leads (nome, whatsapp, tamanhos, categorias, consentimento,
                     versao_politica, origem)
  values (btrim(p_nome), p_whatsapp, p_tamanhos, coalesce(p_categorias, '{}'),
          true, p_versao_politica, left(coalesce(p_origem, 'site'), 40))
  on conflict (whatsapp) do update set
    nome             = excluded.nome,
    tamanhos         = (select array_agg(distinct t) from unnest(leads.tamanhos || excluded.tamanhos) t),
    categorias       = (select coalesce(array_agg(distinct c), '{}') from unnest(leads.categorias || excluded.categorias) c),
    consentimento    = true,
    consentimento_em = now(),
    versao_politica  = excluded.versao_politica,
    ativo            = true;

  return case when v_existia then 'atualizado' else 'novo' end;
end;
$$;

revoke all on function public.registrar_aviso(text, text, text[], text[], boolean, text, text) from public;
grant execute on function public.registrar_aviso(text, text, text[], text[], boolean, text, text) to anon, authenticated;

-- -------------------------------------------------------------
-- Painel: quem avisar quando uma peça de tamanho X chegar
-- (quando a tabela de peças existir, ganha uma versão por peca_id)
-- -------------------------------------------------------------
create or replace function public.leads_para_tamanho(p_tamanho text, p_categoria text default null)
returns setof public.leads
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from leads
  where ativo
    and p_tamanho = any (tamanhos)
    and (p_categoria is null or cardinality(categorias) = 0 or p_categoria = any (categorias))
  order by ultimo_aviso_em nulls first, created_at;
$$;

-- -------------------------------------------------------------
-- Depois de criar o usuário da Wirlla em Authentication > Users,
-- rode (trocando o e-mail):
--   insert into public.admins (user_id, nome)
--   select id, 'Wirlla Dantas' from auth.users where email = 'wirlla.lima@gmail.com';
-- -------------------------------------------------------------
