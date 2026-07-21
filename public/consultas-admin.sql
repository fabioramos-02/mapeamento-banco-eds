-- Consultas de verificação — Banco EDS (admin_prd) · acesso somente leitura
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
SELECT * FROM public."gerenciamento_termosassinado" LIMIT 100;  -- 431.650 registros
SELECT * FROM public."auth_user" LIMIT 100;  -- 418.906 registros
SELECT * FROM public."gerenciamento_historicoservico" LIMIT 100;  -- 25.626 registros
SELECT * FROM public."gerenciamento_servicosunidade" LIMIT 100;  -- 17.168 registros
SELECT * FROM public."gerenciamento_avaliacaoinformacaoservicos" LIMIT 100;  -- 10.956 registros
SELECT * FROM public."gerenciamento_revisaoservico" LIMIT 100;  -- 7.551 registros
SELECT * FROM public."gerenciamento_jornada" LIMIT 100;  -- 5.045 registros
SELECT * FROM public."gerenciamento_votosservicos" LIMIT 100;  -- 3.095 registros
SELECT * FROM public."gerenciamento_tasks" LIMIT 100;  -- 2.407 registros
SELECT * FROM public."gerenciamento_servicos" LIMIT 100;  -- 1.521 registros
SELECT * FROM public."gerenciamento_accesstoken" LIMIT 100;  -- 1.438 registros
SELECT * FROM public."django_session" LIMIT 100;  -- 1.208 registros
SELECT * FROM public."gerenciamento_unidades" LIMIT 100;  -- 891 registros
SELECT * FROM public."gerenciamento_servicoserros" LIMIT 100;  -- 715 registros
SELECT * FROM public."gerenciamento_servicosfavoritos" LIMIT 100;  -- 625 registros
SELECT * FROM public."auth_user_groups" LIMIT 100;  -- 623 registros
SELECT * FROM public."gerenciamento_setor" LIMIT 100;  -- 537 registros
SELECT * FROM public."gerenciamento_horariounidade" LIMIT 100;  -- 520 registros
SELECT * FROM public."auth_permission" LIMIT 100;  -- 472 registros
SELECT * FROM public."gerenciamento_sistemasinstitucionaisfavoritos" LIMIT 100;  -- 395 registros
SELECT * FROM public."django_migrations" LIMIT 100;  -- 306 registros
SELECT * FROM public."authtoken_token" LIMIT 100;  -- 220 registros
SELECT * FROM public."gerenciamento_usuarioorgao" LIMIT 100;  -- 214 registros
SELECT * FROM public."gerenciamento_setorunidade" LIMIT 100;  -- 206 registros
SELECT * FROM public."django_content_type" LIMIT 100;  -- 118 registros
SELECT * FROM public."gerenciamento_cidades" LIMIT 100;  -- 79 registros
SELECT * FROM public."gerenciamento_gestororgao" LIMIT 100;  -- 61 registros
SELECT * FROM public."gerenciamento_topicos" LIMIT 100;  -- 50 registros
SELECT * FROM public."gerenciamento_orgaos" LIMIT 100;  -- 42 registros
SELECT * FROM public."gerenciamento_enderecoorgao" LIMIT 100;  -- 41 registros
SELECT * FROM public."gerenciamento_contatoorgao" LIMIT 100;  -- 40 registros
SELECT * FROM public."gerenciamento_servicosinternos" LIMIT 100;  -- 35 registros
SELECT * FROM public."gerenciamento_respostasavaliacao" LIMIT 100;  -- 31 registros
SELECT * FROM public."atendimento_respostas" LIMIT 100;  -- 27 registros
SELECT * FROM public."gerenciamento_temas" LIMIT 100;  -- 23 registros
SELECT * FROM public."gerenciamento_feriados" LIMIT 100;  -- 14 registros
SELECT * FROM public."gerenciamento_horarioatendimento" LIMIT 100;  -- 11 registros
SELECT * FROM public."atendimento_topicos" LIMIT 100;  -- 10 registros
SELECT * FROM public."gerenciamento_orgaosites" LIMIT 100;  -- 10 registros
SELECT * FROM public."gerenciamento_guiches" LIMIT 100;  -- 8 registros
SELECT * FROM public."auth_group" LIMIT 100;  -- 7 registros
SELECT * FROM public."core_profilehierarchy_can_grant_profiles" LIMIT 100;  -- 7 registros
SELECT * FROM public."core_profilehierarchy_can_remove_profiles" LIMIT 100;  -- 7 registros
SELECT * FROM public."gerenciamento_aplicativos" LIMIT 100;  -- 6 registros
SELECT * FROM public."gerenciamento_guiches_user" LIMIT 100;  -- 6 registros
SELECT * FROM public."gerenciamento_guicheservico" LIMIT 100;  -- 6 registros
SELECT * FROM public."gerenciamento_termos" LIMIT 100;  -- 6 registros
SELECT * FROM public."atendimento_avaliacaoonline" LIMIT 100;  -- 5 registros
SELECT * FROM public."gerenciamento_filahorarios" LIMIT 100;  -- 5 registros
SELECT * FROM public."gerenciamento_temposervicofila" LIMIT 100;  -- 5 registros
SELECT * FROM public."gerenciamento_unidadeusuarios" LIMIT 100;  -- 5 registros
SELECT * FROM public."atendimento_observacao" LIMIT 100;  -- 4 registros
SELECT * FROM public."core_profilehierarchy" LIMIT 100;  -- 4 registros
SELECT * FROM public."gerenciamento_avaliacao" LIMIT 100;  -- 3 registros
SELECT * FROM public."gerenciamento_perguntasavaliacao" LIMIT 100;  -- 3 registros
SELECT * FROM public."rest_framework_api_key_apikey" LIMIT 100;  -- 3 registros
SELECT * FROM public."gerenciamento_acessounidadeusuarios" LIMIT 100;  -- 2 registros
SELECT * FROM public."django_site" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_aviso" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_cancelamentos" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_configuracaoavaliacao" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_configuracoes" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_linksavaliacao" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_prioridade" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_qrcodeavaliacao" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_servicosintegracao" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_sistemainstitucional" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_totem" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_totem_prioridades" LIMIT 100;  -- 1 registros
SELECT * FROM public."gerenciamento_totem_servicos" LIMIT 100;  -- 1 registros
SELECT * FROM public."account_emailaddress" LIMIT 100;  -- 0 registros
SELECT * FROM public."account_emailconfirmation" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_agendamentointerno" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_agendamentopresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaoatendimentopresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaoentregapresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaointerno" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaopresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaoservicointernopresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_avaliacaoservicopresencial" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_dependentes" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_dependentesinterno" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_observacao" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_observacaointerna" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_rastreamentoavaliacaoatendimento" LIMIT 100;  -- 0 registros
SELECT * FROM public."agendamento_rastreamentoavaliacaoentrega" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_anexosrespostas" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_anexostopicos" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_avaliacaoatendimentoonline" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_avaliacaoservicoonline" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_dependentes" LIMIT 100;  -- 0 registros
SELECT * FROM public."atendimento_motivostopicos" LIMIT 100;  -- 0 registros
SELECT * FROM public."auth_group_permissions" LIMIT 100;  -- 0 registros
SELECT * FROM public."auth_user_user_permissions" LIMIT 100;  -- 0 registros
SELECT * FROM public."diario_atendimentodiario" LIMIT 100;  -- 0 registros
SELECT * FROM public."diario_avaliacaodiario" LIMIT 100;  -- 0 registros
SELECT * FROM public."diario_dependentes" LIMIT 100;  -- 0 registros
SELECT * FROM public."diario_observacao" LIMIT 100;  -- 0 registros
SELECT * FROM public."django_admin_log" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_canaisatendimento" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_configuracaoagendamento" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_contatounidade" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_excecaohorariosagendamento" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_excecaohorariosagendamentocomplementar" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_guia" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_guiaservicos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_guicheservicocomplementar" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_mensagemadmin" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_mensagemadminlida" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_motivos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_notificacaoorgao" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_osastoken" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_perguntas" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_qrcodeavaliacao_servicos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_questionarios" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_reagendamentos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_respostas" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_senhachamadaatendimento" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_setorservicosinternos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_subtopicos" LIMIT 100;  -- 0 registros
SELECT * FROM public."gerenciamento_temposervicocomplementarfila" LIMIT 100;  -- 0 registros
SELECT * FROM public."socialaccount_socialaccount" LIMIT 100;  -- 0 registros
SELECT * FROM public."socialaccount_socialapp" LIMIT 100;  -- 0 registros
SELECT * FROM public."socialaccount_socialapp_sites" LIMIT 100;  -- 0 registros
SELECT * FROM public."socialaccount_socialtoken" LIMIT 100;  -- 0 registros