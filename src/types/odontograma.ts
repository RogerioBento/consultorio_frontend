export type StatusDente = 
    | 'SAUDAVEL'
    | 'CARIE'
    | 'RESTAURACAO'
    | 'CANAL'
    | 'PROTESE'
    | 'IMPLANTE'
    | 'EXTRAIDO'
    | 'AUSENTE'
    | 'FRATURA';

export interface Odontograma {
    id: number;
    paciente: {
        id: number;
        nome: string;
    };
    dentista: {
        id: number;
        nome: string;
    };
    numeroDente: number;
    status: StatusDente;
    procedimento?: string;
    observacoes?: string;
    dataRegistro: string;
    
    // Faces do dente marcadas
    faceOclusal: boolean;
    faceVestibular: boolean;
    faceLingual: boolean;
    faceMesial: boolean;
    faceDistal: boolean;
}

export interface OdontogramaDTO {
    pacienteId: number;
    dentistaId: number;
    numeroDente: number;
    status: StatusDente;
    procedimento?: string;
    observacoes?: string;
    
    // Faces do dente marcadas
    faceOclusal?: boolean;
    faceVestibular?: boolean;
    faceLingual?: boolean;
    faceMesial?: boolean;
    faceDistal?: boolean;
}

export interface DenteInfo {
    numero: number;
    nome: string;
    quadrante: number;
    posicao: number;
}

// Interface para representar o estado de um registro de odontograma com faces marcadas
export interface RegistroOdontograma {
    id: number;
    numeroDente: number;
    status: StatusDente;
    procedimento?: string;
    observacoes?: string;
    dataRegistro: string;
    dentista: {
        id: number;
        nome: string;
    };
    faceOclusal: boolean;
    faceVestibular: boolean;
    faceLingual: boolean;
    faceMesial: boolean;
    faceDistal: boolean;
}

// Tipo para faces do dente
export type FaceDente = 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal';

// Labels das faces
export const FACES_LABELS: Record<FaceDente, string> = {
    oclusal: 'Oclusal (Superior)',
    vestibular: 'Vestibular (Frontal)',
    lingual: 'Lingual (Posterior)',
    mesial: 'Mesial (Interna)',
    distal: 'Distal (Externa)',
};

// Cores para cada status
export const STATUS_COLORS: Record<StatusDente, string> = {
    SAUDAVEL: '#10B981',      // Verde
    CARIE: '#EF4444',          // Vermelho
    RESTAURACAO: '#F59E0B',    // Amarelo/Laranja
    CANAL: '#3B82F6',          // Azul
    PROTESE: '#8B5CF6',        // Roxo
    IMPLANTE: '#6B7280',       // Cinza
    EXTRAIDO: '#1F2937',       // Preto
    AUSENTE: '#E5E7EB',        // Cinza Claro
    FRATURA: '#92400E',        // Marrom
};

// Labels dos status
export const STATUS_LABELS: Record<StatusDente, string> = {
    SAUDAVEL: 'Saudável',
    CARIE: 'Cárie',
    RESTAURACAO: 'Restauração',
    CANAL: 'Canal',
    PROTESE: 'Prótese',
    IMPLANTE: 'Implante',
    EXTRAIDO: 'Extraído',
    AUSENTE: 'Ausente',
    FRATURA: 'Fratura',
};

// Informações dos dentes (nomenclatura)
export const DENTES_INFO: Record<number, DenteInfo> = {
    // Quadrante 1 - Superior Direito
    18: { numero: 18, nome: '3º Molar', quadrante: 1, posicao: 8 },
    17: { numero: 17, nome: '2º Molar', quadrante: 1, posicao: 7 },
    16: { numero: 16, nome: '1º Molar', quadrante: 1, posicao: 6 },
    15: { numero: 15, nome: '2º Pré-molar', quadrante: 1, posicao: 5 },
    14: { numero: 14, nome: '1º Pré-molar', quadrante: 1, posicao: 4 },
    13: { numero: 13, nome: 'Canino', quadrante: 1, posicao: 3 },
    12: { numero: 12, nome: 'Incisivo Lateral', quadrante: 1, posicao: 2 },
    11: { numero: 11, nome: 'Incisivo Central', quadrante: 1, posicao: 1 },
    
    // Quadrante 2 - Superior Esquerdo
    21: { numero: 21, nome: 'Incisivo Central', quadrante: 2, posicao: 1 },
    22: { numero: 22, nome: 'Incisivo Lateral', quadrante: 2, posicao: 2 },
    23: { numero: 23, nome: 'Canino', quadrante: 2, posicao: 3 },
    24: { numero: 24, nome: '1º Pré-molar', quadrante: 2, posicao: 4 },
    25: { numero: 25, nome: '2º Pré-molar', quadrante: 2, posicao: 5 },
    26: { numero: 26, nome: '1º Molar', quadrante: 2, posicao: 6 },
    27: { numero: 27, nome: '2º Molar', quadrante: 2, posicao: 7 },
    28: { numero: 28, nome: '3º Molar', quadrante: 2, posicao: 8 },
    
    // Quadrante 3 - Inferior Esquerdo
    38: { numero: 38, nome: '3º Molar', quadrante: 3, posicao: 8 },
    37: { numero: 37, nome: '2º Molar', quadrante: 3, posicao: 7 },
    36: { numero: 36, nome: '1º Molar', quadrante: 3, posicao: 6 },
    35: { numero: 35, nome: '2º Pré-molar', quadrante: 3, posicao: 5 },
    34: { numero: 34, nome: '1º Pré-molar', quadrante: 3, posicao: 4 },
    33: { numero: 33, nome: 'Canino', quadrante: 3, posicao: 3 },
    32: { numero: 32, nome: 'Incisivo Lateral', quadrante: 3, posicao: 2 },
    31: { numero: 31, nome: 'Incisivo Central', quadrante: 3, posicao: 1 },
    
    // Quadrante 4 - Inferior Direito
    41: { numero: 41, nome: 'Incisivo Central', quadrante: 4, posicao: 1 },
    42: { numero: 42, nome: 'Incisivo Lateral', quadrante: 4, posicao: 2 },
    43: { numero: 43, nome: 'Canino', quadrante: 4, posicao: 3 },
    44: { numero: 44, nome: '1º Pré-molar', quadrante: 4, posicao: 4 },
    45: { numero: 45, nome: '2º Pré-molar', quadrante: 4, posicao: 5 },
    46: { numero: 46, nome: '1º Molar', quadrante: 4, posicao: 6 },
    47: { numero: 47, nome: '2º Molar', quadrante: 4, posicao: 7 },
    48: { numero: 48, nome: '3º Molar', quadrante: 4, posicao: 8 },
};

