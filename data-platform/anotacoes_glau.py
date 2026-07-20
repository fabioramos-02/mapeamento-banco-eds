"""Anotações do mapeamento manual da Glau (anotacoes/mapeamento-glau-20-07.txt)."""

# Tabelas listadas no mapeamento manual de 20/07
MAPEADAS = {
    "gerenciamento_servicos", "gerenciamento_temas", "auth_group", "auth_permission",
    "auth_user", "auth_user_groups", "authtoken_token", "core_profilehierarchy",
    "core_profilehierarchy_can_grant_profiles", "core_profilehierarchy_can_remove_profiles",
    "gerenciamento_aplicativos", "gerenciamento_avaliacaoinformacaoservicos",
    "gerenciamento_aviso", "gerenciamento_cancelamentos", "gerenciamento_cidades",
    "gerenciamento_configuracaoavaliacao", "gerenciamento_configuracoes",
    "gerenciamento_contatoorgao", "gerenciamento_enderecoorgao", "gerenciamento_feriados",
    "gerenciamento_filahorarios", "gerenciamento_gestororgao", "gerenciamento_guiches",
    "gerenciamento_guicheservico", "gerenciamento_historicoservico",
    "gerenciamento_horarioatendimento", "gerenciamento_horariounidade",
    "gerenciamento_jornada", "gerenciamento_linksavaliacao", "gerenciamento_orgaos",
    "gerenciamento_orgaosites", "gerenciamento_perguntasavaliacao",
    "gerenciamento_prioridade", "gerenciamento_qrcodeavaliacao",
    "gerenciamento_respostasavaliacao", "gerenciamento_revisaoservico",
    "gerenciamento_servicoserros", "gerenciamento_servicosfavoritos",
    "gerenciamento_servicosintegracao", "gerenciamento_servicosinternos",
    "gerenciamento_servicosunidade", "gerenciamento_setor", "gerenciamento_setorunidade",
    "gerenciamento_sistemainstitucional", "gerenciamento_sistemasinstitucionaisfavoritos",
    "gerenciamento_tasks", "gerenciamento_temposervicofila", "gerenciamento_termos",
    "gerenciamento_termosassinado", "gerenciamento_topicos", "gerenciamento_totem",
    "gerenciamento_totem_prioridades", "gerenciamento_totem_servicos",
    "gerenciamento_unidades", "gerenciamento_unidadeusuarios", "gerenciamento_usuarioorgao",
    "gerenciamento_votosservicos", "rest_framework_api_key_apikey",
    "django_content_type", "django_migrations", "django_session",
    "gerenciamento_acessounidadeusuarios",
}

ANOTACOES = {
    "gerenciamento_servicos": "Coração do portal",
    "gerenciamento_temas": "Importante para Dani — categorias e subcategorias",
    "auth_user": "Vai manter no portal de consulta?",
    "authtoken_token": "Entender o uso",
    "gerenciamento_aplicativos": "Incluir campo de texto alternativo",
    "gerenciamento_avaliacaoinformacaoservicos": "Faz sentido trazer?",
    "gerenciamento_configuracoes": "Entender o uso",
    "gerenciamento_guiches": "É do módulo de atendimento",
    "gerenciamento_historicoservico": "Ajuda na auditoria e no processo de aprovação da CGE",
    "gerenciamento_horarioatendimento": "É do módulo de atendimento",
    "gerenciamento_horariounidade": "Usar como exemplo: importar os dados ou não?",
    "gerenciamento_jornada": "Carta de serviço — dado relevante sobre integração com o gov.br",
    "gerenciamento_perguntasavaliacao": "Aparece no final da carta de serviço",
    "gerenciamento_prioridade": "Ver data de registro",
    "gerenciamento_servicoserros": "Questionar respostas enviadas pelo cidadão — ex.: IA para triagem",
    "gerenciamento_servicosfavoritos": "Vai trazer no 'meu painel'?",
    "gerenciamento_servicosinternos": "Entender com o Everaldo",
    "gerenciamento_servicosunidade": "Local de atendimento",
    "gerenciamento_termosassinado": "Vai ter bastante registro",
}

# Perguntas em aberto para a pauta de discussão
PERGUNTAS_ABERTAS = [
    "auth_user (418 mil usuários): mantém no portal de consulta ou migra para o login único da XVia?",
    "gerenciamento_servicosfavoritos: os favoritos do cidadão vão aparecer no 'meu painel' da nova plataforma?",
    "gerenciamento_horariounidade: usar como caso-exemplo para decidir se dados operacionais são importados ou recadastrados",
    "gerenciamento_servicosinternos: entender o uso com o Everaldo",
    "gerenciamento_configuracoes e authtoken_token: entender o papel antes de decidir",
    "gerenciamento_avaliacaoinformacaoservicos (11 mil respostas): faz sentido levar o histórico de avaliações?",
    "gerenciamento_servicoserros: respostas enviadas pelo cidadão — avaliar triagem com IA na nova plataforma",
]
