// Tipos de Usuário
export interface Usuario {
    id: number;
    nome: string;
    email: string;
    cargo: 'DENTISTA' | 'RECEPCIONISTA' | 'ADMIN';
    ativo: boolean;
    dataCriacao?: string;
}

// Tipos de Autenticação
export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    tipo: string;
    usuario: Usuario;
}

export interface RegisterRequest {
    nome: string;
    email: string;
    senha: string;
    cargo: 'DENTISTA' | 'RECEPCIONISTA' | 'ADMIN';
}

export interface AuthContextData {
    user: Usuario | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => void;
}

// Tipos de Paciente
export interface Paciente {
    id: number;
    nome: string;
    dataNascimento: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    observacoes?: string;
    dataCadastro?: string;
    declaraIr?: boolean;
    dentistaResponsavel?: Usuario;
    dentistaResponsavelId?: number;
    pai?: Paciente;
    paiId?: number;
    mae?: Paciente;
    maeId?: number;
    conjuge?: Paciente;
    conjugeId?: number;
}

// Tipos de Atendimento
export interface Atendimento {
    id: number;
    paciente: Paciente;
    pacienteId: number;
    dentista: Usuario;
    dentistaId: number;
    dataHoraInicio: string;
    dataHoraFim?: string;
    status: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
    observacoes?: string;
}

// Tipos de Procedimento
export interface Procedimento {
    id: number;
    atendimento: Atendimento;
    atendimentoId: number;
    descricao: string;
    valor?: number;
    observacoes?: string;
    dataRealizacao?: string;
}

// Tipos de Pagamento
export type MetodoPagamento =
    | 'DINHEIRO'
    | 'CARTAO_DEBITO'
    | 'CARTAO_CREDITO'
    | 'PIX'
    | 'TRANSFERENCIA';

export type StatusParcela = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'ESTORNADO';

export interface Pagamento {
    id: number;
    paciente: Paciente;
    pacienteId: number;
    dentista: Usuario;
    dentistaId: number;
    atendimento?: Atendimento;
    atendimentoId?: number;
    valorTotal: number;
    metodoPagamento: MetodoPagamento;
    parcelado: boolean;
    numeroParcelas?: number;
    dataLancamento: string;
    observacoes?: string;
    parcelas?: Parcela[];
}

export interface Parcela {
    id: number;
    pagamento: Pagamento;
    pagamentoId: number;
    numeroParcela: number;
    valorParcela: number;
    dataVencimento: string;
    dataPagamento?: string;
    status: StatusParcela;
    observacoes?: string;
}

export interface CriarPagamentoDTO {
    pacienteId: number;
    dentistaId: number;
    atendimentoId?: number;
    valorTotal: number;
    metodoPagamento: MetodoPagamento;
    parcelado: boolean;
    numeroParcelas?: number;
    observacoes?: string;
}

export interface AtualizarPacienteDTO {
    nome: string;
    dataNascimento: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    observacoes?: string;
    declaraIr: boolean;
    dentistaResponsavelId?: number;
    paiId?: number;
    maeId?: number;
    conjugeId?: number;
}

// Tipos de Atendimento
export type TipoAtendimento = 'CONSULTA' | 'URGENCIA' | 'RETORNO' | 'MANUTENCAO' | 'CHECKUP' | 'AVALIACAO';
export type StatusAtendimento = 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface Atendimento {
    id: number;
    paciente: Paciente;
    dentista: Usuario;
    dataHoraInicio: string;
    dataHoraFim?: string;
    duracaoMinutos?: number;
    tipoAtendimento: TipoAtendimento;
    status: StatusAtendimento;
    isAgendado: boolean;
    dataHoraAgendamento?: string;
    motivoConsulta?: string;
    diagnostico?: string;
    prescricao?: string;
    observacoesIniciais?: string;
    observacoesFinais?: string;
    dataRetornoSugerida?: string;
    procedimentos?: AtendimentoProcedimento[];
    createdAt: string;
    updatedAt: string;
    duracaoAtual?: number;
}

export interface AtendimentoProcedimento {
    id: number;
    procedimento: Procedimento;
    denteNumero?: number;
    observacoes?: string;
}

export interface AtendimentoDTO {
    pacienteId: number;
    dentistaId: number;
    tipoAtendimento?: TipoAtendimento;
    status?: StatusAtendimento;
    isAgendado?: boolean;
    dataHoraAgendamento?: string;
    motivoConsulta?: string;
    observacoesIniciais?: string;
}

export interface FinalizarAtendimentoDTO {
    diagnostico?: string;
    prescricao?: string;
    observacoesFinais?: string;
    dataRetornoSugerida?: string;
    procedimentos?: ProcedimentoAtendimentoDTO[];
}

export interface ProcedimentoAtendimentoDTO {
    procedimentoId: number;
    denteNumero?: number;
    observacoes?: string;
}
