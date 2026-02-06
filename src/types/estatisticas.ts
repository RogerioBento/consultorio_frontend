export interface EstatisticasPagamento {
    // Totais gerais
    totalRecebido: number;
    totalPendente: number;
    totalGeral: number;
    
    // Contadores
    totalPagamentos: number;
    totalPacientes: number;
    parcelasPagas: number;
    parcelasPendentes: number;
    parcelasAtrasadas: number;
    
    // Por método de pagamento
    totalPorMetodo: Record<string, number>;
    
    // Evolução mensal
    evolucaoMensal: Record<string, number>;
    
    // Médias
    ticketMedio: number;
    
    // Top pacientes
    topPacientes: Record<string, number>;
}

export type PeriodoEstatisticas = 'hoje' | 'mes' | 'ano' | 'personalizado';

