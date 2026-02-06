import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number | undefined;
    onChange: (value: string | number | undefined) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
    required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Selecione uma opção',
    label,
    disabled = false,
    error,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filtrar opções baseado no termo de busca
    useEffect(() => {
        if (searchTerm) {
            const filtered = options.filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focar no input de busca quando abrir
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Campo de Seleção */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    relative w-full px-4 py-2 border rounded-lg cursor-pointer
                    transition-all duration-200
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-primary-400'}
                    ${isOpen ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'}
                    ${error ? 'border-red-500' : ''}
                `}
            >
                <div className="flex items-center justify-between">
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className="flex items-center space-x-2">
                        {selectedOption && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                                isOpen ? 'transform rotate-180' : ''
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Dropdown com Busca */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Campo de Busca */}
                    <div className="p-2 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Digite para buscar..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Lista de Opções */}
                    <div className="overflow-y-auto max-h-60">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                Nenhum resultado encontrado
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        px-4 py-2 cursor-pointer transition-colors
                                        ${
                                            option.value === value
                                                ? 'bg-primary-50 text-primary-700 font-medium'
                                                : 'hover:bg-gray-100 text-gray-900'
                                        }
                                    `}
                                >
                                    {option.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Mensagem de Erro */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default SearchableSelect;

