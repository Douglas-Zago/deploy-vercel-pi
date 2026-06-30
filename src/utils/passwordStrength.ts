/** Caracteres especiais permitidos (alinhado à política do PACE) */
export const REGEX_CARACTERE_ESPECIAL_SENHA = /[!@#$%^&*()_+\-{}[\]:;<>,.?~\\]/

export type PasswordRuleId =
    | 'minLength'
    | 'uppercase'
    | 'lowercase'
    | 'number'
    | 'special'

export type PasswordRule = {
    id: PasswordRuleId
    label: string
    met: boolean
}

const MIN_CARACTERES = 8

export function getPasswordRules(password: string): PasswordRule[] {
    return [
        {
            id: 'minLength',
            label: '8 caracteres ou mais',
            met: password.length >= MIN_CARACTERES,
        },
        {
            id: 'uppercase',
            label: 'Letra maiúscula',
            met: /[A-Z]/.test(password),
        },
        {
            id: 'lowercase',
            label: 'Letra minúscula',
            met: /[a-z]/.test(password),
        },
        {
            id: 'number',
            label: 'Um número',
            met: /\d/.test(password),
        },
        {
            id: 'special',
            label: 'Um símbolo especial (!@#$…)',
            met: REGEX_CARACTERE_ESPECIAL_SENHA.test(password),
        },
    ]
}

export function countMetPasswordRules(password: string): number {
    return getPasswordRules(password).filter((r) => r.met).length
}

export function isStrongPassword(password: string): boolean {
    return countMetPasswordRules(password) === 5
}

export type StrengthMeterStyle = {
    barWidthClass: string
    barColorClass: string
    label: string
}

/** 0–2: vermelho · 3: amarelo · 4: azul · 5: verde */
export function getStrengthMeterStyle(metCount: number): StrengthMeterStyle {
    if (metCount >= 5) {
        return {
            barWidthClass: 'w-full',
            barColorClass: 'bg-green-500',
            label: 'Forte',
        }
    }
    if (metCount === 4) {
        return {
            barWidthClass: 'w-3/4',
            barColorClass: 'bg-blue-500',
            label: 'Boa',
        }
    }
    if (metCount === 3) {
        return {
            barWidthClass: 'w-2/4',
            barColorClass: 'bg-yellow-500',
            label: 'Média',
        }
    }
    return {
        barWidthClass: 'w-1/4',
        barColorClass: 'bg-red-500',
        label: metCount === 0 ? 'Digite uma senha' : 'Fraca',
    }
}
