/**
 * Gera senha aleatória forte (mín. 8 caracteres) com maiúsculas, minúsculas, números e símbolos.
 */
export function gerarSenhaSegura(comprimento = 12): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lower = 'abcdefghjkmnpqrstuvwxyz'
    const numbers = '23456789'
    const symbols = '!@#$%&*'
    const all = upper + lower + numbers + symbols
    const tamanho = Math.max(8, comprimento)

    const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)]

    const obrigatorios = [pick(upper), pick(lower), pick(numbers), pick(symbols)]
    const restantes = Array.from({ length: tamanho - obrigatorios.length }, () => pick(all))
    const chars = [...obrigatorios, ...restantes]

    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }

    return chars.join('')
}
