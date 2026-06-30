// src/views/pace/Chamados/index.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/auth' // <-- Integração real de segurança
import Reveal from '@/components/ui/Reveal'
import { isPerfilGestao } from '@/constants/roles.constant'
import { ChamadosService, Chamado } from '@/services/ChamadosService'

const MAX_CHARS = 200

const formatarDataChamado = (dataStr: string | null | undefined): string => {
    if (!dataStr) return '—'
    const parsed = Date.parse(dataStr)
    if (!Number.isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString('pt-BR')
    }
    return dataStr
}

const Chamados = () => {
    // --- SEGURANÇA E CONTEXTO ---
    const { user } = useAuth()
    const isGestao = isPerfilGestao(user?.authority)
    const isProfessor = user?.authority?.includes('professor')
    
    // O nome do usuário logado que será usado como autor nos chamados novos e na filtragem
    const nomeUsuarioLogado = user?.userName || 'Usuário Desconhecido'

    // --- ESTADOS BASE ---
    const [chamados, setChamados] = useState<Chamado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsLoadingSubmitting] = useState(false)
    
    // --- ESTADOS DE FILTRO E BUSCA ---
    const [filtroStatus, setFiltroStatus] = useState<string>('Todos')
    const [termoBusca, setTermoBusca] = useState<string>('')
    
    // --- ESTADO PARA CONTROLAR O MODAL DE DETALHES ---
    const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null)
    
    // --- ESTADO DO FORMULÁRIO (Apenas Professor) ---
    const [novoChamado, setNovoChamado] = useState({
        titulo: '',
        categoria: '',
        descricao: '',
    })

    const fetchChamados = async () => {
        try {
            setIsLoading(true)
            const data = await ChamadosService.getAll()
            setChamados(data)
        } catch (error) {
            console.error("Erro ao buscar chamados:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchChamados() }, [])

    // --- AÇÕES DO PROFESSOR ---
    const handleCriarChamado = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoadingSubmitting(true)
            await ChamadosService.create({
                titulo: novoChamado.titulo.trim(),
                categoria: novoChamado.categoria,
                descricao: novoChamado.descricao.trim(),
                solicitanteNome: nomeUsuarioLogado,
            })
            await fetchChamados()
            setNovoChamado({ titulo: '', categoria: '', descricao: '' })
            setFiltroStatus('Todos') // Reseta o filtro para ver o chamado novo
        } catch (error) { 
            alert("Erro ao abrir chamado.") 
        } finally { 
            setIsLoadingSubmitting(false) 
        }
    }

    // --- AÇÕES DO ADMIN ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAlterarStatus = async (id: number, novoStatus: any) => {
        try {
            // Atualiza otimisticamente na lista principal
            setChamados(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c))
            
            // Atualiza no modal se estiver aberto
            if (chamadoSelecionado && chamadoSelecionado.id === id) {
                setChamadoSelecionado({ ...chamadoSelecionado, status: novoStatus })
            }

            await ChamadosService.updateStatus(id, novoStatus)
        } catch (error) {
            alert("Erro ao atualizar status.")
            fetchChamados() // Reverte se falhar no backend
        }
    }

    // --- LÓGICA DE FILTRAGEM ---
    const chamadosFiltrados = useMemo(() => {
        let filtrados = chamados;

        // 1. Se for professor, vê apenas os DELE (Baseado no nome do usuário logado)
        if (isProfessor && !isGestao) {
            filtrados = filtrados.filter(c => c.solicitanteNome === nomeUsuarioLogado);
        }

        // 2. Filtro de Status
        if (filtroStatus !== 'Todos') {
            filtrados = filtrados.filter(c => c.status === filtroStatus);
        }

        // 3. Filtro de Busca (Texto)
        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase();
            filtrados = filtrados.filter(c => 
                c.titulo.toLowerCase().includes(termo) || 
                c.descricao.toLowerCase().includes(termo) ||
                c.id.toString().includes(termo)
            );
        }

        return filtrados;
    }, [chamados, filtroStatus, termoBusca, isProfessor, isGestao, nomeUsuarioLogado]);

    // --- UTILITÁRIOS ---
    const isFormValido = novoChamado.titulo.trim() !== '' && novoChamado.categoria !== '' && novoChamado.descricao.trim() !== ''
    
    const getBadgeStyle = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
            case 'Em Análise': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
            case 'Resolvido': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="flex flex-col gap-8 w-full p-4 md:p-8">
            
            {/* CABEÇALHO */}
            <Reveal direction="down">
                <div className="flex justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Suporte Técnico</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Relate ou gerencie problemas de infraestrutura.</p>
                    </div>
                </div>
            </Reveal>

            {isLoading ? (
                 <div className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ) : (
                <div className={`grid grid-cols-1 ${isProfessor && !isGestao ? 'xl:grid-cols-3' : 'grid-cols-1'} gap-8 items-start`}>
                    
                    {/* VISÃO DO PROFESSOR: FORMULÁRIO DE CRIAÇÃO */}
                    {isProfessor && !isGestao && (
                        <Reveal direction="up" className="xl:col-span-1 xl:sticky xl:top-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Abrir Novo Chamado</h3>
                                
                                <form onSubmit={handleCriarChamado} className="flex flex-col gap-6 flex-grow">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">Título do Problema *</label>
                                        <input 
                                            required type="text" maxLength={60} value={novoChamado.titulo} onChange={(e) => setNovoChamado({...novoChamado, titulo: e.target.value})}
                                            placeholder="Ex: Projetor sem sinal" 
                                            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">Categoria do Local *</label>
                                        <select 
                                            required value={novoChamado.categoria} onChange={(e) => setNovoChamado({...novoChamado, categoria: e.target.value})}
                                            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none appearance-none text-base cursor-pointer"
                                        >
                                            <option value="" disabled>Selecione o ambiente...</option>
                                            <option value="Sala de Aula">Sala de Aula</option>
                                            <option value="Laboratório">Laboratório</option>
                                            <option value="Sanitário">Sanitário / Vestiário</option>
                                            <option value="Quadra / Esportes">Quadra / Ginásio</option>
                                            <option value="Área Comum">Área Comum</option>
                                            <option value="Administrativo">Administrativo</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col flex-grow">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Descrição Exata *</label>
                                            <span className={`text-sm font-mono ${novoChamado.descricao.length >= MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                {novoChamado.descricao.length} / {MAX_CHARS}
                                            </span>
                                        </div>
                                        <textarea 
                                            required rows={5} maxLength={MAX_CHARS} value={novoChamado.descricao} onChange={(e) => setNovoChamado({...novoChamado, descricao: e.target.value})}
                                            placeholder="Ex: No Laboratório de TI 02, o PC 5 está sem internet."
                                            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none flex-grow text-base"
                                        />
                                    </div>

                                    <div className="flex justify-end mt-2">
                                        <button type="submit" disabled={isSubmitting || !isFormValido} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all disabled:opacity-50 text-lg w-full">
                                            {isSubmitting ? 'Enviando...' : 'Enviar Chamado'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Reveal>
                    )}

                    {/* LISTA DE CHAMADOS COM FILTROS */}
                    <Reveal direction="up" delay={100} className={isProfessor && !isGestao ? 'xl:col-span-2' : ''}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[600px]">
                            
                            {/* Header da Lista e Filtros */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {isGestao ? 'Painel de Gestão' : 'Meus Chamados'}
                                </h3>
                                
                                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar chamado..." 
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                                    />
                                    <select 
                                        value={filtroStatus} 
                                        onChange={(e) => setFiltroStatus(e.target.value)}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm font-bold outline-none cursor-pointer w-full sm:w-auto"
                                    >
                                        <option value="Todos">Exibir: Todos</option>
                                        <option value="Aberto">🔴 Abertos</option>
                                        <option value="Em Análise">🟡 Em Análise</option>
                                        <option value="Resolvido">🟢 Resolvidos (Histórico)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Grid de Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-grow content-start">
                                {chamadosFiltrados.length > 0 ? chamadosFiltrados.map((chamado) => (
                                    <div 
                                        key={chamado.id} 
                                        onClick={() => setChamadoSelecionado(chamado)}
                                        className={`p-5 border ${chamado.status === 'Resolvido' ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 opacity-70' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80'} rounded-xl hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col justify-between group`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono font-bold text-gray-500 text-sm">#{chamado.id}</span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(chamado.status)}`}>
                                                    {chamado.status}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors line-clamp-1">{chamado.titulo}</h4>
                                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">📍 {chamado.categoria}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2 leading-relaxed">{chamado.descricao}</p>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1">👤 {(chamado.solicitanteNome ?? '—').split(' ')[0]}</span>
                                            <span>📅 {formatarDataChamado(chamado.dataCriacao)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full flex flex-col items-center justify-center text-center py-20 opacity-50 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <span className="text-5xl mb-4">🔍</span>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nenhum chamado encontrado.</h3>
                                        <p className="text-gray-500 mt-2">Tente mudar os filtros de busca acima.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>

                </div>
            )}

            {/* MODAL DETALHADO (Abre ao clicar no chamado) */}
            {chamadoSelecionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
                    <Reveal direction="up" duration={200} className="w-full max-w-2xl my-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
                            
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-gray-500 text-lg">#{chamadoSelecionado.id}</span>
                                    {/* Exibe o status no modal também para o Professor (já que ele não tem o select) */}
                                    {(!isGestao) && (
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(chamadoSelecionado.status)}`}>
                                            {chamadoSelecionado.status}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setChamadoSelecionado(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-xl font-bold">
                                    ✕
                                </button>
                            </div>
                            
                            <div className="p-6 md:p-8 overflow-y-auto flex-grow">
                                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">{chamadoSelecionado.titulo}</h2>
                                
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <span className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 font-bold uppercase tracking-wider">
                                        📍 {chamadoSelecionado.categoria}
                                    </span>
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">📅 {formatarDataChamado(chamadoSelecionado.dataCriacao)}</span>
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">👤 Aberto por: {chamadoSelecionado.solicitanteNome ?? '—'}</span>
                                </div>
                                
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg break-words">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Descrição Detalhada</h4>
                                    <p>{chamadoSelecionado.descricao}</p>
                                </div>
                            </div>
                            
                            {/* Apenas ADMIN pode alterar status */}
                            {isGestao && (
                                <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-center md:justify-end items-center gap-4">
                                    <div className="w-full md:w-auto flex items-center gap-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Alterar Status:</label>
                                        <select 
                                            value={chamadoSelecionado.status}
                                            onChange={(e) => handleAlterarStatus(chamadoSelecionado.id, e.target.value)}
                                            className={`px-4 py-2.5 rounded-xl font-bold text-sm outline-none cursor-pointer appearance-none shadow-sm ${getBadgeStyle(chamadoSelecionado.status)}`}
                                        >
                                            <option value="Aberto" className="bg-white text-gray-900">🔴 Aberto</option>
                                            <option value="Em Análise" className="bg-white text-gray-900">🟡 Em Análise</option>
                                            <option value="Resolvido" className="bg-white text-gray-900">🟢 Resolvido</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                        </div>
                    </Reveal>
                </div>
            )}

        </div>
    )
}

export default Chamados