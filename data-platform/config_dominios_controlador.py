"""Domínios do banco Controlador — sem mapeamento manual ainda (ver anotacoes_controlador.py).

Classificação 100% automática pelo prefixo do nome da tabela, sem curadoria de negócio.
Quando existir um mapeamento manual (tipo anotacoes/mapeamento-glau-20-07.txt pro EDS),
trocar por uma lista curada de Dominio(), no mesmo padrão de config_dominios.py.
"""
from config_dominios import Dominio

_cache: dict[str, Dominio] = {}


def _humanizar_prefixo(prefixo: str) -> str:
    return prefixo.replace("_", " ").capitalize()


def dominio(table: str) -> Dominio:
    prefixo = table.split("_")[0]
    if prefixo not in _cache:
        _cache[prefixo] = Dominio(
            id=prefixo, label=_humanizar_prefixo(prefixo),
            descricao=f"Tabelas com prefixo '{prefixo}' — agrupamento automático, sem curadoria",
            critico=False,
        )
    return _cache[prefixo]


def dominios_encontrados() -> list[Dominio]:
    """Lista de domínios — só existe depois de chamar dominio() para cada tabela extraída."""
    return list(_cache.values())
