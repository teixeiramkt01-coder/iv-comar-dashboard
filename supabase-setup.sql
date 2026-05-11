-- ═══════════════════════════════════════════════════
-- IV COMAR Dashboard — Setup do Banco Supabase
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════

-- 1. Tabela de status das tarefas
CREATE TABLE public.task_status (
  task_code   TEXT PRIMARY KEY,
  status      TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  TEXT
);

-- 2. Tabela de ocorrências
CREATE TABLE public.occurrences (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_code   TEXT NOT NULL,
  text        TEXT NOT NULL,
  date        TEXT NOT NULL,
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ativar Row Level Security (RLS)
ALTER TABLE public.task_status  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrences  ENABLE ROW LEVEL SECURITY;

-- 4. Políticas: apenas usuários autenticados podem ler e escrever
CREATE POLICY "auth_select_task_status" ON public.task_status
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_task_status" ON public.task_status
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_update_task_status" ON public.task_status
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_select_occurrences" ON public.occurrences
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_occurrences" ON public.occurrences
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_delete_occurrences" ON public.occurrences
  FOR DELETE TO authenticated USING (true);

-- ═══════════════════════════════════════════════════
-- CRIAÇÃO DE USUÁRIOS
-- Execute cada bloco abaixo separadamente no SQL Editor,
-- OU crie manualmente em: Authentication > Users > Add user
--
-- Email segue o padrão: [usuario]@ivcomar.fab
-- Exemplo: CPLG → cplg@ivcomar.fab
--
-- Após criar cada usuário pelo dashboard, execute o UPDATE
-- abaixo para definir o display_name e sector_id nos metadados.
-- ═══════════════════════════════════════════════════

-- Após criar o usuário cplg@ivcomar.fab no dashboard:
-- UPDATE auth.users
-- SET raw_user_meta_data = '{"display_name":"CPLG","sector_id":null}'
-- WHERE email = 'cplg@ivcomar.fab';

-- Após criar aaj@ivcomar.fab:
-- UPDATE auth.users
-- SET raw_user_meta_data = '{"display_name":"AAJ","sector_id":"AAJ"}'
-- WHERE email = 'aaj@ivcomar.fab';

-- Repita o padrão para todos os usuários abaixo.
-- sector_id null = acesso total (admin CPLG)
-- sector_id "XXX" = acesso restrito ao setor XXX

-- Lista completa de usuários e emails:
-- CPLG  → cplg@ivcomar.fab   | sector_id: null   (admin)
-- AAJ   → aaj@ivcomar.fab    | sector_id: "AAJ"
-- AREL  → arel@ivcomar.fab   | sector_id: "AREL"
-- ACS   → acs@ivcomar.fab    | sector_id: "ACS"
-- AI    → ai@ivcomar.fab     | sector_id: "AI"
-- ACP   → acp@ivcomar.fab    | sector_id: "ACP"
-- ARI   → ari@ivcomar.fab    | sector_id: "ARI"
-- SAE   → sae@ivcomar.fab    | sector_id: "SAE"
-- SAGS  → sags@ivcomar.fab   | sector_id: "SAGS"
-- SAT   → sat@ivcomar.fab    | sector_id: "SAT"
-- SAA   → saa@ivcomar.fab    | sector_id: "SAA"
-- SPL   → spl@ivcomar.fab    | sector_id: "SPL"
-- SGOV  → sgov@ivcomar.fab   | sector_id: "SGOV"
-- CPCA  → cpca@ivcomar.fab   | sector_id: "CPCA"
-- SEF   → sef@ivcomar.fab    | sector_id: "SEF"
-- PFV   → pfv@ivcomar.fab    | sector_id: "PFV"
-- SAD   → sad@ivcomar.fab    | sector_id: "SAD"
