"""Classificação de risco de migração por tabela: volume de dados + criticidade do domínio.

Domínio crítico (Núcleo Portal, Auth & Perfis) baixa a barra de "alto" — uma tabela
central do portal já é risco alto com volume moderado; num domínio periférico só o
volume muito grande justifica risco alto sozinho.
"""
from anotacoes_glau import ANOTACOES
from config_dominios import Dominio

VOLUME_MEDIO = 1_000    # barra de "alto" para tabelas de domínio crítico
VOLUME_ALTO = 10_000    # barra de "alto" para tabelas de domínio periférico
# ponytail: cortes pragmáticos sobre a distribuição real desta extração — recalibrar se o banco crescer muito


def calcular_risco(tabela: dict, dom: Dominio) -> str:
    """"alto" | "medio" | "baixo" — risco de a migração dessa tabela dar problema."""
    count = tabela["count"] or 0
    if count == 0:
        return "baixo"  # já vira "não migrar" na sugestão; risco não é o critério ali
    duvida = "?" in ANOTACOES.get(tabela["table"], "")
    limite_alto = VOLUME_MEDIO if dom.critico else VOLUME_ALTO
    if count >= limite_alto:
        return "alto"
    if count >= VOLUME_MEDIO or duvida:
        return "medio"
    return "baixo"
