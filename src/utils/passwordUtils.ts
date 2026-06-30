/** Gera senha inicial: Pace + 3 primeiros dígitos numéricos do CPF */
export function initialPasswordFromCpf(cpf: string): string {
    const digits = cpf.replace(/\D/g, '')
    return `Pace${digits.slice(0, 3)}`
}
