import React, { useState, useEffect } from 'react';
import { User, Activity } from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';
import OdontogramaVisual from '../components/odontograma/OdontogramaVisual';
import { pacienteService } from '../services/pacienteService';
import type { Paciente } from '../types';

const Odontograma: React.FC = () => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [pacienteSelecionado, setPacienteSelecionado] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarPacientes();
    }, []);

    const carregarPacientes = async () => {
        try {
            setLoading(true);
            const data = await pacienteService.getAll();
            setPacientes(data);
        } catch (error) {
            console.error('Erro ao carregar pacientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const pacientesOptions = pacientes.map(p => ({
        value: p.id.toString(),
        label: p.nome
    }));

    const pacienteAtual = pacientes.find(p => p.id === pacienteSelecionado);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Odontograma</h1>
                        <p className="text-gray-600">Visualize e edite o mapa dentário dos pacientes</p>
                    </div>
                </div>

                {/* Seleção de Paciente */}
                <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selecione o Paciente
                    </label>
                    <SearchableSelect
                        options={pacientesOptions}
                        value={pacienteSelecionado?.toString()}
                        onChange={(value) => setPacienteSelecionado(value ? Number(value) : undefined)}
                        placeholder="Buscar paciente..."
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Odontograma */}
            {pacienteSelecionado ? (
                <div className="bg-white rounded-lg shadow p-6">
                    {pacienteAtual && (
                        <div className="mb-6 flex items-center space-x-3 pb-4 border-b border-gray-200">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{pacienteAtual.nome}</h2>
                                <p className="text-sm text-gray-600">
                                    {pacienteAtual.telefone && `Tel: ${pacienteAtual.telefone}`}
                                    {pacienteAtual.cpf && ` • CPF: ${pacienteAtual.cpf}`}
                                </p>
                            </div>
                        </div>
                    )}
                    <OdontogramaVisual pacienteId={pacienteSelecionado} />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-12">
                    <div className="text-center">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum paciente selecionado
                        </h3>
                        <p className="text-gray-600">
                            Selecione um paciente acima para visualizar e editar o odontograma
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Odontograma;

