// src/views/pace/Laboratorios/index.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import { isPerfilGestao } from '@/constants/roles.constant'
import { LaboratoriosService, Laboratorio, ReservaLab } from '@/services/LaboratoriosService'

const Laboratorios = () => {
    // --- SEGURANÇA E CONTEXTO ---
    const { user } = useAuth()
    const isGestao = isPerfilGestao(user?.authority)
    const nomeUsuarioLogado = user?.userName || 'Usuário Desconhecido'

    // --- ESTADOS BASE ---
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
    const [reservas, setReservas] = useState<ReservaLab[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // --- UI STATE GERAL ---
    const [labSelecionado, setLabSelecionado] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- MODAIS ---
    const [isCriandoReserva, setIsCriandoReserva] = useState(false)
    const [isGerenciandoLabs, setIsGerenciandoLabs] = useState(false)
    const [labEmEdicao, setLabEmEdicao] = useState<Laboratorio | null>(null)

    const hoje = new Date().toISOString().split('T')[0]

    // --- FORM RESERVA ---
    const [novaReserva, setNovaReserva] = useState({
        laboratorioId: 0,
        motivo: '',
        dataReserva: hoje,
        horaInicio: '08:00',
        horaFim: '09:40',
        tipo: 'pendente',
    })

    const fetchDados = async () => {
        try {
            setIsLoading(true)
            const [labs, res] = await Promise.all([
                LaboratoriosService.getLaboratorios(),
                LaboratoriosService.getReservas(),
            ])

            setLaboratorios(labs)
            setReservas(res)

            if (labs.length > 0 && !labSelecionado) {
                setLabSelecionado(labs[0].id)
                setNovaReserva((prev) => ({ ...prev, laboratorioId: labs[0].id }))
            }
        } catch (error) {
            console.error('Erro:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDados()
    }, [])

    // --- HELPERS DE VALIDAÇÃO ---
    const timeToMinutes = (hora: string) => {
        const [h, m] = hora.split(':').map(Number)
        return h * 60 + m
    }

    const formatarDataBR = (data: string) => data.split('-').reverse().join('/')

    const existeConflitoReserva = ({
        laboratorioId,
        dataReserva,
        horaInicio,
        horaFim,
        reservaIgnoradaId,
    }: {
        laboratorioId: number
        dataReserva: string
        horaInicio: string
        horaFim: string
        reservaIgnoradaId?: number
    }) => {
        const inicioNova = timeToMinutes(horaInicio)
        const fimNova = timeToMinutes(horaFim)

        return reservas.find((reserva) => {
            if (reserva.id === reservaIgnoradaId) return false
            if (reserva.laboratorioId !== laboratorioId) return false
            if (reserva.dataReserva !== dataReserva) return false

            const inicioExistente = timeToMinutes(reserva.horaInicio)
            const fimExistente = timeToMinutes(reserva.horaFim)

            return inicioNova < fimExistente && fimNova > inicioExistente
        })
    }

    // --- AÇÕES DE RESERVA ---
    const handleCriarReserva = async (e: React.FormEvent) => {
        e.preventDefault()

        const motivo = novaReserva.motivo.trim()
        const inicioMin = timeToMinutes(novaReserva.horaInicio)
        const fimMin = timeToMinutes(novaReserva.horaFim)

        if (!novaReserva.laboratorioId) {
            alert('Selecione um laboratório.')
            return
        }

        if (!motivo) {
            alert('Informe o motivo da reserva.')
            return
        }

        if (fimMin <= inicioMin) {
            alert('O horário de fim deve ser maior que o horário de início.')
            return
        }

        const conflito = existeConflitoReserva({
            laboratorioId: novaReserva.laboratorioId,
            dataReserva: novaReserva.dataReserva,
            horaInicio: novaReserva.horaInicio,
            horaFim: novaReserva.horaFim,
        })

        if (conflito) {
            const laboratorioNome =
                laboratorios.find((lab) => lab.id === novaReserva.laboratorioId)?.nome || 'laboratório selecionado'

            alert(
                `Conflito de reserva detectado.\n\nJá existe uma reserva para ${laboratorioNome} em ${formatarDataBR(
                    conflito.dataReserva ?? '',
                )}, das ${conflito.horaInicio} às ${conflito.horaFim}.\n\nMotivo: ${conflito.motivo}`,
            )
            return
        }

        try {
            setIsSubmitting(true)

            const labNome = laboratorios.find((lab) => lab.id === novaReserva.laboratorioId)?.nome

            await LaboratoriosService.createReserva({
                laboratorioId: novaReserva.laboratorioId,
                laboratorioNome: labNome ?? null,
                motivo,
                dataReserva: novaReserva.dataReserva,
                horaInicio: novaReserva.horaInicio,
                horaFim: novaReserva.horaFim,
                status: isGestao && novaReserva.tipo === 'manutencao' ? 'manutencao' : 'pendente',
                solicitanteNome: isGestao ? 'Equipe Gestora' : nomeUsuarioLogado,
            })

            await fetchDados()
            setIsCriandoReserva(false)
            setNovaReserva((prev) => ({
                ...prev,
                motivo: '',
                horaInicio: '08:00',
                horaFim: '09:40',
            }))
        } catch (error) {
            alert('Erro ao criar reserva.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAprovar = async (id: number) => {
        try {
            await LaboratoriosService.aprovarReserva(id)
            await fetchDados()
        } catch (error) {
            alert('Erro ao aprovar.')
        }
    }

    const handleReverter = async (id: number) => {
        if (!window.confirm("Deseja voltar esta reserva para a fila de 'Aguardando Admin'?")) return
        try {
            await LaboratoriosService.reverterReserva(id)
            await fetchDados()
        } catch (error) {
            alert('Erro ao reverter o status.')
        }
    }

    const handleDeletarReserva = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return
        try {
            await LaboratoriosService.deletarReserva(id)
            await fetchDados()
        } catch (error) {
            alert('Erro ao cancelar.')
        }
    }

    // --- AÇÕES DE LABORATÓRIOS (ADMIN) ---
    const handleSalvarLab = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!labEmEdicao) return

        try {
            setIsSubmitting(true)
            await LaboratoriosService.salvarLaboratorio({
                id: labEmEdicao.id || undefined,
                nome: labEmEdicao.nome,
                capacidade: labEmEdicao.capacidade ?? undefined,
                recursos: labEmEdicao.recursos ?? undefined,
                descricao: labEmEdicao.descricao ?? undefined,
                localizacao: labEmEdicao.localizacao ?? undefined,
            })
            await fetchDados()
            setLabEmEdicao(null)
        } catch (error) {
            alert('Erro ao salvar espaço.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeletarLab = async (id: number) => {
        if (!window.confirm('ATENÇÃO: Excluir este laboratório também apagará todas as reservas dele. Continuar?')) return

        try {
            await LaboratoriosService.deletarLaboratorio(id)
            if (labSelecionado === id) {
                setLabSelecionado(laboratorios.find((lab) => lab.id !== id)?.id || null)
            }
            await fetchDados()
        } catch (error) {
            alert('Erro ao excluir espaço.')
        }
    }

    // --- FILTROS ---
    const reservasDoLabAtuais = useMemo(() => {
        if (!labSelecionado) return []

        return reservas
            .filter((r) => r.laboratorioId === labSelecionado && (r.dataReserva ?? '') >= hoje)
            .sort((a, b) => {
                const dataA = a.dataReserva ?? ''
                const dataB = b.dataReserva ?? ''
                if (dataA !== dataB) return dataA.localeCompare(dataB)
                if (a.horaInicio !== b.horaInicio) return a.horaInicio.localeCompare(b.horaInicio)
                return a.horaFim.localeCompare(b.horaFim)
            })
    }, [reservas, labSelecionado, hoje])

    // --- ESTILOS ---
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmado':
                return {
                    label: 'Confirmado',
                    mobileLabel: 'Confirmado',
                    cor: 'bg-green-500',
                    bgCard: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    text: 'text-green-800 dark:text-green-300',
                }
            case 'pendente':
                return {
                    label: 'Aguardando Admin',
                    mobileLabel: 'Pendente',
                    cor: 'bg-yellow-400',
                    bgCard: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    text: 'text-yellow-800 dark:text-yellow-300',
                }
            case 'manutencao':
                return {
                    label: 'Manutenção',
                    mobileLabel: 'Manutenção',
                    cor: 'bg-red-500',
                    bgCard: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-800',
                    text: 'text-red-800 dark:text-red-300',
                }
            default:
                return {
                    label: 'Desconhecido',
                    mobileLabel: 'Status',
                    cor: 'bg-gray-500',
                    bgCard: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-800',
                }
        }
    }

    return (
        <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 w-full px-3 sm:px-4 md:px-8 py-3 sm:py-4">
            {/* CABEÇALHO */}
            <Reveal direction="down">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                            Reserva de Espaços
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 mt-1">
                            Consulte a agenda e reserve os laboratórios.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCriandoReserva(true)}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 sm:px-6 md:px-8 rounded-xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg"
                    >
                        <span>+</span> Solicitar Reserva
                    </button>
                </div>
            </Reveal>

            {isLoading ? (
                <div className="h-72 sm:h-96 bg-white dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 items-start">
                    {/* COLUNA ESQUERDA: LISTA DE LABORATÓRIOS */}
                    <Reveal direction="right" className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
                        <div className="flex justify-between items-center px-1 sm:px-2 mb-1 sm:mb-2 gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                Selecione o Ambiente
                            </h3>
                            {isGestao && (
                                <button
                                    onClick={() => setIsGerenciandoLabs(true)}
                                    className="shrink-0 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                >
                                    ⚙️ Gerenciar
                                </button>
                            )}
                        </div>

                        {laboratorios.map((lab) => (
                            <div
                                key={lab.id}
                                onClick={() => {
                                    setLabSelecionado(lab.id)
                                    setNovaReserva((prev) => ({ ...prev, laboratorioId: lab.id }))
                                }}
                                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                    labSelecionado === lab.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md sm:transform sm:scale-[1.02]'
                                        : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm'
                                }`}
                            >
                                <h4
                                    className={`text-base sm:text-lg font-bold leading-tight ${
                                        labSelecionado === lab.id
                                            ? 'text-indigo-700 dark:text-indigo-400'
                                            : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                >
                                    {lab.nome}
                                </h4>

                                <div className="mt-2.5 sm:mt-3 flex flex-col gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <span>👥 Capacidade: {lab.capacidade} alunos</span>
                                    <span className="line-clamp-2 sm:line-clamp-1">💻 {lab.recursos}</span>
                                </div>
                            </div>
                        ))}
                    </Reveal>

                    {/* COLUNA DIREITA: AGENDA DO LABORATÓRIO SELECIONADO */}
                    <Reveal
                        direction="up"
                        delay={100}
                        className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[420px] sm:min-h-[500px]"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 sm:mb-6 md:mb-8 gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5 md:pb-6">
                            <div className="min-w-0">
                                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                    {laboratorios.find((l) => l.id === labSelecionado)?.nome}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 mt-1">
                                    Agenda futura de reservas e aulas.
                                </p>
                            </div>

                            <div className="w-full md:w-auto flex flex-col gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></span>
                                    Confirmado
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400 animate-pulse"></span>
                                    Pendente
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></span>
                                    Manutenção
                                </div>
                            </div>
                        </div>

                        {reservasDoLabAtuais.length > 0 ? (
                            <div className="flex flex-col gap-3 sm:gap-4">
                                {reservasDoLabAtuais.map((reserva) => {
                                    const config = getStatusConfig(reserva.status ?? '')
                                    const dataFormatada = formatarDataBR(reserva.dataReserva ?? '')

                                    return (
                                        <div
                                            key={reserva.id}
                                            className={`flex flex-col sm:flex-row items-stretch border ${config.border} ${config.bgCard} rounded-2xl overflow-hidden transition-all hover:shadow-md`}
                                        >
                                            <div
                                                className={`sm:w-32 md:w-40 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r ${config.border} bg-white/50 dark:bg-gray-900/30`}
                                            >
                                                <div className="flex flex-col items-start sm:items-center min-w-0">
                                                    <span className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                                                        {dataFormatada}
                                                    </span>
                                                    <span className={`text-lg sm:text-xl font-extrabold ${config.text}`}>
                                                        {reserva.horaInicio}
                                                    </span>
                                                </div>

                                                <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase shrink-0">
                                                    até
                                                </span>

                                                <div className="flex flex-col items-end sm:items-center min-w-0">
                                                    <span className={`text-lg sm:text-xl font-extrabold ${config.text}`}>
                                                        {reserva.horaFim}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-center min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight break-words min-w-0">
                                                        {reserva.motivo}
                                                    </h4>

                                                    <span
                                                        className={`self-start text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full text-white shadow-sm whitespace-nowrap ${config.cor}`}
                                                    >
                                                        <span className="sm:hidden">{config.mobileLabel}</span>
                                                        <span className="hidden sm:inline">{config.label}</span>
                                                    </span>
                                                </div>

                                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1 sm:mt-2 min-w-0">
                                                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] sm:text-xs shadow-sm shrink-0">
                                                        👤
                                                    </span>
                                                    <span className="truncate">
                                                        Solicitante:{' '}
                                                        <strong className="text-gray-900 dark:text-gray-200">
                                                            {reserva.solicitanteNome}
                                                        </strong>
                                                    </span>
                                                </p>

                                                {isGestao && (
                                                    <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row sm:flex-wrap justify-end gap-2 sm:gap-3">
                                                        {reserva.status === 'pendente' && (
                                                            <button
                                                                onClick={() => handleAprovar(reserva.id)}
                                                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all shadow-sm"
                                                            >
                                                                ✅ Aprovar
                                                            </button>
                                                        )}

                                                        {reserva.status === 'confirmado' && (
                                                            <button
                                                                onClick={() => handleReverter(reserva.id)}
                                                                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all shadow-sm"
                                                            >
                                                                ⏪ Reverter
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDeletarReserva(reserva.id)}
                                                            className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/60 dark:text-red-400 text-sm font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all shadow-sm"
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center opacity-50 px-4">
                                <span className="text-5xl sm:text-6xl mb-4">✨</span>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    Agenda Livre!
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 mt-2">
                                    Nenhuma reserva futura para este laboratório.
                                </p>
                            </div>
                        )}
                    </Reveal>
                </div>
            )}

            {/* MODAL 1: SOLICITAR RESERVA */}
            {isCriandoReserva && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <Reveal direction="up" duration={300} className="w-full max-w-lg">
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                                    Nova Reserva de Espaço
                                </h3>
                                <button
                                    onClick={() => setIsCriandoReserva(false)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCriarReserva} className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        Espaço / Laboratório *
                                    </label>
                                    <select
                                        required
                                        value={novaReserva.laboratorioId}
                                        onChange={(e) =>
                                            setNovaReserva({ ...novaReserva, laboratorioId: Number(e.target.value) })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none appearance-none font-bold text-base sm:text-lg"
                                    >
                                        {laboratorios.map((lab) => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        Motivo (Turma/Matéria) *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={50}
                                        value={novaReserva.motivo}
                                        onChange={(e) =>
                                            setNovaReserva({ ...novaReserva, motivo: e.target.value })
                                        }
                                        placeholder="Ex: Aula de Banco de Dados - 3º Ano"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        Data da Reserva *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        min={hoje}
                                        value={novaReserva.dataReserva}
                                        onChange={(e) =>
                                            setNovaReserva({ ...novaReserva, dataReserva: e.target.value })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-base sm:text-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Hora Início *
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            value={novaReserva.horaInicio}
                                            onChange={(e) =>
                                                setNovaReserva({ ...novaReserva, horaInicio: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-base sm:text-lg text-center"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Hora Fim *
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            value={novaReserva.horaFim}
                                            onChange={(e) =>
                                                setNovaReserva({ ...novaReserva, horaFim: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-base sm:text-lg text-center"
                                        />
                                    </div>
                                </div>

                                {isGestao && (
                                    <div className="mt-1 sm:mt-2 bg-red-50 dark:bg-red-900/20 p-4 sm:p-5 rounded-2xl border border-red-200 dark:border-red-800">
                                        <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={novaReserva.tipo === 'manutencao'}
                                                onChange={(e) =>
                                                    setNovaReserva({
                                                        ...novaReserva,
                                                        tipo: e.target.checked ? 'manutencao' : 'pendente',
                                                    })
                                                }
                                                className="mt-0.5 sm:mt-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-red-300 text-red-600 focus:ring-red-600 cursor-pointer shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider leading-snug">
                                                Bloquear para Manutenção
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <div className="mt-3 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setIsCriandoReserva(false)}
                                        className="w-full sm:w-auto text-gray-600 dark:text-gray-400 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 sm:px-10 rounded-xl disabled:opacity-50 transition-transform active:scale-95 shadow-md"
                                    >
                                        {isSubmitting ? 'Agendando...' : 'Confirmar Reserva'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL 2: GERENCIAR LABORATÓRIOS (ADMIN) */}
            {isGerenciandoLabs && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity overflow-y-auto">
                    <Reveal direction="up" duration={300} className="w-full max-w-3xl sm:my-8">
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                                    Gerenciar Espaços / Laboratórios
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsGerenciandoLabs(false)
                                        setLabEmEdicao(null)
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8">
                                {!labEmEdicao ? (
                                    <div className="flex flex-col gap-5 sm:gap-6">
                                        <button
                                            onClick={() =>
                                                setLabEmEdicao({
                                                    id: 0,
                                                    nome: '',
                                                    descricao: null,
                                                    capacidade: 30,
                                                    localizacao: null,
                                                    recursos: '',
                                                    dataCriacao: new Date().toISOString(),
                                                    ativo: true,
                                                })
                                            }
                                            className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-bold py-4 rounded-xl transition-all text-sm sm:text-base"
                                        >
                                            + Cadastrar Novo Espaço
                                        </button>

                                        <div className="flex flex-col gap-3">
                                            {laboratorios.map((lab) => (
                                                <div
                                                    key={lab.id}
                                                    className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                                >
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                                            {lab.nome}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                                                            {lab.capacidade} alunos | {lab.recursos}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                        <button
                                                            onClick={() => setLabEmEdicao(lab)}
                                                            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletarLab(lab.id)}
                                                            className="w-full md:w-auto px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSalvarLab} className="flex flex-col gap-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <button
                                                type="button"
                                                onClick={() => setLabEmEdicao(null)}
                                                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                            >
                                                ← Voltar
                                            </button>
                                            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white ml-2">
                                                {labEmEdicao.id ? 'Editar' : 'Novo'} Laboratório
                                            </h4>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                                Nome do Espaço *
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={labEmEdicao.nome}
                                                onChange={(e) =>
                                                    setLabEmEdicao({
                                                        ...labEmEdicao,
                                                        nome: e.target.value,
                                                    })
                                                }
                                                placeholder="Ex: Laboratório de Química"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                                Capacidade Máxima (Alunos) *
                                            </label>
                                            <input
                                                required
                                                type="number"
                                                min={1}
                                                value={labEmEdicao.capacidade}
                                                onChange={(e) =>
                                                    setLabEmEdicao({
                                                        ...labEmEdicao,
                                                        capacidade: Number(e.target.value),
                                                    })
                                                }
                                                className="w-full sm:w-1/2 md:w-1/3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                                Equipamentos Disponíveis
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={labEmEdicao.recursos ?? ''}
                                                onChange={(e) =>
                                                    setLabEmEdicao({
                                                        ...labEmEdicao,
                                                        recursos: e.target.value,
                                                    })
                                                }
                                                placeholder="Ex: 20 Bancadas, 1 Lousa Digital..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                                            />
                                        </div>

                                        <div className="mt-2 sm:mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 transition-all shadow-md"
                                            >
                                                {isSubmitting ? 'Salvando...' : 'Salvar Espaço'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}
        </div>
    )
}

export default Laboratorios