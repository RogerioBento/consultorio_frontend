import React from 'react';
import type { RegistroOdontograma, StatusDente } from '../../types/odontograma';

interface DenteProps {
    numero: number;
    registros: RegistroOdontograma[];
    onClick: () => void;
}

// Função para obter o tipo de dente baseado no número FDI
const getTipoDente = (numero: number): string => {
    const digito = numero % 10;
    if (digito === 1 || digito === 2) return 'incisivo';
    if (digito === 3) return 'canino';
    if (digito === 4 || digito === 5) return 'pre-molar';
    if (digito === 6 || digito === 7 || digito === 8) return 'molar';
    return 'incisivo';
};

// Função para obter a cor baseada no status
const getCorStatus = (status?: StatusDente): string => {
    switch (status) {
        case 'SAUDAVEL':
            return '#FFFFFF';
        case 'CARIE':
            return '#EF4444'; // red-500
        case 'RESTAURACAO':
            return '#3B82F6'; // blue-500
        case 'CANAL':
            return '#8B5CF6'; // purple-500
        case 'PROTESE':
            return '#F59E0B'; // amber-500
        case 'IMPLANTE':
            return '#06B6D4'; // cyan-500
        case 'EXTRAIDO':
            return '#6B7280'; // gray-500
        case 'AUSENTE':
            return '#D1D5DB'; // gray-300
        case 'FRATURA':
            return '#DC2626'; // red-600
        default:
            return '#FFFFFF';
    }
};

