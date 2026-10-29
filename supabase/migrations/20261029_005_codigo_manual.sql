-- =============================================================
-- Atalia Brechó: código (ID) informado à mão na importação em massa
-- Rode DEPOIS da 001 a 004, no SQL Editor do Supabase.
--
-- O código da peça continua nascendo sozinho (A101, A102...). Mas, quando a
-- planilha de importação traz um ID próprio, ele é gravado como veio.
-- Para que o contador automático nunca repita um ID já usado, este gatilho
-- empurra o contador para além de qualquer código "A<número>" informado.
-- =============================================================

create or replace function public.pecas_alinhar_codigo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_numero bigint;
  v_atual  bigint;
begin
  if new.codigo ~ '^A[0-9]{1,9}$' then
    v_numero := substr(new.codigo, 2)::bigint;
    select last_value into v_atual from public.pecas_codigo_seq;
    if v_numero >= v_atual then
      perform setval('public.pecas_codigo_seq', v_numero);
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.pecas_alinhar_codigo() from public, anon, authenticated;

drop trigger if exists pecas_alinha_codigo on public.pecas;
create trigger pecas_alinha_codigo
  before insert on public.pecas
  for each row execute function public.pecas_alinhar_codigo();

-- O código só aceita letras, números e hífen (sem espaços), até 20 caracteres.
-- NOT VALID: vale para peças novas e não reprova as que já existem.
alter table public.pecas drop constraint if exists pecas_codigo_formato;
alter table public.pecas
  add constraint pecas_codigo_formato check (codigo ~ '^[A-Za-z0-9-]{1,20}$') not valid;
