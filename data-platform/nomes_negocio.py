"""Tradução de nome técnico de tabela para nome de negócio.

Curado só para as tabelas que aparecem na narrativa executiva (núcleo,
maior volume, com anotação do mapeamento manual). O resto do inventário
completo cai no fallback automático de _humanizar().
"""
import re

NOMES_NEGOCIO: dict[str, str] = {
    "gerenciamento_servicos": "Cadastro de Serviços",
    "gerenciamento_temas": "Categorias e Subcategorias de Serviços",
    "gerenciamento_topicos": "Tópicos de Atendimento",
    "gerenciamento_orgaos": "Cadastro de Órgãos",
    "gerenciamento_unidades": "Unidades de Atendimento",
    "gerenciamento_setor": "Setores",
    "auth_user": "Cadastro de Usuários",
    "auth_group": "Grupos de Acesso",
    "auth_permission": "Permissões de Acesso",
    "auth_user_groups": "Usuários por Grupo de Acesso",
    "authtoken_token": "Tokens de Autenticação (API)",
    "gerenciamento_accesstoken": "Tokens de Acesso",
    "gerenciamento_osastoken": "Tokens de Integração (OSAS)",
    "rest_framework_api_key_apikey": "Chaves de API",
    "gerenciamento_aplicativos": "Aplicativos Institucionais",
    "gerenciamento_avaliacaoinformacaoservicos": "Avaliações de Serviços pelo Cidadão",
    "gerenciamento_configuracoes": "Configurações do Sistema",
    "gerenciamento_guiches": "Guichês de Atendimento",
    "gerenciamento_historicoservico": "Histórico de Alterações dos Serviços",
    "gerenciamento_horarioatendimento": "Horários de Atendimento",
    "gerenciamento_horariounidade": "Horários por Unidade",
    "gerenciamento_jornada": "Fluxo de Navegação do Cidadão",
    "gerenciamento_perguntasavaliacao": "Perguntas da Avaliação de Serviço",
    "gerenciamento_prioridade": "Prioridades de Atendimento",
    "gerenciamento_revisaoservico": "Revisões de Serviço",
    "gerenciamento_servicoserros": "Erros Reportados pelo Cidadão",
    "gerenciamento_servicosfavoritos": "Serviços Favoritos do Cidadão",
    "gerenciamento_servicosinternos": "Serviços Internos",
    "gerenciamento_servicosunidade": "Locais de Atendimento por Serviço",
    "gerenciamento_termosassinado": "Termos Assinados pelo Cidadão",
    "gerenciamento_termos": "Termos de Uso",
    "gerenciamento_tasks": "Tarefas do Sistema",
    "gerenciamento_votosservicos": "Votos em Serviços",
    "django_session": "Sessões de Login",
}


def nome_negocio(table: str) -> str:
    return NOMES_NEGOCIO.get(table) or _humanizar(table)


def _humanizar(table: str) -> str:
    """ponytail: fallback automático pras tabelas de cauda longa que só
    aparecem no inventário completo — remove prefixo técnico, capitaliza.
    Não separa palavras concatenadas (ex. "qrcodeavaliacao" fica assim
    mesmo). Curar manualmente em NOMES_NEGOCIO se o resultado ficar ruim.
    """
    sem_prefixo = re.sub(r"^(gerenciamento|django|auth|core|account|socialaccount)_", "", table)
    return sem_prefixo.replace("_", " ").capitalize()