// Componente para renderizar um dente realista com SVG
const DenteRealista: React.FC<{
    tipo: string;
    cor: string;
    facesAfetadas: {
        oclusal: boolean;
        vestibular: boolean;
        lingual: boolean;
        mesial: boolean;
        distal: boolean;
    };
    isInferior: boolean;
    corFaceAfetada: string;
}> = ({ tipo, cor, facesAfetadas, isInferior, corFaceAfetada }) => {
    
    const renderIncisivo = () => (
        <svg width="45" height="70" viewBox="0 0 45 70" style={{ transform: isInferior ? 'rotate(180deg)' : 'none' }}>
            <defs>
                <linearGradient id={`shine-${tipo}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                </filter>
            </defs>
            
            {/* Raiz (não visível normalmente, mas adiciona profundidade) */}
            <path
                d="M 15 50 Q 15 65, 22.5 70 Q 30 65, 30 50 Z"
                fill="#F5E6D3"
                opacity="0.6"
            />
            
            {/* Face Oclusal (borda superior) */}
            <path
                d="M 10 8 Q 10 5, 12 4 L 33 4 Q 35 5, 35 8 Z"
                fill={facesAfetadas.oclusal ? corFaceAfetada : '#E8E8E8'}
                stroke="#999"
                strokeWidth="0.5"
                opacity={facesAfetadas.oclusal ? 1 : 0.7}
            />
            
            {/* Corpo do dente - Coroa */}
            {/* Face Vestibular (frontal) */}
            <path
                d="M 12 8 L 12 35 Q 12 45, 15 50 L 30 50 Q 33 45, 33 35 L 33 8 Q 32 6, 30 6 L 15 6 Q 13 6, 12 8 Z"
                fill={facesAfetadas.vestibular ? corFaceAfetada : cor}
                stroke="#666"
                strokeWidth="1.2"
                filter="url(#shadow)"
            />
            
            {/* Brilho realista */}
            <ellipse
                cx="18"
                cy="20"
                rx="6"
                ry="12"
                fill="url(#shine-incisivo)"
                opacity="0.5"
            />
            
            {/* Face Mesial (lateral esquerda) */}
            {facesAfetadas.mesial && (
                <path
                    d="M 10 8 L 12 8 L 15 50 L 13 50 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Distal (lateral direita) */}
            {facesAfetadas.distal && (
                <path
                    d="M 33 8 L 35 8 L 32 50 L 30 50 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Lingual (posterior) - sombra mais escura */}
            {facesAfetadas.lingual && (
                <ellipse
                    cx="22.5"
                    cy="25"
                    rx="8"
                    ry="20"
                    fill={corFaceAfetada}
                    opacity="0.7"
                    stroke="#555"
                    strokeWidth="1"
                />
            )}
            
            {/* Linhas de detalhe anatômico */}
            <line x1="12" y1="15" x2="12" y2="35" stroke="#CCC" strokeWidth="0.3" opacity="0.5" />
            <line x1="33" y1="15" x2="33" y2="35" stroke="#CCC" strokeWidth="0.3" opacity="0.5" />
        </svg>
    );

    const renderCanino = () => (
        <svg width="48" height="75" viewBox="0 0 48 75" style={{ transform: isInferior ? 'rotate(180deg)' : 'none' }}>
            <defs>
                <linearGradient id={`shine-canino`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                </filter>
            </defs>
            
            {/* Raiz */}
            <path
                d="M 16 55 Q 16 68, 24 75 Q 32 68, 32 55 Z"
                fill="#F5E6D3"
                opacity="0.5"
            />
            
            {/* Face Oclusal (ponta pontiaguda) */}
            <path
                d="M 20 6 L 24 3 L 28 6 Z"
                fill={facesAfetadas.oclusal ? corFaceAfetada : '#E8E8E8'}
                stroke="#999"
                strokeWidth="0.5"
                opacity={facesAfetadas.oclusal ? 1 : 0.7}
            />
            
            {/* Corpo - Face Vestibular (frontal pontiaguda) */}
            <path
                d="M 24 3 L 14 10 Q 12 12, 12 18 L 12 40 Q 12 50, 16 55 L 32 55 Q 36 50, 36 40 L 36 18 Q 36 12, 34 10 Z"
                fill={facesAfetadas.vestibular ? corFaceAfetada : cor}
                stroke="#666"
                strokeWidth="1.3"
                filter="url(#shadow)"
            />
            
            {/* Brilho realista */}
            <ellipse
                cx="20"
                cy="25"
                rx="5"
                ry="15"
                fill="url(#shine-canino)"
                opacity="0.5"
            />
            
            {/* Face Mesial (lateral esquerda) */}
            {facesAfetadas.mesial && (
                <path
                    d="M 12 18 L 14 10 L 16 55 L 12 40 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Distal (lateral direita) */}
            {facesAfetadas.distal && (
                <path
                    d="M 36 18 L 34 10 L 32 55 L 36 40 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Lingual (posterior) */}
            {facesAfetadas.lingual && (
                <ellipse
                    cx="24"
                    cy="28"
                    rx="9"
                    ry="22"
                    fill={corFaceAfetada}
                    opacity="0.7"
                    stroke="#555"
                    strokeWidth="1"
                />
            )}
            
            {/* Detalhes anatômicos - cristas */}
            <path
                d="M 24 3 L 24 20"
                stroke="#CCC"
                strokeWidth="0.4"
                opacity="0.6"
            />
        </svg>
    );

    const renderPreMolar = () => (
        <svg width="52" height="68" viewBox="0 0 52 68" style={{ transform: isInferior ? 'rotate(180deg)' : 'none' }}>
            <defs>
                <linearGradient id={`shine-premolar`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                </filter>
            </defs>
            
            {/* Raiz */}
            <path
                d="M 18 50 Q 18 63, 26 68 Q 34 63, 34 50 Z"
                fill="#F5E6D3"
                opacity="0.5"
            />
            
            {/* Face Oclusal (superfície de mastigação com duas cúspides) */}
            <path
                d="M 14 8 Q 12 6, 14 5 L 20 4 Q 22 5, 22 7 L 30 7 Q 30 5, 32 4 L 38 5 Q 40 6, 38 8 L 36 10 L 16 10 Z"
                fill={facesAfetadas.oclusal ? corFaceAfetada : '#E8E8E8'}
                stroke="#999"
                strokeWidth="0.5"
                opacity={facesAfetadas.oclusal ? 1 : 0.7}
            />
            
            {/* Corpo - Face Vestibular (frontal com duas cúspides) */}
            <path
                d="M 14 10 L 13 30 Q 13 42, 18 50 L 34 50 Q 39 42, 39 30 L 38 10 Q 38 8, 36 8 L 30 8 Q 28 9, 26 9 Q 24 9, 22 8 L 16 8 Q 14 8, 14 10 Z"
                fill={facesAfetadas.vestibular ? corFaceAfetada : cor}
                stroke="#666"
                strokeWidth="1.2"
                filter="url(#shadow)"
            />
            
            {/* Brilho realista */}
            <ellipse
                cx="22"
                cy="23"
                rx="7"
                ry="13"
                fill="url(#shine-premolar)"
                opacity="0.5"
            />
            
            {/* Face Mesial */}
            {facesAfetadas.mesial && (
                <path
                    d="M 12 10 L 14 10 L 18 50 L 16 50 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Distal */}
            {facesAfetadas.distal && (
                <path
                    d="M 38 10 L 40 10 L 36 50 L 34 50 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Lingual */}
            {facesAfetadas.lingual && (
                <ellipse
                    cx="26"
                    cy="25"
                    rx="10"
                    ry="18"
                    fill={corFaceAfetada}
                    opacity="0.7"
                    stroke="#555"
                    strokeWidth="1"
                />
            )}
            
            {/* Sulco central */}
            <line x1="26" y1="8" x2="26" y2="25" stroke="#AAA" strokeWidth="0.5" opacity="0.6" />
        </svg>
    );

    const renderMolar = () => (
        <svg width="58" height="65" viewBox="0 0 58 65" style={{ transform: isInferior ? 'rotate(180deg)' : 'none' }}>
            <defs>
                <linearGradient id={`shine-molar`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3"/>
                </filter>
            </defs>
            
            {/* Raízes múltiplas */}
            <path
                d="M 18 48 Q 16 58, 20 65 M 29 48 Q 29 60, 29 65 M 40 48 Q 42 58, 38 65"
                fill="none"
                stroke="#F5E6D3"
                strokeWidth="4"
                opacity="0.4"
            />
            
            {/* Face Oclusal (superfície de mastigação complexa com 4 cúspides) */}
            <path
                d="M 12 9 Q 10 7, 12 6 L 18 5 Q 20 6, 20 8 L 23 8 L 23 5 Q 25 4, 27 4 L 31 4 Q 33 4, 35 5 L 35 8 L 38 8 Q 38 6, 40 5 L 46 6 Q 48 7, 46 9 L 44 12 L 14 12 Z"
                fill={facesAfetadas.oclusal ? corFaceAfetada : '#E8E8E8'}
                stroke="#999"
                strokeWidth="0.5"
                opacity={facesAfetadas.oclusal ? 1 : 0.7}
            />
            
            {/* Corpo - Face Vestibular (frontal retangular com cúspides) */}
            <path
                d="M 12 12 L 11 32 Q 11 42, 18 48 L 40 48 Q 47 42, 47 32 L 46 12 Q 45 10, 43 10 L 38 10 Q 36 11, 35 11 L 29 11 L 23 11 L 20 11 Q 18 11, 16 10 L 15 10 Q 13 10, 12 12 Z"
                fill={facesAfetadas.vestibular ? corFaceAfetada : cor}
                stroke="#666"
                strokeWidth="1.3"
                filter="url(#shadow)"
            />
            
            {/* Brilho realista */}
            <ellipse
                cx="24"
                cy="24"
                rx="9"
                ry="14"
                fill="url(#shine-molar)"
                opacity="0.5"
            />
            
            {/* Face Mesial */}
            {facesAfetadas.mesial && (
                <path
                    d="M 10 12 L 12 12 L 18 48 L 16 48 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Distal */}
            {facesAfetadas.distal && (
                <path
                    d="M 46 12 L 48 12 L 42 48 L 40 48 Z"
                    fill={corFaceAfetada}
                    opacity="0.9"
                    stroke="#666"
                    strokeWidth="0.8"
                />
            )}
            
            {/* Face Lingual */}
            {facesAfetadas.lingual && (
                <ellipse
                    cx="29"
                    cy="26"
                    rx="12"
                    ry="18"
                    fill={corFaceAfetada}
                    opacity="0.7"
                    stroke="#555"
                    strokeWidth="1"
                />
            )}
            
            {/* Sulcos e fissuras características */}
            <path
                d="M 20 10 L 20 25 M 29 10 L 29 28 M 38 10 L 38 25"
                stroke="#AAA"
                strokeWidth="0.5"
                opacity="0.6"
            />
            <path
                d="M 15 20 Q 29 22, 43 20"
                stroke="#AAA"
                strokeWidth="0.4"
                opacity="0.5"
                fill="none"
            />
        </svg>
    );

    // Renderizar o tipo correto de dente
    switch (tipo) {
        case 'incisivo':
            return renderIncisivo();
        case 'canino':
            return renderCanino();
        case 'pre-molar':
            return renderPreMolar();
        case 'molar':
            return renderMolar();
        default:
            return renderIncisivo();
    }
};

const Dente: React.FC<DenteProps> = ({ numero, registros, onClick }) => {
    const ultimoRegistro = registros.length > 0 ? registros[0] : undefined;
    const tipo = getTipoDente(numero);
    const cor = getCorStatus(ultimoRegistro?.status);

    // Verificar se é dente superior ou inferior para orientação
    const quadrante = Math.floor(numero / 10);
    const isInferior = quadrante === 3 || quadrante === 4;

    // Verificar quais faces estão marcadas
    const facesAfetadas = {
        oclusal: ultimoRegistro?.faceOclusal || false,
        vestibular: ultimoRegistro?.faceVestibular || false,
        lingual: ultimoRegistro?.faceLingual || false,
        mesial: ultimoRegistro?.faceMesial || false,
        distal: ultimoRegistro?.faceDistal || false,
    };

    const temFacesAfetadas = Object.values(facesAfetadas).some(v => v);
    const corFaceAfetada = ultimoRegistro?.status ? getCorStatus(ultimoRegistro.status) : '#EF4444';

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                onClick={onClick}
                className="group relative transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1"
            >
                {/* Dente realista em SVG */}
                <DenteRealista 
                    tipo={tipo}
                    cor={cor}
                    facesAfetadas={facesAfetadas}
                    isInferior={isInferior}
                    corFaceAfetada={corFaceAfetada}
                />

                {/* Indicadores de faces afetadas */}
                {temFacesAfetadas && (
                    <div className="absolute -bottom-0 -right-0 flex gap-0.5 bg-white rounded-full p-0.5 shadow-md">
                        {facesAfetadas.oclusal && <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Oclusal" />}
                        {facesAfetadas.vestibular && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Vestibular" />}
                        {facesAfetadas.lingual && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Lingual" />}
                        {facesAfetadas.mesial && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Mesial" />}
                        {facesAfetadas.distal && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Distal" />}
                    </div>
                )}

                {/* Indicador de múltiplos registros */}
                {registros.length > 1 && (
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md z-10">
                        {registros.length}
                    </span>
                )}
            </button>

            {/* Número do dente */}
            <span className="text-xs font-semibold text-gray-600">{numero}</span>
        </div>
    );
};

export default Dente;
