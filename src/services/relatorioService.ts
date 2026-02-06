import api from './api';

export const relatorioService = {
    // Exportar pagamentos em CSV
    exportarPagamentosCSV: async (
        dentistaId: number,
        dataInicio: string,
        dataFim: string
    ): Promise<Blob> => {
        const response = await api.get('/relatorios/pagamentos/csv', {
            params: { dentistaId, dataInicio, dataFim },
            responseType: 'blob'
        });
        return response.data;
    },

    // Exportar parcelas pendentes em CSV
    exportarParcelasPendentesCSV: async (dentistaId: number): Promise<Blob> => {
        const response = await api.get('/relatorios/parcelas-pendentes/csv', {
            params: { dentistaId },
            responseType: 'blob'
        });
        return response.data;
    },

    // Exportar inadimplência em CSV
    exportarInadimplenciaCSV: async (dentistaId: number): Promise<Blob> => {
        const response = await api.get('/relatorios/inadimplencia/csv', {
            params: { dentistaId },
            responseType: 'blob'
        });
        return response.data;
    },

    // Exportar fluxo de caixa em CSV
    exportarFluxoCaixaCSV: async (dentistaId: number, ano: number): Promise<Blob> => {
        const response = await api.get('/relatorios/fluxo-caixa/csv', {
            params: { dentistaId, ano },
            responseType: 'blob'
        });
        return response.data;
    },
};

// Função auxiliar para download de arquivo
export const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

