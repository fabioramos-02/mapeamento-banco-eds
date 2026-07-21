-- Consultas de verificação — Banco Controlador (controlador_prd) · acesso somente leitura
-- Geradas em 21/07/2026 pelo mapeamento-banco-eds

-- 1. Contagem aproximada e instantânea de todas as tabelas
SELECT relname AS tabela, n_live_tup AS registros_aprox
FROM pg_stat_user_tables ORDER BY n_live_tup DESC;

-- 2. Tabelas sem uso (zero registros) — usa contagem exata
SELECT c.relname AS tabela
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND NOT EXISTS (SELECT 1 FROM pg_stat_user_tables s WHERE s.relid = c.oid AND s.n_live_tup > 0)
ORDER BY 1;

-- 3. Tamanho em disco por tabela
SELECT relname AS tabela, pg_size_pretty(pg_total_relation_size(relid)) AS tamanho
FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;

-- 4. Amostra de dados por tabela (uma consulta por tabela, LIMIT 100)
SELECT * FROM public."authentication_historicologin" LIMIT 100;  -- 17.752.457 registros
SELECT * FROM public."authentication_tokengovbr" LIMIT 100;  -- 9.086.140 registros
SELECT * FROM public."authentication_acessossistemagsi" LIMIT 100;  -- 6.086.115 registros
SELECT * FROM public."django_session" LIMIT 100;  -- 3.685.749 registros
SELECT * FROM public."auth_codigo_govbr" LIMIT 100;  -- 1.950.925 registros
SELECT * FROM public."oauth2_provider_grant" LIMIT 100;  -- 1.711.756 registros
SELECT * FROM public."authentication_acessousuario" LIMIT 100;  -- 1.381.572 registros
SELECT * FROM public."pessoa_pessoa" LIMIT 100;  -- 951.765 registros
SELECT * FROM public."pessoa_contato" LIMIT 100;  -- 951.721 registros
SELECT * FROM public."authentication_user" LIMIT 100;  -- 951.708 registros
SELECT * FROM public."authentication_user_groups" LIMIT 100;  -- 932.870 registros
SELECT * FROM public."authentication_confirmarlogin" LIMIT 100;  -- 225.686 registros
SELECT * FROM public."authentication_errosgovbr" LIMIT 100;  -- 40.091 registros
SELECT * FROM public."authentication_empresa_users" LIMIT 100;  -- 28.221 registros
SELECT * FROM public."authentication_empresa" LIMIT 100;  -- 27.949 registros
SELECT * FROM public."authentication_assinaturagovbr" LIMIT 100;  -- 13.969 registros
SELECT * FROM public."pessoa_fotos" LIMIT 100;  -- 6.711 registros
SELECT * FROM public."authentication_sucessogovbr" LIMIT 100;  -- 5.702 registros
SELECT * FROM public."authentication_favoritossistemagsi" LIMIT 100;  -- 3.776 registros
SELECT * FROM public."authentication_confirmarassinatura" LIMIT 100;  -- 563 registros
SELECT * FROM public."authentication_assinatura" LIMIT 100;  -- 527 registros
SELECT * FROM public."authentication_usuarioorgao" LIMIT 100;  -- 234 registros
SELECT * FROM public."auth_permission" LIMIT 100;  -- 172 registros
SELECT * FROM public."django_migrations" LIMIT 100;  -- 101 registros
SELECT * FROM public."oauth2_provider_application" LIMIT 100;  -- 56 registros
SELECT * FROM public."django_content_type" LIMIT 100;  -- 43 registros
SELECT * FROM public."authentication_orgaos" LIMIT 100;  -- 42 registros
SELECT * FROM public."authentication_assinaturaredirecionamento" LIMIT 100;  -- 17 registros
SELECT * FROM public."auth_group" LIMIT 100;  -- 5 registros
SELECT * FROM public."rest_framework_api_key_apikey" LIMIT 100;  -- 5 registros
SELECT * FROM public."authentication_confirmarcodigo" LIMIT 100;  -- 3 registros
SELECT * FROM public."authentication_configuracoes" LIMIT 100;  -- 1 registros
SELECT * FROM public."authentication_gsiapp" LIMIT 100;  -- 1 registros
SELECT * FROM public."auth_group_permissions" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_confirmaremail" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_falhalogin" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_redefinirsenha" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_termos" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_termosassinado" LIMIT 100;  -- 0 registros
SELECT * FROM public."authentication_user_user_permissions" LIMIT 100;  -- 0 registros
SELECT * FROM public."crm_emailmarketing" LIMIT 100;  -- 0 registros
SELECT * FROM public."django_admin_log" LIMIT 100;  -- 0 registros
SELECT * FROM public."oauth2_provider_accesstoken" LIMIT 100;  -- 0 registros
SELECT * FROM public."oauth2_provider_refreshtoken" LIMIT 100;  -- 0 registros
SELECT * FROM public."pessoa_anexos" LIMIT 100;  -- 0 registros
SELECT * FROM public."pessoa_cidades" LIMIT 100;  -- 0 registros
SELECT * FROM public."pessoa_confirmaremail" LIMIT 100;  -- 0 registros
SELECT * FROM public."pessoa_endereco" LIMIT 100;  -- 0 registros