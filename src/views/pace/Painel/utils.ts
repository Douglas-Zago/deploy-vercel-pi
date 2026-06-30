import { isPerfilGestao } from '@/constants/roles.constant'

export function formatarDataHojeExtenso(): string {
    const hoje = new Date()
    const diaSemana =
        hoje.toLocaleDateString('pt-BR', { weekday: 'long' }).charAt(0).toUpperCase() +
        hoje.toLocaleDateString('pt-BR', { weekday: 'long' }).slice(1)
    const mes =
        hoje.toLocaleDateString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() +
        hoje.toLocaleDateString('pt-BR', { month: 'long' }).slice(1)
    return `${diaSemana}, ${hoje.getDate()} de ${mes}`
}

export { isPerfilGestao } from '@/constants/roles.constant'

export function usuarioTemAcesso(
    authority: string[] | undefined,
    required?: string[],
): boolean {
    if (!required?.length) return true
    if (!authority?.length) return false
    return required.some((role) => authority.includes(role))
}
