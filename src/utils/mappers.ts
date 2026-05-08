// src/utils/mappers.ts
import {
  ConsignatariaDetail,
  ConvenioDetail,
  VinculoDetail,
  EntityKind
} from '../types';

type FormValues = Record<string, string | boolean>;

export function normalizedName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cleanString(value: any): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toNumberOrNull(value: any): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredInt(value: string | boolean | undefined, label: string): number {
  const parsed = toNumberOrNull(value);
  if (parsed == null) {
    throw new Error(`${label} e obrigatorio.`);
  }
  return parsed;
}

export function serializeValues(kind: EntityKind, values: FormValues): Record<string, unknown> {
  if (kind === 'consignatarias') {
    const nome = cleanString(values.nome);
    if (!nome) throw new Error('Nome e obrigatorio.');
    return { nome, ativo: Boolean(values.ativo) };
  }
  if (kind === 'convenios') {
    const nome = cleanString(values.nome);
    if (!nome) throw new Error('Nome e obrigatorio.');
    const nomeNormalizado = cleanString(values.nome_normalizado) ?? normalizedName(nome);
    return { nome, nome_normalizado: nomeNormalizado, ativo: Boolean(values.ativo) };
  }
  const convenioId = parseRequiredInt(values.convenio_id, 'Convenio ID');
  const consignatariaId = parseRequiredInt(values.consignataria_id, 'Consignataria ID');
  return {
    convenio_id: convenioId,
    consignataria_id: consignatariaId,
    produto_nome: cleanString(values.produto_nome),
    qtd_servidores: toNumberOrNull(values.qtd_servidores),
    cnpj: cleanString(values.cnpj),
    possui_base: Boolean(values.possui_base),
    possui_portal: Boolean(values.possui_portal),
    link_portal: cleanString(values.link_portal),
    fonte_aba: cleanString(values.fonte_aba),
    fonte_linha: toNumberOrNull(values.fonte_linha),
    status_acesso_id: toNumberOrNull(values.status_acesso_id),
    data_solicitacao: cleanString(values.data_solicitacao),
    possui_robo: Boolean(values.possui_robo),
    faz_na_amigoz: Boolean(values.faz_na_amigoz),
    margem_online: Boolean(values.margem_online),
    observacao: cleanString(values.observacao),
    ativo: Boolean(values.ativo),
  };
}

export function mapConsignatariaToValues(item: ConsignatariaDetail): FormValues {
  return {
    nome: item.nome ?? '',
    ativo: item.ativo,
  };
}

export function mapConvenioToValues(item: ConvenioDetail): FormValues {
  return {
    nome: item.nome ?? '',
    nome_normalizado: item.nome_normalizado ?? '',
    ativo: item.ativo,
  };
}

export function mapVinculoToValues(item: VinculoDetail): FormValues {
  return {
    convenio_id: item.convenio_id ? String(item.convenio_id) : '',
    consignataria_id: item.consignataria_id ? String(item.consignataria_id) : '',
    produto_nome: item.produto_nome ?? '',
    qtd_servidores: item.qtd_servidores != null ? String(item.qtd_servidores) : '',
    cnpj: item.cnpj ?? '',
    possui_base: Boolean(item.possui_base),
    possui_portal: Boolean(item.possui_portal),
    link_portal: item.link_portal ?? '',
    fonte_aba: item.fonte_aba ?? '',
    fonte_linha: item.fonte_linha != null ? String(item.fonte_linha) : '',
    status_acesso_id: item.status_acesso_id != null ? String(item.status_acesso_id) : '',
    data_solicitacao: item.data_solicitacao ? item.data_solicitacao.slice(0, 10) : '',
    possui_robo: Boolean(item.possui_robo),
    faz_na_amigoz: Boolean(item.faz_na_amigoz),
    margem_online: Boolean(item.margem_online),
    observacao: item.observacao ?? '',
    ativo: item.ativo,
  };
}