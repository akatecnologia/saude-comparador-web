export interface Operadora {
  id: number;
  registro_ans: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  modalidade: string;
  uf: string;
  cidade: string | null;
  porte: string | null;
  beneficiarios: number | null;
  idss_score: number | null;
}

export interface IdssScore {
  ano: number;
  nota_final: number;
  idqs: number | null;
  idga: number | null;
  idsm: number | null;
  idgr: number | null;
}

export interface IgrReclamacao {
  ano: number;
  trimestre: number;
  indice: number;
  classificacao: string | null;
  total_reclamacoes: number | null;
  beneficiarios_periodo: number | null;
}

export interface Reajuste {
  ano: number;
  percentual: number;
  tipo_plano: string;
}

export interface OperadoraDetail extends Operadora {
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  site: string | null;
  data_registro: string | null;
  idss_historico: IdssScore[];
  igr_reclamacoes: IgrReclamacao[];
  reajustes: Reajuste[];
  total_planos: number;
}

export interface Plano {
  id: number;
  id_plano_ans: string;
  nome: string;
  operadora_nome: string | null;
  operadora_registro_ans: string | null;
  segmentacao: string | null;
  tipo_contratacao: string | null;
  acomodacao: string | null;
  abrangencia: string | null;
  cobertura: string | null;
  obstetricia: string | null;
  odontologico: boolean;
  situacao: string | null;
  operadora_idss: number | null;
  idss_score: number | null;
  igr_indice: number | null;
  reajuste_ultimo: number | null;
  idss_ano: number | null;
  igr_competencia: string | null;
  reajuste_ciclo: string | null;
  preco_mes_referencia: string | null;
  preco_mensal: number | null;
  classificacao_prudencial: string | null;
  taxa_resolutividade: number | null;
  garantia_atendimento: string | null;
  tem_penalidades: boolean;
  qtd_penalidades: number;
  total_multas: number | null;
  regime_especial: boolean;
  acreditada: boolean;
  nivel_acreditacao: string | null;
  qtd_programas_prevencao: number;
}

export interface IdssDetalhes {
  ano: number;
  idss: number | null;
  idqs: number | null;
  idga: number | null;
  idsm: number | null;
  idgr: number | null;
}

export interface IgrHistoricoItem {
  competencia: string;
  indice: number | null;
  reclamacoes: number | null;
  beneficiarios: number | null;
}

export interface ReajusteHistoricoItem {
  ciclo: string;
  pct_unico: number | null;
  qt_beneficiarios: number | null;
}

export interface PlanoDetail extends Plano {
  operadora: Operadora;
  coberturas: string[];
  carencias: Record<string, string>;
  rede_prestadores: number | null;
  area_atuacao: string[];
  municipios_por_uf: Record<string, string[]>;
  servicos_opcionais: string[];
  idss_detalhes: IdssDetalhes | null;
  igr_historico: IgrHistoricoItem[];
  reajustes_historico: ReajusteHistoricoItem[];
}

export interface RankingEntry {
  operadora_id: number;
  posicao: number;
  registro_ans: string;
  razao_social: string;
  nome_fantasia: string | null;
  modalidade: string | null;
  uf: string | null;
  ano_referencia: number;
  badge: string;
  idss: number | null;
  idqs: number | null;
  idga: number | null;
  idsm: number | null;
  idgr: number | null;
}

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  uf: string;
  cidade: string | null;
  faixa_etaria: string;
  tipo_contratacao: string;
  criado_em: string;
}

export interface LeadCreate {
  nome: string;
  email?: string;
  telefone?: string;
  uf: string;
  cidade?: string;
  faixa_etaria: string;
  tipo_contratacao: string;
  lgpd_aceite: boolean;
  origem?: string;
  cf_turnstile_response?: string;
}

export interface Stats {
  total_operadoras: number;
  total_planos: number;
  total_municipios: number;
  total_beneficiarios: number;
  data_atualizacao: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BuscarPlanosParams {
  q?: string;
  uf?: string;
  cidade?: string;
  tipo_contratacao?: string;
  segmentacao?: string;
  acomodacao?: string;
  abrangencia?: string;
  faixa_etaria?: string;
  ordem?: string;
  page?: number;
  page_size?: number;
}

export interface OperadorasParams {
  q?: string;
  uf?: string;
  modalidade?: string;
  page?: number;
  page_size?: number;
}

export interface FaixaPrecoItem {
  tipo_contratacao: string;
  faixa_etaria: string;
  valor_min: number;
  valor_max: number;
}

export interface FaixasPrecoResponse {
  items: FaixaPrecoItem[];
  total: number;
}

export interface RankingParams {
  uf?: string;
  ano?: number;
  modalidade?: string;
  page?: number;
  page_size?: number;
  ordem?: string;
}

export interface VcmFaixaItem {
  faixa_etaria: string;
  vcm: number | null;
  mes_referencia: string;
}

export interface VcmResponse {
  id_plano_ans: string;
  faixas: VcmFaixaItem[];
}

export interface VcmHistoricoItem {
  mes_referencia: string;
  vcm: number | null;
}

export interface VcmHistoricoResponse {
  id_plano_ans: string;
  faixa_etaria: string;
  historico: VcmHistoricoItem[];
}

export interface QualidadeResponse {
  registro_ans: string;
  razao_social: string;
  idss: number | null;
  idss_ano: number | null;
  igr: number | null;
  taxa_resolutividade: number | null;
  taxa_resolutividade_competencia: string | null;
  garantia_atendimento: string | null;
  classificacao_prudencial: string | null;
  qtd_penalidades: number;
  total_multas: number | null;
  acreditada: boolean;
  nivel_acreditacao: string | null;
  qtd_programas_prevencao: number;
  regime_especial: boolean;
}
