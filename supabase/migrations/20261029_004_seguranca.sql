-- =============================================================
-- Atalia Brechó: endurecimento de segurança e privacidade
-- Rode DEPOIS da 001, 002 e 003, no SQL Editor do Supabase
-- (como o papel padrão do editor; não precisa de nada especial).
--
-- O que muda:
--  1. O público (anon) só lê as colunas "seguras" de `pecas`.
--     Ficam de fora: consignadora, origem, medidas, datas internas.
--  2. Avise-me: a resposta não revela mais se o número já existia,
--     um cadastro repetido não troca o nome nem reativa quem saiu.
--  3. Limite global de envios nas três funções públicas (contra robôs
--     que chamam a API direto, trocando o número a cada envio).
--  4. As listas "quem avisar" ficam só para quem está logada.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Colunas públicas de `pecas`
--    Daqui para frente, uma coluna nova NÃO é pública por padrão:
--    para expor, é preciso incluí-la no GRANT abaixo.
-- -------------------------------------------------------------
revoke select on public.pecas from anon;

grant select (
  id, codigo, titulo, descricao, categoria, tamanho,
  preco, preco_original, cor, condicao, tecido, observacao,
  status, destaque, chegou_em, created_at
) on public.pecas to anon;

-- -------------------------------------------------------------
-- 2. Avise-me sem enumeração e sem reativação por terceiros
--    - Sempre devolve 'ok'.
--    - Número já cadastrado e ativo: só junta tamanhos e categorias.
--    - Número já cadastrado e inativo (pediu para sair): não muda nada.
--      A Wirlla reativa pelo painel, se a pessoa pedir.
--    - Nome e consentimento do primeiro cadastro nunca são sobrescritos.
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
  v_recentes int;
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
  if p_tamanhos is null or not (p_tamanhos <@ v_tamanhos_validos) then
    raise exception 'tamanho_invalido';
  end if;
  if not (coalesce(p_categorias, '{}') <@ v_categorias_validas) then
    raise exception 'categoria_invalida';
  end if;
  if char_length(coalesce(p_versao_politica, '')) not between 1 and 20 then
    raise exception 'versao_invalida';
  end if;

  -- freio global: no máximo 60 cadastros novos em 10 minutos
  select count(*) into v_recentes from leads
   where created_at > now() - interval '10 minutes';
  if v_recentes >= 60 then
    raise exception 'muitos_envios';
  end if;

  insert into leads (nome, whatsapp, tamanhos, categorias, consentimento,
                     versao_politica, origem)
  values (btrim(p_nome), p_whatsapp, p_tamanhos, coalesce(p_categorias, '{}'),
          true, p_versao_politica, left(coalesce(p_origem, 'site'), 40))
  on conflict (whatsapp) do update set
    tamanhos   = (select array_agg(distinct t) from unnest(leads.tamanhos || excluded.tamanhos) t),
    categorias = (select coalesce(array_agg(distinct c), '{}') from unnest(leads.categorias || excluded.categorias) c)
  where leads.ativo;

  return 'ok';
end;
$$;

revoke all on function public.registrar_aviso(text, text, text[], text[], boolean, text, text) from public;
grant execute on function public.registrar_aviso(text, text, text[], text[], boolean, text, text) to anon, authenticated;

-- -------------------------------------------------------------
-- 3. Limite global nas funções públicas de formulário
--    (além do limite por número/contato que já existia)
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
  v_total_recente int;
begin
  if p_aceite is not true then
    raise exception 'aceite_obrigatorio';
  end if;
  if not (coalesce(p_categorias, '{}') <@ array['vestidos','blusas-e-calcas','shorts-e-saias','praia-e-fitness','acessorios']) then
    raise exception 'categoria_invalida';
  end if;
  if char_length(coalesce(p_versao_termos, '')) not between 1 and 20 then
    raise exception 'versao_invalida';
  end if;

  -- freio por número: no máximo 3 em 10 minutos
  select count(*) into v_recentes from solicitacoes_consignacao
   where whatsapp = p_whatsapp and created_at > now() - interval '10 minutes';
  if v_recentes >= 3 then
    raise exception 'muitos_envios';
  end if;

  -- freio global: no máximo 30 em 10 minutos
  select count(*) into v_total_recente from solicitacoes_consignacao
   where created_at > now() - interval '10 minutes';
  if v_total_recente >= 30 then
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

create or replace function public.enviar_mensagem(p_nome text, p_contato text, p_assunto text, p_mensagem text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recentes int;
  v_total_recente int;
begin
  -- freio por contato: no máximo 3 em 10 minutos
  select count(*) into v_recentes from mensagens_contato
   where contato = btrim(p_contato) and created_at > now() - interval '10 minutes';
  if v_recentes >= 3 then
    raise exception 'muitos_envios';
  end if;

  -- freio global: no máximo 30 em 10 minutos
  select count(*) into v_total_recente from mensagens_contato
   where created_at > now() - interval '10 minutes';
  if v_total_recente >= 30 then
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

-- -------------------------------------------------------------
-- 4. "Quem avisar": só para quem está logada (e, pelo RLS, só admin
--    enxerga linhas). O anônimo nem consegue chamar.
-- -------------------------------------------------------------
revoke all on function public.leads_para_tamanho(text, text) from public, anon;
grant execute on function public.leads_para_tamanho(text, text) to authenticated;

revoke all on function public.leads_para_peca(uuid) from public, anon;
grant execute on function public.leads_para_peca(uuid) to authenticated;

-- -------------------------------------------------------------
-- Lembrete (fora do SQL): em Authentication > Sign In / Providers,
-- desligue "Allow new users to sign up". Só a Wirlla deve ter conta.
-- -------------------------------------------------------------
