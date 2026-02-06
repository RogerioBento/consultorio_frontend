import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Clock, User } from 'lucide-react';
import { odontogramaService } from '../../services/odontogramaService';
import { useAuth } from '../../hooks/useAuth';
import type { Odontograma, StatusDente, OdontogramaDTO } from '../../types/odontograma';
import { STATUS_LABELS, STATUS_COLORS, DENTES_INFO } from '../../types/odontograma';
import { formatDate } from '../../utils/formatters';

interface DenteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    numeroDente: number;
    pacienteId: number;
}

const DenteModal: React.FC<DenteModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    numeroDente,
    pacienteId,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [historico, setHistorico] = useState<Odontograma[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);

    const [formData, setFormData] = useState({
        status: 'SAUDAVEL' as StatusDente,
        procedimento: '',
        observacoes: '',
        faceOclusal: false,
        faceVestibular: false,
        faceLingual: false,
        faceMesial: false,
        faceDistal: false,
    });

    const denteInfo = DENTES_INFO[numeroDente];
    const isDentista = user?.cargo === 'DENTISTA' || user?.cargo === 'ADMIN';

    useEffect(() => {
        if (isOpen) {
            carregarHistorico();
            // Reset form
            setFormData({
                status: 'SAUDAVEL',
                procedimento: '',
                observacoes: '',
                faceOclusal: false,
                faceVestibular: false,
                faceLingual: false,
                faceMesial: false,
                faceDistal: false,
            });
            setError('');
        }
    }, [isOpen, numeroDente]);

    const carregarHistorico = async () => {
        try {
            setLoadingHistorico(true);
            const data = await odontogramaService.getHistoricoDente(pacienteId, numeroDente);
            setHistorico(data);
            
            // Se há histórico, preencher com o último registro
            if (data.length > 0) {
                const ultimo = data[0];
                setFormData({
                    status: ultimo.status,
                    procedimento: ultimo.procedimento || '',
                    observacoes: ultimo.observacoes || '',
                    faceOclusal: ultimo.faceOclusal || false,
                    faceVestibular: ultimo.faceVestibular || false,
                    faceLingual: ultimo.faceLingual || false,
                    faceMesial: ultimo.faceMesial || false,
                    faceDistal: ultimo.faceDistal || false,
                });
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoadingHistorico(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }

        if (!isDentista) {
            setError('Apenas dentistas podem editar o odontograma.');
            return;
        }

        setLoading(true);

        try {
            const dto: OdontogramaDTO = {
                pacienteId,
                dentistaId: user.id,
                numeroDente,
                status: formData.status,
                procedimento: formData.procedimento || undefined,
                observacoes: formData.observacoes || undefined,
                faceOclusal: formData.faceOclusal,
                faceVestibular: formData.faceVestibular,
                faceLingual: formData.faceLingual,
                faceMesial: formData.faceMesial,
                faceDistal: formData.faceDistal,
            };

            await odontogramaService.registrar(dto);
            alert('✅ Alteração registrada com sucesso!');
            onSuccess();
        } catch (err: any) {
            console.error('Erro ao salvar odontograma:', err);
            setError(err.response?.data?.message || 'Erro ao salvar odontograma.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Dente {numeroDente}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {denteInfo?.nome} - Quadrante {denteInfo?.quadrante}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-600">{error}</span>
                        </div>
                    )}

                    {/* Formulário de Edição (apenas para dentistas) */}
                    {isDentista && (
                        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Registrar Alteração</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status do Dente *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                    disabled={loading}
                                >
                                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {/* Visualização da cor */}
                                <div className="mt-2 flex items-center space-x-2">
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: STATUS_COLORS[formData.status] }}
                                    />
                                    <span className="text-sm text-gray-600">
                                        Cor de visualização
                                    </span>
                                </div>
                            </div>

                            {/* Faces do Dente Afetadas */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Faces Afetadas
                                </label>
                                <p className="text-xs text-gray-600 mb-3">
                                    Marque quais faces do dente estão afetadas pelo problema identificado
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            name="faceOclusal"
                                            checked={formData.faceOclusal}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Oclusal (Superior)
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            name="faceVestibular"
                                            checked={formData.faceVestibular}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Vestibular (Frontal)
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            name="faceLingual"
                                            checked={formData.faceLingual}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Lingual (Posterior)
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            name="faceMesial"
                                            checked={formData.faceMesial}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Mesial (Interna)
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            name="faceDistal"
                                            checked={formData.faceDistal}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Distal (Externa)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedimento Realizado
                                </label>
                                <textarea
                                    name="procedimento"
                                    value={formData.procedimento}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Descreva o procedimento realizado"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observações
                                </label>
                                <textarea
                                    name="observacoes"
                                    value={formData.observacoes}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows={2}
                                    placeholder="Observações adicionais"
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-secondary"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar Alteração'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Mensagem para secretárias */}
                    {!isDentista && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                Você está visualizando o odontograma. Apenas dentistas podem fazer alterações.
                            </p>
                        </div>
                    )}

                    {/* Histórico */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>

                        {loadingHistorico ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Carregando histórico...</p>
                            </div>
                        ) : historico.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">Nenhum registro encontrado</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Este dente ainda não possui histórico
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {historico.map((registro) => (
                                    <div
                                        key={registro.id}
                                        className="border rounded-lg p-4 bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                                                    style={{ backgroundColor: STATUS_COLORS[registro.status] }}
                                                />
                                                <span className="font-semibold text-gray-900">
                                                    {STATUS_LABELS[registro.status]}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(registro.dataRegistro)}
                                            </span>
                                        </div>

                                        {registro.procedimento && (
                                            <div className="mb-2">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Procedimento:</strong> {registro.procedimento}
                                                </p>
                                            </div>
                                        )}

                                        {registro.observacoes && (
                                            <div className="mb-2">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Observações:</strong> {registro.observacoes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Faces afetadas */}
                                        {(registro.faceOclusal || registro.faceVestibular || registro.faceLingual || registro.faceMesial || registro.faceDistal) && (
                                            <div className="mb-2">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">Faces Afetadas:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {registro.faceOclusal && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Oclusal
                                                        </span>
                                                    )}
                                                    {registro.faceVestibular && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Vestibular
                                                        </span>
                                                    )}
                                                    {registro.faceLingual && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Lingual
                                                        </span>
                                                    )}
                                                    {registro.faceMesial && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Mesial
                                                        </span>
                                                    )}
                                                    {registro.faceDistal && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Distal
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                                            <User className="w-4 h-4" />
                                            <span>Dr(a). {registro.dentista.nome}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DenteModal;

