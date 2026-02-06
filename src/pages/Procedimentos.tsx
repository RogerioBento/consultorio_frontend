import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

const Procedimentos: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Por enquanto, deixamos vazio pois precisamos de um atendimento ID
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Procedimentos</h1>
            </div>

            <div className="card">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                        Selecione um atendimento para visualizar os procedimentos
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Procedimentos;
