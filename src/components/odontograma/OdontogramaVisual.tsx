import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Activity, CheckCircle } from 'lucide-react';
import Dente from './Dente';
import DenteModal from './DenteModal';
import { odontogramaService } from '../../services/odontogramaService';
import type { RegistroOdontograma } from '../../types/odontograma';
import { STATUS_LABELS, STATUS_COLORS, DENTES_INFO } from '../../types/odontograma';

interface OdontogramaVisualProps {
    pacienteId: number;
}

const OdontogramaVisual: React.FC<OdontogramaVisualProps> = ({ pacienteId }) => {
    const [registros, setRegistros] = useState<RegistroOdontograma[]>([]);
    const [loading, setLoading] = useState(true);
    const [denteSelecionado, setDenteSelecionado] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Dentes organizados por quadrante (notação FDI)
    const dentesSuperioresDireito = [18, 17, 16, 15, 14, 13, 12, 11]; // Quadrante 1
    const dentesSuperioresEsquerdo = [21, 22, 23, 24, 25, 26, 27, 28]; // Quadrante 2
    const dentesInferioresEsquerdo = [38, 37, 36, 35, 34, 33, 32, 31]; // Quadrante 3
    const dentesInferioresDireito = [41, 42, 43, 44, 45, 46, 47, 48]; // Quadrante 4

    useEffect(() => {
        carregarRegistros();
    }, [pacienteId]);

    const carregarRegistros = async () => {
        try {
            setLoading(true);
            const data = await odontogramaService.getEstadoAtual(pacienteId);
            setRegistros(data);
        } catch (error) {
            console.error('Erro ao carregar odontograma:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDenteClick = (numeroDente: number) => {
        setDenteSelecionado(numeroDente);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setDenteSelecionado(null);
    };

    const handleRegistroSalvo = () => {
        carregarRegistros();
        handleModalClose();
    };

    const getRegistrosPorDente = (numeroDente: number): RegistroOdontograma[] => {
        return registros.filter(r => r.numeroDente === numeroDente);
    };

    // Obter dentes com problemas (não saudáveis)
    const dentesComProblemas = registros.filter(r => r.status !== 'SAUDAVEL' && r.status !== 'AUSENTE');
    
    // Contar dentes por status
    const contagemStatus = registros.reduce((acc, reg) => {
        acc[reg.status] = (acc[reg.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando odontograma...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Legenda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
                        <p className="text-sm text-blue-800">
                            Clique em qualquer dente para registrar procedimentos, visualizar histórico ou editar informações.
                            A cor do dente indica seu status atual.
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumo do Estado Atual */}
            {registros.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary-600" />
                        <span>Resumo do Estado Atual</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Total Registrado</p>
                            <p className="text-2xl font-bold text-gray-900">{registros.length}</p>
                            <p className="text-xs text-gray-500">de 32 dentes</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-green-700 mb-1">Saudáveis</p>
                            <p className="text-2xl font-bold text-green-900">{contagemStatus['SAUDAVEL'] || 0}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-xs text-yellow-700 mb-1">Com Tratamento</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {(contagemStatus['RESTAURACAO'] || 0) + (contagemStatus['CANAL'] || 0) + (contagemStatus['PROTESE'] || 0) + (contagemStatus['IMPLANTE'] || 0)}
                            </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-red-700 mb-1">Requer Atenção</p>
                            <p className="text-2xl font-bold text-red-900">
                                {(contagemStatus['CARIE'] || 0) + (contagemStatus['FRATURA'] || 0)}
                            </p>
                        </div>
                    </div>

                    {dentesComProblemas.length > 0 && (
                        <div className="border-t border-gray-200 pt-3">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Dentes que Requerem Atenção:</h5>
                            <div className="flex flex-wrap gap-2">
                                {dentesComProblemas.map((reg) => (
                                    <button
                                        key={reg.id}
                                        onClick={() => handleDenteClick(reg.numeroDente)}
                                        className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 hover:shadow-md transition-all"
                                        style={{ 
                                            borderColor: STATUS_COLORS[reg.status],
                                            backgroundColor: `${STATUS_COLORS[reg.status]}15`
                                        }}
                                    >
                                        <span className="font-bold text-gray-900">{reg.numeroDente}</span>
                                        <span className="text-xs text-gray-600">
                                            {DENTES_INFO[reg.numeroDente]?.nome || 'Dente'}
                                        </span>
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: STATUS_COLORS[reg.status] }}
                                        />
                                        <span className="text-xs font-medium" style={{ color: STATUS_COLORS[reg.status] }}>
                                            {STATUS_LABELS[reg.status]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {dentesComProblemas.length === 0 && registros.length > 0 && (
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    Todos os dentes registrados estão saudáveis! 🎉
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Legenda de Cores */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Legenda de Status:</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                        <span className="text-xs text-gray-700">Saudável</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                        <span className="text-xs text-gray-700">Cárie</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                        <span className="text-xs text-gray-700">Restauração</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                        <span className="text-xs text-gray-700">Canal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                        <span className="text-xs text-gray-700">Prótese</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06B6D4' }}></div>
                        <span className="text-xs text-gray-700">Implante</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B7280' }}></div>
                        <span className="text-xs text-gray-700">Extraído</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D1D5DB' }}></div>
                        <span className="text-xs text-gray-700">Ausente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                        <span className="text-xs text-gray-700">Fratura</span>
                    </div>
                </div>
            </div>

            {/* Odontograma */}
            <div className="bg-gradient-to-b from-blue-50 to-white border border-gray-200 rounded-xl p-8">
                {/* Arcada Superior */}
                <div className="mb-12">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Arcada Superior</h3>
                    </div>
                    <div className="flex justify-center space-x-8">
                        {/* Quadrante 1 - Superior Direito */}
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-500 mb-2">Lado Direito</span>
                            <div 
                                className="flex items-end space-x-1"
                                style={{
                                    transform: 'perspective(600px) rotateX(-5deg)',
                                }}
                            >
                                {dentesSuperioresDireito.map((numero) => (
                                    <Dente
                                        key={numero}
                                        numero={numero}
                                        registros={getRegistrosPorDente(numero)}
                                        onClick={() => handleDenteClick(numero)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Linha Central */}
                        <div className="flex items-center">
                            <div className="w-px h-20 bg-red-400 mx-3" 
                                style={{ 
                                    boxShadow: '0 0 4px rgba(248, 113, 113, 0.5)',
                                }}
                            />
                        </div>

                        {/* Quadrante 2 - Superior Esquerdo */}
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-500 mb-2">Lado Esquerdo</span>
                            <div 
                                className="flex items-end space-x-1"
                                style={{
                                    transform: 'perspective(600px) rotateX(-5deg)',
                                }}
                            >
                                {dentesSuperioresEsquerdo.map((numero) => (
                                    <Dente
                                        key={numero}
                                        numero={numero}
                                        registros={getRegistrosPorDente(numero)}
                                        onClick={() => handleDenteClick(numero)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t-2 border-dashed border-gray-300 my-8"></div>

                {/* Arcada Inferior */}
                <div>
                    <div className="flex justify-center space-x-8">
                        {/* Quadrante 4 - Inferior Direito */}
                        <div className="flex flex-col items-center">
                            <div 
                                className="flex items-start space-x-1"
                                style={{
                                    transform: 'perspective(600px) rotateX(5deg)',
                                }}
                            >
                                {dentesInferioresDireito.map((numero) => (
                                    <Dente
                                        key={numero}
                                        numero={numero}
                                        registros={getRegistrosPorDente(numero)}
                                        onClick={() => handleDenteClick(numero)}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-500 mt-2">Lado Direito</span>
                        </div>

                        {/* Linha Central */}
                        <div className="flex items-center">
                            <div className="w-px h-20 bg-red-400 mx-3" 
                                style={{ 
                                    boxShadow: '0 0 4px rgba(248, 113, 113, 0.5)',
                                }}
                            />
                        </div>

                        {/* Quadrante 3 - Inferior Esquerdo */}
                        <div className="flex flex-col items-center">
                            <div 
                                className="flex items-start space-x-1"
                                style={{
                                    transform: 'perspective(600px) rotateX(5deg)',
                                }}
                            >
                                {dentesInferioresEsquerdo.map((numero) => (
                                    <Dente
                                        key={numero}
                                        numero={numero}
                                        registros={getRegistrosPorDente(numero)}
                                        onClick={() => handleDenteClick(numero)}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-500 mt-2">Lado Esquerdo</span>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <h3 className="text-lg font-semibold text-gray-700">Arcada Inferior</h3>
                    </div>
                </div>
            </div>

            {/* Modal do Dente */}
            {showModal && denteSelecionado && (
                <DenteModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    numeroDente={denteSelecionado}
                    pacienteId={pacienteId}
                    onSuccess={handleRegistroSalvo}
                />
            )}
        </div>
    );
};

export default OdontogramaVisual;
