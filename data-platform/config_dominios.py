"""Domínios (blocos funcionais) de negócio do banco EDS.

Para adicionar um domínio novo: acrescentar um Dominio() em DOMINIOS e,
se precisar de exceções manuais de classificação, um item em _EXCECOES.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Dominio:
    id: str
    label: str
    descricao: str
    prefixos: tuple[str, ...] = ()
    critico: bool = False  # domínio núcleo do negócio — eleva risco das tabelas


DOMINIOS: list[Dominio] = [
    Dominio("carta-servico", "Carta de Serviço",
            "Serviços, órgãos, unidades, temas — coração do portal",
            critico=True),
    Dominio("auth-perfis", "Auth & Perfis",
            "Usuários, grupos, permissões, tokens, contas sociais",
            prefixos=("auth", "account", "socialaccount", "authtoken", "core"),
            critico=True),
    Dominio("avaliacao", "Avaliação",
            "Avaliações de serviços pelo cidadão: perguntas, respostas, votos, QR codes"),
    Dominio("atendimento", "Atendimento",
            "Módulo de atendimento presencial: guichês, filas, senhas, totem",
            prefixos=("atendimento",)),
    Dominio("agendamento", "Agendamento",
            "Agendamento de atendimento (presencial/interno) e dependentes",
            prefixos=("agendamento",)),
    Dominio("diario", "Diário", "Diário de atendimento", prefixos=("diario",)),
    Dominio("infra-django", "Infra Django",
            "Tabelas internas do framework (migrações, sessões, content types)",
            prefixos=("django",)),
]

_POR_ID = {d.id: d for d in DOMINIOS}
_PADRAO = _POR_ID["carta-servico"]

# tabela -> id do domínio (sobrepõe classificação automática por prefixo)
_EXCECOES: dict[str, str] = {
    t: "atendimento" for t in (
        "gerenciamento_guiches", "gerenciamento_guicheservico",
        "gerenciamento_guicheservicocomplementar", "gerenciamento_filahorarios",
        "gerenciamento_horarioatendimento", "gerenciamento_totem",
        "gerenciamento_totem_prioridades", "gerenciamento_totem_servicos",
        "gerenciamento_prioridade", "gerenciamento_temposervicofila",
        "gerenciamento_temposervicocomplementarfila", "gerenciamento_senhachamadaatendimento",
        "gerenciamento_canaisatendimento", "gerenciamento_unidadeusuarios",
        "gerenciamento_acessounidadeusuarios",
    )
} | {
    t: "avaliacao" for t in (
        "gerenciamento_avaliacaoinformacaoservicos", "gerenciamento_configuracaoavaliacao",
        "gerenciamento_linksavaliacao", "gerenciamento_perguntasavaliacao",
        "gerenciamento_qrcodeavaliacao", "gerenciamento_qrcodeavaliacao_servicos",
        "gerenciamento_respostasavaliacao", "gerenciamento_votosservicos",
        "gerenciamento_perguntas", "gerenciamento_respostas", "gerenciamento_questionarios",
    )
} | {
    t: "auth-perfis" for t in (
        "gerenciamento_accesstoken", "gerenciamento_osastoken", "rest_framework_api_key_apikey",
    )
}


def dominio(table: str) -> Dominio:
    if table in _EXCECOES:
        return _POR_ID[_EXCECOES[table]]
    prefix = table.split("_")[0]
    for d in DOMINIOS:
        if prefix in d.prefixos:
            return d
    return _PADRAO
