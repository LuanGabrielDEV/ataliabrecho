-- =============================================================
-- Atalia Brechó: formulários de consignação/parceria e contato
-- Rode DEPOIS da 001 e da 002, no SQL Editor do Supabase.
-- =============================================================

-- -------------------------------------------------------------
-- Solicitações de consignação (pessoas) e parceria (lojas)
-- -------------------------------------------------------------
create table if not exists public.solicitacoes_consignacao (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in ('pessoa','loja')),
  nome             text not null check (char_length(btrim(nome)) between 2 and 80),
  whatsapp         text not null check (whatsapp ~ '^55[1-9][0-9]9?[0-9]{8}$'),
  email            text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  cidade           text check (cidade is null or char_length(cidade) <= 80),
  empresa          text check (empresa is null or char_length(empresa) <= 80),
  instagram        text check (instagram is null or char_length(instagram) <= 60),
  quantidade       text not null check (quantidade in ('ate-10','10-30','mais-30')),
  categorias       text[] not null default '{}',
  mensagem         text check (mensagem is null or char_length(mensagem) <= 1000),
  aceite_termos    boolean not null check (aceite_termos),
  versao_termos    text not null,
  status           text not null default 'nova' check (status in ('nova','em-contato','aceita','recusada')),
  observacoes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Mensagens do formulário de contato
-- -------------------------------------------------------------
create table if not exists public.mensagens_contato (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null check (char_length(btrim(nome)) between 2 and 80),
  contato     text not null check (char_length(btrim(contato)) between 5 and 120), -- WhatsApp ou e-mail
  assunto     text not null check (assunto in ('compra','consignacao','parceria','mala','outro')),
  mensagem    text not null check (char_length(btrim(mensagem)) between 5 and 2000),
  status      text not null default 'nova' check (status in ('nova','respondida')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists solicitacoes_updated_at on public.solicitacoes_consignacao;
create trigger solicitacoes_updated_at before update on public.solicitacoes_consignacao
  for each row execute function public.tocar_updated_at();

drop trigger if exists mensagens_updated_at on public.mensagens_contato;
create trigger mensagens_updated_at before update on public.mensagens_contato
  for each row execute function public.tocar_updated_at();

-- -------------------------------------------------------------
-- Regras: o público só envia (pelas funções abaixo); só admin lê
-- -------------------------------------------------------------
alter table public.solicitacoes_consignacao enable row level security;
alter table public.mensagens_contato enable row level security;

drop policy if exists "admin gerencia solicitações" on public.solicitacoes_consignacao;
create policy "admin gerencia solicitações" on public.solicitacoes_consignacao
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin gerencia mensagens" on public.mensagens_contato;
create policy "admin gerencia mensagens" on public.mensagens_contato
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Envio público: consignação / parceria
-- -------------------------------------------------------------
create or replace function public.enviar_consignacao(
  p_tipo text, p_nome text, p_whatsapp text, p_email text, p_cidade text,
  p_empresa text, p_instagram text, p_quantidade text, p_categorias text[],
  p_mensagem text, p_aceite boolean, p_versao_termos text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recentes int;
begin
  if p_aceite is not true then
    raise exception 'aceite_obrigatorio';
  end if;
  if not (coalesce(p_categorias, '{}') <@ array['vestidos','blusas-e-calcas','shorts-e-saias','praia-e-fitness','acessorios']) then
    raise exception 'categoria_invalida';
  end if;
  -- freio simples contra envios repetidos do mesmo número
  select count(*) into v_recentes from solicitacoes_consignacao
   where whatsapp = p_whatsapp and created_at > now() - interval '10 minutes';
  if v_recentes >= 3 then
    raise exception 'muitos_envios';
  end if;

  insert into solicitacoes_consignacao
    (tipo, nome, whatsapp, email, cidade, empresa, instagram, quantidade, categorias, mensagem, aceite_termos, versao_termos)
  values
    (p_tipo, btrim(p_nome), p_whatsapp, nullif(btrim(p_email), ''), nullif(btrim(p_cidade), ''),
     nullif(btrim(p_empresa), ''), nullif(btrim(p_instagram), ''), p_quantidade, coalesce(p_categorias, '{}'),
     nullif(btrim(p_mensagem), ''), true, p_versao_termos)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.enviar_consignacao(text,text,text,text,text,text,text,text,text[],text,boolean,text) from public;
grant execute on function public.enviar_consignacao(text,text,text,text,text,text,text,text,text[],text,boolean,text) to anon, authenticated;

-- -------------------------------------------------------------
-- Envio público: contato
-- -------------------------------------------------------------
create or replace function public.enviar_mensagem(p_nome text, p_contato text, p_assunto text, p_mensagem text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recentes int;
begin
  select count(*) into v_recentes from mensagens_contato
   where contato = btrim(p_contato) and created_at > now() - interval '10 minutes';
  if v_recentes >= 3 then
    raise exception 'muitos_envios';
  end if;

  insert into mensagens_contato (nome, contato, assunto, mensagem)
  values (btrim(p_nome), btrim(p_contato), p_assunto, btrim(p_mensagem))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.enviar_mensagem(text,text,text,text) from public;
grant execute on function public.enviar_mensagem(text,text,text,text) to anon, authenticated;
