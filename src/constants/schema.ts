// src/constants/schema.ts
import { EntityKind, FieldSpec, FormValues } from '../types';

export const ACCESS_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ATIVO', label: 'ATIVO' },
  { value: 'SOLICITAR', label: 'SOLICITAR' },
  { value: 'SOLICITADO', label: 'SOLICITADO' },
  { value: 'EM_ANDAMENTO', label: 'EM ANDAMENTO' },
  { value: 'RECUSADO', label: 'RECUSADO' },
];

export const STATUS_ACESSO_OPTIONS = [
  { value: '1', label: 'ATIVO' },
  { value: '2', label: 'SOLICITAR' },
  { value: '3', label: 'SOLICITADO' },
  { value: '4', label: 'EM ANDAMENTO' },
  { value: '5', label: 'RECUSADO' },
];

export const FIELD_SPECS: Record<EntityKind, FieldSpec[]> = {
  consignatarias: [
    { key: 'nome', label: 'Nome', type: 'text', required: true, placeholder: 'Consignataria' },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
  convenios: [
    { key: 'nome', label: 'Nome', type: 'text', required: true, placeholder: 'Convenio' },
    {
      key: 'nome_normalizado',
      label: 'Nome normalizado',
      type: 'text',
      required: true,
      placeholder: 'convenio-normalizado',
      help: 'Se vazio, o sistema gera um valor padrao.',
    },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
  vinculos: [
    { key: 'convenio_id', label: 'Convenio ID', type: 'number', required: true, step: '1' },
    { key: 'consignataria_id', label: 'Consignataria ID', type: 'number', required: true, step: '1' },
    { key: 'produto_nome', label: 'Produto', type: 'text', placeholder: 'Produto' },
    { key: 'qtd_servidores', label: 'Qtd. servidores', type: 'number', step: '1' },
    { key: 'cnpj', label: 'CNPJ', type: 'text', placeholder: '00.000.000/0000-00' },
    { key: 'possui_base', label: 'Possui base', type: 'boolean' },
    { key: 'possui_portal', label: 'Possui portal', type: 'boolean' },
    { key: 'fonte_aba', label: 'Origem da base - Aba', type: 'text', placeholder: 'Aba da planilha' },
    { key: 'fonte_linha', label: 'Origem da base - Linha', type: 'number', step: '1' },
    { key: 'link_portal', label: 'Acesso ao Portal', type: 'text', placeholder: 'https://...' },
    {
      key: 'status_acesso_id',
      label: 'ACESSO PORTAL',
      type: 'select',
      options: STATUS_ACESSO_OPTIONS,
      help: 'Estados reais da tabela status_acesso.',
    },
    { key: 'data_solicitacao', label: 'Data solicitacao', type: 'date' },
    { key: 'possui_robo', label: 'Possui robo', type: 'boolean' },
    { key: 'faz_na_amigoz', label: 'Faz na amigoz', type: 'boolean' },
    { key: 'margem_online', label: 'Margem online', type: 'boolean' },
    { key: 'observacao', label: 'Observacao', type: 'textarea', rows: 4 },
    { key: 'ativo', label: 'Ativo', type: 'boolean' },
  ],
};

export const DEFAULT_VALUES: Record<EntityKind, FormValues> = {
  consignatarias: { nome: '', ativo: true },
  convenios: { nome: '', nome_normalizado: '', ativo: true },
  vinculos: {
    convenio_id: '',
    consignataria_id: '',
    produto_nome: '',
    qtd_servidores: '',
    cnpj: '',
    possui_base: false,
    possui_portal: false,
    fonte_aba: '',
    fonte_linha: '',
    link_portal: '',
    status_acesso_id: '',
    data_solicitacao: '',
    possui_robo: false,
    faz_na_amigoz: false,
    margem_online: false,
    observacao: '',
    ativo: true,
  },
};