import { useMemo } from 'react'
import {
    countMetPasswordRules,
    getPasswordRules,
    getStrengthMeterStyle,
} from '@/utils/passwordStrength'

type PasswordStrengthFeedbackProps = {
    password: string
    className?: string
    id?: string
}

const PasswordStrengthFeedback = ({
    password,
    className = '',
    id = 'password-strength-feedback',
}: PasswordStrengthFeedbackProps) => {
    const regras = useMemo(() => getPasswordRules(password), [password])
    const metCount = useMemo(
        () => countMetPasswordRules(password),
        [password],
    )
    const meter = useMemo(() => getStrengthMeterStyle(metCount), [metCount])

    return (
        <div
            id={id}
            className={`space-y-2 ${className}`.trim()}
            aria-live="polite"
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Força da senha
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {meter.label}
                </span>
            </div>

            <div
                className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={metCount}
                aria-label={`Força da senha: ${meter.label}`}
            >
                <div
                    className={`h-full rounded-full transition-all duration-300 ${meter.barWidthClass} ${meter.barColorClass}`}
                />
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {regras.map((regra) => (
                    <li
                        key={regra.id}
                        className={`flex items-center gap-1.5 text-xs ${
                            regra.met
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 dark:text-gray-500'
                        }`}
                    >
                        {regra.met ? (
                            <svg
                                className="w-3.5 h-3.5 shrink-0 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <span
                                className="w-3.5 h-3.5 shrink-0 rounded-full border border-gray-300 dark:border-gray-600"
                                aria-hidden
                            />
                        )}
                        <span className={regra.met ? 'font-medium' : ''}>
                            {regra.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default PasswordStrengthFeedback
