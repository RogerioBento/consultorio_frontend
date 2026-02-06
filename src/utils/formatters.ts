export const formatCPF = (cpf: string): string => {
    const numeroLimpo = cpf.replace(/[^\d]/g, '');
    return numeroLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const mascaraCPF = (value: string): string => {
    const numeroLimpo = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numeroLimpo.length <= 3) return numeroLimpo;
    if (numeroLimpo.length <= 6) return numeroLimpo.replace(/(\d{3})(\d+)/, '$1.$2');
    if (numeroLimpo.length <= 9) return numeroLimpo.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return numeroLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
};

export const validarCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const numeroLimpo = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (numeroLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(numeroLimpo)) return false;
    
    // Valida o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(numeroLimpo.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    if (parseInt(numeroLimpo.charAt(9)) !== digito1) return false;
    
    // Valida o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(numeroLimpo.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    if (parseInt(numeroLimpo.charAt(10)) !== digito2) return false;
    
    return true;
};

export const formatPhone = (phone: string): string => {
    const numeroLimpo = phone.replace(/[^\d]/g, '');
    if (numeroLimpo.length === 10) {
        return numeroLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (numeroLimpo.length === 11) {
        return numeroLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
};

export const mascaraTelefone = (value: string): string => {
    const numeroLimpo = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numeroLimpo.length <= 2) return numeroLimpo;
    if (numeroLimpo.length <= 6) return numeroLimpo.replace(/(\d{2})(\d+)/, '($1) $2');
    if (numeroLimpo.length <= 10) return numeroLimpo.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return numeroLimpo.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
};

export const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

export const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('pt-BR');
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
};

export const formatMetodoPagamento = (metodo: string): string => {
    const metodos: Record<string, string> = {
        DINHEIRO: 'Dinheiro',
        CARTAO_DEBITO: 'Cartão de Débito',
        CARTAO_CREDITO: 'Cartão de Crédito',
        PIX: 'PIX',
        TRANSFERENCIA: 'Transferência'
    };
    return metodos[metodo] || metodo;
};

export const formatStatusParcela = (status: string): string => {
    const statusMap: Record<string, string> = {
        PENDENTE: 'Pendente',
        PAGO: 'Pago',
        ATRASADO: 'Atrasado',
        ESTORNADO: 'Estornado'
    };
    return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        PENDENTE: 'text-yellow-600 bg-yellow-100',
        PAGO: 'text-green-600 bg-green-100',
        ATRASADO: 'text-red-600 bg-red-100',
        ESTORNADO: 'text-gray-600 bg-gray-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
};
