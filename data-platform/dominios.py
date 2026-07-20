"""Classificação das tabelas em domínios funcionais (por prefixo/tema)."""

DOMINIOS = {
    "Núcleo Portal": "Carta de serviços: serviços, órgãos, unidades, temas — coração do portal",
    "Auth & Perfis": "Usuários, grupos, permissões, tokens, contas sociais",
    "Avaliação": "Avaliações de serviços pelo cidadão: perguntas, respostas, votos, QR codes",
    "Atendimento": "Módulo de atendimento presencial: guichês, filas, senhas, totem",
    "Agendamento": "Agendamento de atendimento (presencial/interno) e dependentes",
    "Diário": "Diário de atendimento",
    "Infra Django": "Tabelas internas do framework (migrações, sessões, content types)",
}

_ATENDIMENTO_EXTRA = {
    "gerenciamento_guiches", "gerenciamento_guicheservico", "gerenciamento_guicheservicocomplementar",
    "gerenciamento_filahorarios", "gerenciamento_horarioatendimento", "gerenciamento_totem",
    "gerenciamento_totem_prioridades", "gerenciamento_totem_servicos", "gerenciamento_prioridade",
    "gerenciamento_temposervicofila", "gerenciamento_temposervicocomplementarfila",
    "gerenciamento_senhachamadaatendimento", "gerenciamento_canaisatendimento",
    "gerenciamento_unidadeusuarios", "gerenciamento_acessounidadeusuarios",
}

_AVALIACAO = {
    "gerenciamento_avaliacaoinformacaoservicos", "gerenciamento_configuracaoavaliacao",
    "gerenciamento_linksavaliacao", "gerenciamento_perguntasavaliacao", "gerenciamento_qrcodeavaliacao",
    "gerenciamento_qrcodeavaliacao_servicos", "gerenciamento_respostasavaliacao",
    "gerenciamento_votosservicos", "gerenciamento_perguntas", "gerenciamento_respostas",
    "gerenciamento_questionarios",
}

_AUTH_TOKENS = {
    "gerenciamento_accesstoken", "gerenciamento_osastoken", "rest_framework_api_key_apikey",
}


def dominio(table: str) -> str:
    if table in _ATENDIMENTO_EXTRA:
        return "Atendimento"
    if table in _AVALIACAO:
        return "Avaliação"
    if table in _AUTH_TOKENS:
        return "Auth & Perfis"
    prefix = table.split("_")[0]
    if prefix in ("auth", "account", "socialaccount", "authtoken", "core"):
        return "Auth & Perfis"
    if prefix == "agendamento":
        return "Agendamento"
    if prefix == "atendimento":
        return "Atendimento"
    if prefix == "diario":
        return "Diário"
    if prefix == "django":
        return "Infra Django"
    return "Núcleo Portal"
