import {
  ConsignatariaListItem,
  ConvenioListItem,
  VinculoListItem,
  ConsignatariaView,
  LinkedConvenioView,
  ConvenioFilters,
  TriState
} from '../types';

export function matchesTriState(value: boolean, filter: TriState): boolean {
  if (filter === 'all') return true;
  return filter === 'yes' ? value : !value;
}

export function buildConsignatariaViews(
  consignatarias: ConsignatariaListItem[],
  convenios: ConvenioListItem[],
  vinculos: VinculoListItem[]
): ConsignatariaView[] {
  return consignatarias.map((c) => {
    const linked = vinculos
      .filter((v) => v.consignataria_id === c.id)
      .map((v) => {
        const conv = convenios.find((cv) => cv.id === v.convenio_id);
        return {
          vinculoId: v.id,
          convenioId: v.convenio_id,
          convenioNome: conv?.nome ?? 'Desconhecido',
          convenioNormalizado: conv?.nome_normalizado ?? '',
          qtdServidores: v.qtd_servidores ?? null,
          cnpj: v.cnpj ?? '',
          possuiBase: v.possui_base ?? false,
          fonteBase: v.fonte_aba ?? '',
          fonteLinha: v.fonte_linha ?? null,
          linkPortal: v.link_portal ?? '',
          possuiRobo: v.possui_robo ?? false,
          statusAcesso: v.status_acesso ?? 'SOLICITAR',
          fazNaAmigoz: v.faz_na_amigoz ?? false,
          margemOnline: v.margem_online ?? false,
          possuiPortal: v.possui_portal ?? false,
          dataSolicitacao: v.data_solicitacao ? v.data_solicitacao.slice(0, 10) : '',
          ativo: v.ativo,
        };
      });

    return { ...c, linkedConvenios: linked };
  });
}

export function filterLinkedConvenios(rows: LinkedConvenioView[], filters: ConvenioFilters) {
  const query = filters.search.trim().toLowerCase();
  const min = filters.minServidores ? parseInt(filters.minServidores, 10) : null;
  const max = filters.maxServidores ? parseInt(filters.maxServidores, 10) : null;

  return rows.filter((item) => {
    if (query) {
      const match =
        item.convenioNome.toLowerCase().includes(query) ||
        item.cnpj.toLowerCase().includes(query) ||
        item.fonteBase.toLowerCase().includes(query) ||
        item.linkPortal.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (filters.statusAcesso && item.statusAcesso !== filters.statusAcesso) return false;
    if (min !== null && (item.qtdServidores ?? 0) < min) return false;
    if (max !== null && (item.qtdServidores ?? 0) > max) return false;

    if (!matchesTriState(item.possuiBase, filters.possuiBase)) return false;
    if (!matchesTriState(item.possuiPortal, filters.possuiPortal)) return false;
    if (!matchesTriState(item.possuiRobo, filters.possuiRobo)) return false;
    if (!matchesTriState(item.fazNaAmigoz, filters.fazNaAmigoz)) return false;
    if (!matchesTriState(item.margemOnline, filters.margemOnline)) return false;
    if (!matchesTriState(item.ativo, filters.ativo)) return false;

    return true;
  });
}

export function summarizeLinkedConvenios(rows: LinkedConvenioView[]) {
  return {
    total: rows.length,
    servers: rows.reduce((sum, item) => sum + (item.qtdServidores ?? 0), 0),
    withBase: rows.filter((item) => item.possuiBase).length,
    withPortal: rows.filter((item) => item.possuiPortal).length,
    withRobo: rows.filter((item) => item.possuiRobo).length,
    active: rows.filter((item) => item.ativo).length,
  };
}