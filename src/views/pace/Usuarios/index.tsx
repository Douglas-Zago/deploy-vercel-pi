import React, { useEffect, useState, useMemo, useRef } from 'react'
import Reveal from '@/components/ui/Reveal'
import {
    PasswordResetRequest,
    UsuariosService,
    Usuario,
    UsuarioDTO,
    CargoUsuario,
} from '@/services/UsuariosService'

type StatusFiltro = 'TODOS' | 'ATIVOS' | 'INATIVOS'

/** Turmas disponíveis para alunos (cadastro administrativo) */
const TURMAS_SELECT_OPTIONS = ['9º Ano A', '3º Ano B', 'Turma Única'] as const

const MAX_NOME_USUARIO = 100
const MAX_EMAIL_USUARIO = 100
const MAX_MATRICULA_USUARIO = 50
const MAX_CPF_USUARIO = 14

const formatarCpf = (valor: string): string => {
    const digits = valor.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

const ROTULO_CARGO: Record<CargoUsuario, string> = {
    ALUNO: 'Aluno',
    PROFESSOR: 'Professor',
    DIRECAO: 'Direção',
    COORDENACAO: 'Coordenação',
}

const montarPayloadUsuario = (fd: UsuarioDTO): UsuarioDTO => ({
    nome: fd.nome.trim(),
    matricula: fd.matricula.trim(),
    cpf: fd.cpf.replace(/\D/g, ''),
    email: fd.email.trim().toLowerCase(),
    cargo: fd.cargo,
    ativo: fd.ativo,
    turma: fd.cargo === 'ALUNO' ? fd.turma?.trim() : 'Todas',
})

export default function GestaoUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [pendingResets, setPendingResets] = useState<PasswordResetRequest[]>(
        [],
    )

    // Filtros e Paginação
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODOS')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Estados dos Modais
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)

    // Estados de Confirmação
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false)
    const [usuarioParaReset, setUsuarioParaReset] = useState<Usuario | null>(
        null,
    )

    const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false)
    const [usuarioParaStatus, setUsuarioParaStatus] = useState<Usuario | null>(
        null,
    )
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

    // Formulário Manual
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<UsuarioDTO>({
        nome: '',
        matricula: '',
        cpf: '',
        email: '',
        cargo: 'ALUNO',
        turma: '',
        ativo: true,
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [senhaGeradaModal, setSenhaGeradaModal] = useState<{
        nome: string
        email: string
        matricula: string
        senha: string
        contexto: 'criacao' | 'reset'
    } | null>(null)
    const [copiadoSenha, setCopiadoSenha] = useState(false)

    // CSV State
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Toast
    const [toast, setToast] = useState<{
        show: boolean
        msg: string
        type: 'success' | 'error' | 'warning'
    }>({
        show: false,
        msg: '',
        type: 'success',
    })

    const showToast = (
        msg: string,
        type: 'success' | 'error' | 'warning' = 'success',
    ) => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
    }

    const carregarUsuarios = async () => {
        setLoading(true)
        try {
            const data = await UsuariosService.getUsuarios()
            setUsuarios(data)
        } catch (error) {
            showToast('Erro ao carregar lista de usuários.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const carregarSolicitacoesReset = async () => {
        try {
            const dados = await UsuariosService.getPendingPasswordResets()
            setPendingResets(dados)
        } catch (error) {
            showToast('Erro ao carregar solicitações de reset.', 'error')
        }
    }

    useEffect(() => {
        carregarUsuarios()
        carregarSolicitacoesReset()
    }, [])

    // --- FILTROS E PAGINAÇÃO ---
    const usuariosFiltrados = useMemo(() => {
        let filtrados = usuarios

        if (statusFiltro !== 'TODOS') {
            const isAtivo = statusFiltro === 'ATIVOS'
            filtrados = filtrados.filter((u) => u.ativo === isAtivo)
        }

        if (searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase().trim()
            filtrados = filtrados.filter(
                (u) =>
                    u.nome.toLowerCase().includes(lowerSearch) ||
                    u.matricula.toLowerCase().includes(lowerSearch) ||
                    u.cpf.includes(lowerSearch.replace(/\D/g, '')) ||
                    u.email.toLowerCase().includes(lowerSearch) ||
                    (u.turma?.toLowerCase().includes(lowerSearch) ?? false),
            )
        }

        return filtrados
    }, [usuarios, searchTerm, statusFiltro])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFiltro, itemsPerPage])

    const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage)
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))

    const usuariosPaginados = useMemo(() => {
        const startIndex = (validCurrentPage - 1) * itemsPerPage
        return usuariosFiltrados.slice(startIndex, startIndex + itemsPerPage)
    }, [usuariosFiltrados, validCurrentPage, itemsPerPage])

    // --- FUNÇÕES CRUD BÁSICAS ---
    const copiarSenhaGerada = async () => {
        if (!senhaGeradaModal) return
        try {
            await navigator.clipboard.writeText(senhaGeradaModal.senha)
            setCopiadoSenha(true)
            setTimeout(() => setCopiadoSenha(false), 2500)
        } catch {
            showToast('Não foi possível copiar. Copie manualmente.', 'error')
        }
    }

    const abrirModalNovo = () => {
        setEditingId(null)
        setFormData({
            nome: '',
            matricula: '',
            cpf: '',
            email: '',
            cargo: 'ALUNO',
            turma: '',
            ativo: true,
        })
        setIsConfirmSaveOpen(false)
        setIsModalOpen(true)
    }

    const abrirModalEditar = (usuario: Usuario) => {
        setEditingId(usuario.id)
        setFormData({
            nome: usuario.nome,
            matricula: usuario.matricula,
            cpf: formatarCpf(usuario.cpf),
            email: usuario.email,
            cargo: usuario.cargo,
            turma: usuario.cargo === 'ALUNO' ? (usuario.turma ?? '') : '',
            ativo: usuario.ativo,
        })
        setIsConfirmSaveOpen(false)
        setIsModalOpen(true)
    }

    const solicitarSalvar = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.nome.trim().length < 3) {
            showToast('Nome muito curto.', 'error')
            return
        }
        if (formData.matricula.trim().length < 3) {
            showToast('Matrícula muito curta.', 'error')
            return
        }
        if (!formData.email.trim()) {
            showToast('Informe o e-mail institucional.', 'error')
            return
        }
        const cpfDigits = formData.cpf.replace(/\D/g, '')
        if (cpfDigits.length !== 11) {
            showToast('Informe um CPF válido com 11 dígitos.', 'error')
            return
        }
        if (formData.cargo === 'ALUNO' && !formData.turma?.trim()) {
            showToast('Selecione a turma do aluno.', 'error')
            return
        }
        setIsConfirmSaveOpen(true)
    }

    const handleSalvar = async () => {
        setSaving(true)
        try {
            const resultado = await UsuariosService.salvarUsuario(
                montarPayloadUsuario(formData),
                editingId || undefined,
            )
            await carregarUsuarios()
            setIsConfirmSaveOpen(false)
            setIsModalOpen(false)

            if (resultado.senhaGerada) {
                setSenhaGeradaModal({
                    nome: resultado.usuario.nome,
                    email: resultado.usuario.email,
                    matricula: resultado.usuario.matricula,
                    senha: resultado.senhaGerada,
                    contexto: 'criacao',
                })
                setCopiadoSenha(false)
            } else {
                showToast('Usuário atualizado!')
            }
        } catch (error) {
            showToast('Erro ao salvar.', 'error')
            setIsConfirmSaveOpen(false)
        } finally {
            setSaving(false)
        }
    }

    const handleAlternarStatus = async () => {
        if (!usuarioParaStatus) return
        setSaving(true)
        try {
            const novoStatus = !usuarioParaStatus.ativo
            await UsuariosService.alternarStatus(
                usuarioParaStatus.id,
                novoStatus,
            )
            await carregarUsuarios()
            showToast(
                `Acesso ${novoStatus ? 'ativado' : 'inativado'} com sucesso.`,
            )
        } catch (error) {
            showToast('Erro ao alterar status.', 'error')
        } finally {
            setSaving(false)
            setIsConfirmStatusOpen(false)
            setUsuarioParaStatus(null)
        }
    }

    const handleResetSenha = async () => {
        if (!usuarioParaReset) return
        setSaving(true)
        try {
            const novaSenha = await UsuariosService.resetarSenha(
                usuarioParaReset.id,
            )
            setIsConfirmResetOpen(false)
            setSenhaGeradaModal({
                nome: usuarioParaReset.nome,
                email: usuarioParaReset.email,
                matricula: usuarioParaReset.matricula,
                senha: novaSenha,
                contexto: 'reset',
            })
            setCopiadoSenha(false)
            setUsuarioParaReset(null)
        } catch (error) {
            showToast('Erro ao resetar senha.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleFinalizarSolicitacaoReset = async (id: string) => {
        setSaving(true)
        try {
            await UsuariosService.finalizePasswordReset(id)
            await carregarSolicitacoesReset()
            showToast('Solicitação finalizada com sucesso.')
        } catch (error) {
            showToast('Erro ao finalizar a solicitação.', 'error')
        } finally {
            setSaving(false)
        }
    }

    // --- LÓGICA DO CSV ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            showToast('Por favor, selecione apenas arquivos .csv', 'error')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast(
                'O arquivo é muito grande. Máximo permitido: 5MB',
                'error',
            )
            return
        }

        setCsvFile(file)
    }

    const processarImportacaoCSV = async () => {
        if (!csvFile) return
        setIsImporting(true)
        try {
            const resultado = await UsuariosService.importarCSV(csvFile)
            await carregarUsuarios()
            setIsCsvModalOpen(false)
            setCsvFile(null)

            if (resultado.erros > 0) {
                showToast(
                    `${resultado.sucesso} usuários importados. ${resultado.erros} ignorados/erro.`,
                    'warning',
                )
            } else {
                showToast(
                    `${resultado.sucesso} usuários importados com sucesso!`,
                )
            }
        } catch (error) {
            showToast('Falha crítica ao processar o arquivo CSV.', 'error')
        } finally {
            setIsImporting(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const opcoesTurmaFormulario = useMemo(() => {
        const base = [...TURMAS_SELECT_OPTIONS]
        const atual = formData.turma?.trim()
        if (
            atual &&
            !base.includes(atual as (typeof TURMAS_SELECT_OPTIONS)[number])
        ) {
            return [...base, atual]
        }
        return base
    }, [formData.turma])

    const getTurmaExibicao = (u: Usuario) =>
        u.cargo === 'ALUNO'
            ? u.turma?.trim() || '—'
            : u.turma?.trim() || 'Todas'

    const getCargoBadgeClass = (cargo: CargoUsuario) => {
        switch (cargo) {
            case 'DIRECAO':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            case 'COORDENACAO':
                return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
            case 'PROFESSOR':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getStatusBadgeClass = (ativo: boolean) => {
        return ativo
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    }

    const getStatusButtonClass = (ativo: boolean) => {
        return ativo
            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40'
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:p-4 md:p-6 space-y-5 sm:space-y-6 relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-3 left-3 sm:left-auto sm:top-6 sm:right-6 z-[70] animate-bounce-in">
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm sm:text-base ${
                            toast.type === 'success'
                                ? 'bg-emerald-600'
                                : toast.type === 'error'
                                  ? 'bg-red-600'
                                  : 'bg-amber-500'
                        }`}
                    >
                        <span>{toast.msg}</span>
                    </div>
                </div>
            )}

            {/* HEADER E BOTÕES */}
            <Reveal direction="up" duration={0.5}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                            Gestão de Usuários
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Gerencie acessos, cargos, status e senhas dos
                            usuários do sistema.
                        </p>
                        {pendingResets.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-900/20 p-4">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                    Há {pendingResets.length} solicitações de
                                    reset de senha pendentes.
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Verifique as senhas geradas e finalize as
                                    solicitações depois de entregar ao usuário.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => setIsCsvModalOpen(true)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            Importar CSV
                        </button>

                        <button
                            onClick={abrirModalNovo}
                            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            + Novo Usuário
                        </button>
                    </div>
                </div>
            </Reveal>

            {/* ÁREA DE LISTAGEM */}
            <Reveal direction="up" delay={0.1} duration={0.5}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                    {pendingResets.length > 0 && (
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-amber-50/80 dark:bg-amber-900/20">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                            Solicitações de reset pendentes
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {pendingResets.length} solicitações
                                            aguardando entrega.
                                        </p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2">
                                                    Matrícula
                                                </th>
                                                <th className="px-3 py-2">
                                                    Nome
                                                </th>
                                                <th className="px-3 py-2">
                                                    Cargo
                                                </th>
                                                <th className="px-3 py-2">
                                                    Senha Gerada
                                                </th>
                                                <th className="px-3 py-2">
                                                    Criado em
                                                </th>
                                                <th className="px-3 py-2">
                                                    Ação
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingResets.map((reset) => (
                                                <tr
                                                    key={reset.id}
                                                    className="border-t border-gray-200 dark:border-gray-700"
                                                >
                                                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                                                        {reset.matricula}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {reset.nome}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {reset.cargo}
                                                    </td>
                                                    <td className="px-3 py-2 font-semibold text-indigo-600 dark:text-indigo-300">
                                                        {reset.senhaGerada}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {new Date(
                                                            reset.createdAt,
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleFinalizarSolicitacaoReset(
                                                                    reset.id,
                                                                )
                                                            }
                                                            className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                                        >
                                                            Finalizar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row gap-3 sm:gap-4 justify-between xl:items-center bg-gray-50/30 dark:bg-gray-800/20">
                        <input
                            type="text"
                            placeholder="Buscar por nome, matrícula ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full xl:max-w-md px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white shadow-sm"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:items-center gap-3 sm:gap-4 w-full xl:w-auto">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Status:
                                </span>
                                <select
                                    value={statusFiltro}
                                    onChange={(e) =>
                                        setStatusFiltro(
                                            e.target.value as StatusFiltro,
                                        )
                                    }
                                    className="w-full sm:w-auto min-w-0 xl:w-40 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white shadow-sm"
                                >
                                    <option value="TODOS">Todos</option>
                                    <option value="ATIVOS">
                                        Apenas Ativos
                                    </option>
                                    <option value="INATIVOS">Inativos</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 xl:border-l border-gray-200 dark:border-gray-700 xl:pl-4">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Exibir:
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        setItemsPerPage(Number(e.target.value))
                                    }
                                    className="w-full sm:w-auto px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white shadow-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP/TABLET */}
                    <div className="hidden md:block overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">
                                        Nome do Usuário
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Matrícula
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Cargo
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Turma
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 font-medium text-center">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-indigo-600 font-medium"
                                        >
                                            Carregando usuários...
                                        </td>
                                    </tr>
                                ) : usuariosPaginados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosPaginados.map((usuario) => (
                                        <tr
                                            key={usuario.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                                !usuario.ativo
                                                    ? 'opacity-80'
                                                    : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col min-w-0">
                                                    <span
                                                        className={`font-bold break-words ${
                                                            usuario.ativo
                                                                ? 'text-gray-900 dark:text-white'
                                                                : 'text-gray-500 dark:text-gray-500 line-through'
                                                        }`}
                                                    >
                                                        {usuario.nome}
                                                    </span>
                                                    {usuario.email ? (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 break-all mt-1 font-normal">
                                                            {usuario.email}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                                                {usuario.matricula}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getCargoBadgeClass(
                                                        usuario.cargo,
                                                    )}`}
                                                >
                                                    {ROTULO_CARGO[
                                                        usuario.cargo
                                                    ] ?? usuario.cargo}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm max-w-[140px] break-words">
                                                {getTurmaExibicao(usuario)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setUsuarioParaStatus(
                                                            usuario,
                                                        )
                                                        setIsConfirmStatusOpen(
                                                            true,
                                                        )
                                                    }}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${getStatusBadgeClass(
                                                        usuario.ativo,
                                                    )} hover:scale-[1.02]`}
                                                    title={
                                                        usuario.ativo
                                                            ? 'Clique para inativar'
                                                            : 'Clique para reativar'
                                                    }
                                                >
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full ${
                                                            usuario.ativo
                                                                ? 'bg-emerald-500'
                                                                : 'bg-red-500'
                                                        }`}
                                                    ></span>
                                                    {usuario.ativo
                                                        ? 'Ativo'
                                                        : 'Inativo'}
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    <button
                                                        onClick={() =>
                                                            abrirModalEditar(
                                                                usuario,
                                                            )
                                                        }
                                                        className="px-3 py-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-xs font-bold"
                                                    >
                                                        ✏️ Editar
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setUsuarioParaReset(
                                                                usuario,
                                                            )
                                                            setIsConfirmResetOpen(
                                                                true,
                                                            )
                                                        }}
                                                        className="px-3 py-2 text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800 dark:hover:bg-amber-900/40 rounded-lg transition-colors text-xs font-bold"
                                                    >
                                                        🔑 Resetar
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setUsuarioParaStatus(
                                                                usuario,
                                                            )
                                                            setIsConfirmStatusOpen(
                                                                true,
                                                            )
                                                        }}
                                                        className={`px-3 py-2 rounded-lg transition-colors text-xs font-bold ${getStatusButtonClass(
                                                            usuario.ativo,
                                                        )}`}
                                                    >
                                                        {usuario.ativo
                                                            ? '🚫 Inativar'
                                                            : '✅ Reativar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden min-h-[240px]">
                        {loading ? (
                            <div className="px-4 py-10 text-center text-indigo-600 font-medium">
                                Carregando usuários...
                            </div>
                        ) : usuariosPaginados.length === 0 ? (
                            <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            <div className="p-3 flex flex-col gap-3">
                                {usuariosPaginados.map((usuario) => (
                                    <div
                                        key={usuario.id}
                                        className={`rounded-2xl border p-4 shadow-sm bg-white dark:bg-gray-900 ${
                                            usuario.ativo
                                                ? 'border-gray-200 dark:border-gray-800'
                                                : 'border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-900/5'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3
                                                    className={`font-bold text-base leading-tight break-words ${
                                                        usuario.ativo
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-500 dark:text-gray-500 line-through'
                                                    }`}
                                                >
                                                    {usuario.nome}
                                                </h3>

                                                <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                                                    {usuario.matricula}
                                                </p>
                                                {usuario.email ? (
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-all">
                                                        {usuario.email}
                                                    </p>
                                                ) : null}
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Turma:{' '}
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                        {getTurmaExibicao(
                                                            usuario,
                                                        )}
                                                    </span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setUsuarioParaStatus(
                                                        usuario,
                                                    )
                                                    setIsConfirmStatusOpen(true)
                                                }}
                                                className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${getStatusBadgeClass(
                                                    usuario.ativo,
                                                )}`}
                                            >
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                        usuario.ativo
                                                            ? 'bg-emerald-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                ></span>
                                                {usuario.ativo
                                                    ? 'Ativo'
                                                    : 'Inativo'}
                                            </button>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCargoBadgeClass(
                                                    usuario.cargo,
                                                )}`}
                                            >
                                                {ROTULO_CARGO[usuario.cargo] ??
                                                    usuario.cargo}
                                            </span>

                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                                                    usuario.ativo,
                                                )}`}
                                            >
                                                {usuario.ativo
                                                    ? 'Acesso liberado'
                                                    : 'Acesso bloqueado'}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <button
                                                onClick={() =>
                                                    abrirModalEditar(usuario)
                                                }
                                                className="w-full px-3 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/40 rounded-xl transition-colors text-sm font-bold"
                                            >
                                                ✏️ Editar
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setUsuarioParaReset(usuario)
                                                    setIsConfirmResetOpen(true)
                                                }}
                                                className="w-full px-3 py-2.5 text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800 dark:hover:bg-amber-900/40 rounded-xl transition-colors text-sm font-bold"
                                            >
                                                🔑 Resetar
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setUsuarioParaStatus(
                                                        usuario,
                                                    )
                                                    setIsConfirmStatusOpen(true)
                                                }}
                                                className={`w-full px-3 py-2.5 rounded-xl transition-colors text-sm font-bold ${getStatusButtonClass(
                                                    usuario.ativo,
                                                )}`}
                                            >
                                                {usuario.ativo
                                                    ? '🚫 Inativar'
                                                    : '✅ Reativar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RODAPÉ DE PAGINAÇÃO */}
                    {!loading && usuariosFiltrados.length > 0 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Exibindo{' '}
                                <span className="text-gray-900 dark:text-white">
                                    {(validCurrentPage - 1) * itemsPerPage + 1}
                                </span>{' '}
                                a{' '}
                                <span className="text-gray-900 dark:text-white">
                                    {Math.min(
                                        validCurrentPage * itemsPerPage,
                                        usuariosFiltrados.length,
                                    )}
                                </span>{' '}
                                de{' '}
                                <span className="text-gray-900 dark:text-white">
                                    {usuariosFiltrados.length}
                                </span>{' '}
                                usuários
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(p - 1, 1),
                                        )
                                    }
                                    disabled={validCurrentPage === 1}
                                    className="flex-1 md:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                                >
                                    Anterior
                                </button>

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages),
                                        )
                                    }
                                    disabled={validCurrentPage === totalPages}
                                    className="flex-1 md:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Reveal>

            {/* MODAL: IMPORTAÇÃO DE CSV */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <Reveal
                        direction="down"
                        duration={0.3}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                                    Importar em Lote (CSV)
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsCsvModalOpen(false)
                                        setCsvFile(null)
                                    }}
                                    className="text-gray-400 hover:text-red-500 text-xl font-bold p-2"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-300">
                                    <p className="font-bold mb-2">
                                        Padrão esperado do CSV:
                                    </p>
                                    <code className="block bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-700 text-xs mt-1 font-mono overflow-x-auto">
                                        nome,matricula,email,cpf,cargo[,turma]
                                        <br />
                                        Maria
                                        Silva,ALN001,maria@pace.edu.br,12345678900,ALUNO,9º
                                        Ano A
                                        <br />
                                        João
                                        Souza,PRF002,joao@pace.edu.br,98765432100,PROFESSOR
                                    </code>
                                </div>

                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 sm:p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-4xl mb-3">📁</div>
                                    {csvFile ? (
                                        <div>
                                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 break-all">
                                                {csvFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {(csvFile.size / 1024).toFixed(
                                                    2,
                                                )}{' '}
                                                KB
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Clique ou arraste o arquivo CSV
                                                aqui
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Apenas arquivos .csv até 5MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsCsvModalOpen(false)
                                            setCsvFile(null)
                                        }}
                                        className="w-full sm:w-auto text-gray-600 dark:text-gray-400 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={processarImportacaoCSV}
                                        disabled={!csvFile || isImporting}
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-xl disabled:opacity-50 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isImporting
                                            ? 'Processando...'
                                            : 'Iniciar Importação'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL: CONFIRMAR STATUS */}
            {isConfirmStatusOpen && usuarioParaStatus && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <Reveal
                        direction="up"
                        duration={0.3}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl w-full text-center border border-gray-100 dark:border-gray-800 shadow-2xl">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                Alterar status do usuário?
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-5 font-medium">
                                Você está prestes a{' '}
                                <strong>
                                    {usuarioParaStatus.ativo
                                        ? 'inativar'
                                        : 'reativar'}
                                </strong>{' '}
                                o acesso de{' '}
                                <strong>{usuarioParaStatus.nome}</strong>.
                            </p>

                            <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/40">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">
                                        Status atual
                                    </span>
                                    <span
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusBadgeClass(
                                            usuarioParaStatus.ativo,
                                        )}`}
                                    >
                                        {usuarioParaStatus.ativo
                                            ? 'Ativo'
                                            : 'Inativo'}
                                    </span>
                                </div>

                                <div className="my-3 h-px bg-gray-200 dark:bg-gray-700"></div>

                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">
                                        Novo status
                                    </span>
                                    <span
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusBadgeClass(
                                            !usuarioParaStatus.ativo,
                                        )}`}
                                    >
                                        {!usuarioParaStatus.ativo
                                            ? 'Ativo'
                                            : 'Inativo'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() =>
                                        setIsConfirmStatusOpen(false)
                                    }
                                    className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={handleAlternarStatus}
                                    disabled={saving}
                                    className={`px-4 py-3 rounded-xl font-bold w-full disabled:opacity-50 transition-colors text-white ${
                                        usuarioParaStatus.ativo
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {saving
                                        ? 'Aguarde...'
                                        : usuarioParaStatus.ativo
                                          ? 'Confirmar Inativação'
                                          : 'Confirmar Reativação'}
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL: CONFIRMAR RESET */}
            {isConfirmResetOpen && usuarioParaReset && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <Reveal
                        direction="up"
                        duration={0.3}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl w-full text-center border border-gray-100 dark:border-gray-800 shadow-2xl">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                Resetar senha?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                                Será gerada uma{' '}
                                <strong>nova senha forte</strong> para{' '}
                                <strong>{usuarioParaReset.nome}</strong>. Você
                                poderá copiá-la e entregar ao usuário.
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setIsConfirmResetOpen(false)}
                                    className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleResetSenha}
                                    disabled={saving}
                                    className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold w-full disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Aguarde...' : 'Confirmar Reset'}
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL: NOVO/EDITAR */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <Reveal
                        direction="up"
                        duration={0.3}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl max-h-[92vh] overflow-y-auto">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                                    {editingId
                                        ? 'Editar Usuário'
                                        : 'Novo Usuário'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-red-500 font-bold text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={solicitarSalvar}
                                className="p-4 sm:p-6 md:p-8 flex flex-col gap-5"
                            >
                                <div className="min-w-0">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        Nome Completo *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={MAX_NOME_USUARIO}
                                        placeholder="Nome do usuário"
                                        value={formData.nome}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nome: e.target.value.slice(
                                                    0,
                                                    MAX_NOME_USUARIO,
                                                ),
                                            })
                                        }
                                        className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg"
                                    />
                                    <p
                                        className={`text-xs font-mono mt-1 text-right tabular-nums ${formData.nome.length >= MAX_NOME_USUARIO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                    >
                                        {formData.nome.length}/
                                        {MAX_NOME_USUARIO}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        E-mail institucional *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        maxLength={MAX_EMAIL_USUARIO}
                                        placeholder="nome@pace.edu.br"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value.slice(
                                                    0,
                                                    MAX_EMAIL_USUARIO,
                                                ),
                                            })
                                        }
                                        className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg"
                                    />
                                    <p
                                        className={`text-xs font-mono mt-1 text-right tabular-nums ${formData.email.length >= MAX_EMAIL_USUARIO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                    >
                                        {formData.email.length}/
                                        {MAX_EMAIL_USUARIO}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        CPF *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={MAX_CPF_USUARIO}
                                        placeholder="000.000.000-00"
                                        value={formData.cpf}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                cpf: formatarCpf(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg font-mono"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 min-w-0">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Matrícula *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            maxLength={MAX_MATRICULA_USUARIO}
                                            placeholder="Ex: ALN001"
                                            value={formData.matricula}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    matricula: e.target.value
                                                        .toUpperCase()
                                                        .slice(
                                                            0,
                                                            MAX_MATRICULA_USUARIO,
                                                        ),
                                                })
                                            }
                                            className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg font-mono uppercase"
                                        />
                                        <p
                                            className={`text-xs font-mono mt-1 text-right tabular-nums ${formData.matricula.length >= MAX_MATRICULA_USUARIO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                        >
                                            {formData.matricula.length}/
                                            {MAX_MATRICULA_USUARIO}
                                        </p>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Cargo *
                                        </label>
                                        <select
                                            value={formData.cargo}
                                            onChange={(e) => {
                                                const cargo = e.target
                                                    .value as CargoUsuario
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    cargo,
                                                    turma:
                                                        cargo === 'ALUNO'
                                                            ? prev.cargo ===
                                                              'ALUNO'
                                                                ? (prev.turma ??
                                                                  '')
                                                                : ''
                                                            : '',
                                                }))
                                            }}
                                            className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg font-bold"
                                        >
                                            <option value="ALUNO">Aluno</option>
                                            <option value="PROFESSOR">
                                                Professor
                                            </option>
                                            <option value="COORDENACAO">
                                                Coordenação
                                            </option>
                                            <option value="DIRECAO">
                                                Direção
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {!editingId && (
                                    <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/80 dark:bg-indigo-950/30 px-4 py-3">
                                        <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                            A senha de acesso será{' '}
                                            <strong>
                                                Pace + 3 primeiros dígitos do
                                                CPF
                                            </strong>{' '}
                                            (ex.: CPF 123.456.789-00 → senha{' '}
                                            <strong>Pace123</strong>). O usuário
                                            deverá alterá-la no primeiro acesso.
                                        </p>
                                    </div>
                                )}

                                {formData.cargo === 'ALUNO' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Turma *
                                        </label>
                                        <select
                                            required
                                            value={formData.turma ?? ''}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    turma: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none text-base sm:text-lg font-bold"
                                        >
                                            <option value="" disabled>
                                                Selecione a turma
                                            </option>
                                            {opcoesTurmaFormulario.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {isConfirmSaveOpen ? (
                                    <div className="mt-2 sm:mt-4 p-4 sm:p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex flex-col gap-3">
                                        <span className="font-bold text-center text-indigo-900 dark:text-indigo-300">
                                            Confirmar os dados informados?
                                        </span>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsConfirmSaveOpen(false)
                                                }
                                                className="flex-1 py-2.5 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold bg-white dark:bg-gray-800 hover:bg-indigo-100 transition-colors"
                                            >
                                                Revisar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSalvar}
                                                disabled={saving}
                                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50 transition-colors shadow-md"
                                            >
                                                {saving
                                                    ? 'Salvando...'
                                                    : 'Salvar Definitivo'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="w-full mt-2 sm:mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md"
                                    >
                                        Avançar
                                    </button>
                                )}
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}

            {senhaGeradaModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Reveal
                        direction="down"
                        duration={0.3}
                        className="w-full max-w-lg"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 mb-1">
                                    {senhaGeradaModal.contexto === 'criacao'
                                        ? 'Usuário criado com sucesso'
                                        : 'Senha redefinida'}
                                </p>
                                <h3 className="text-xl font-extrabold leading-tight">
                                    Senha de acesso — {senhaGeradaModal.nome}
                                </h3>
                                <p className="text-sm text-white/90 mt-1">
                                    E-mail (login):{' '}
                                    <span className="font-mono font-bold">
                                        {senhaGeradaModal.email}
                                    </span>
                                    {' · '}
                                    Matrícula:{' '}
                                    <span className="font-mono font-bold">
                                        {senhaGeradaModal.matricula}
                                    </span>
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Entregue esta senha ao usuário de forma
                                    segura. Ela não será exibida novamente após
                                    fechar este aviso.
                                </p>

                                <div className="rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-4 text-center">
                                    <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                                        Senha gerada
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 dark:text-white break-all select-all tracking-wide">
                                        {senhaGeradaModal.senha}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={copiarSenhaGerada}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {copiadoSenha
                                            ? 'Copiado!'
                                            : 'Copiar Senha'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSenhaGeradaModal(null)
                                            setCopiadoSenha(false)
                                        }}
                                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}
        </div>
    )
}
