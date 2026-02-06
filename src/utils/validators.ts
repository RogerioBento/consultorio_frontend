// Validação de CPF
export const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Verifica se todos os dígitos são iguais

    let soma = 0;
    let resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
};

// Validação de Email
export const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.(com|com\.br|org|net|edu|gov)$/i;
    return regex.test(email);
};

// Validação de Telefone (DDD + 8 ou 9 dígitos)
export const validarTelefone = (telefone: string): boolean => {
    const numeroLimpo = telefone.replace(/[^\d]/g, '');
    // DDD (2 ou 3 dígitos) + número (8 ou 9 dígitos) = 10 ou 11 dígitos
    return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
};
