import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import {
    PUBLICO_ALVO_OPCOES,
    usuarioVeConteudoPorPublicoAlvo,
    rotuloBadgePublico,
    FILTRO_PUBLICO_TODOS,
    type PublicoAlvo,
    type FiltroPublicoAlvoCabecalho,
} from '@/constants/publicoAlvo'
import { usePodeEditar } from '@/utils/hooks/usePodeEditar'
import { MateriaisService, Material } from '@/services/MateriaisService'

const MAX_TITULO = 140
const MAX_URL = 200
const MAX_TERMO_BUSCA = 120

const isUrlExterna = (url: string) => /^https?:\/\//i.test(url)

const formatarDataMaterial = (dataStr: string | null | undefined): string => {
    if (!dataStr) return '—'
    const parsed = Date.parse(dataStr)
    if (!Number.isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString('pt-BR')
    }
    return dataStr
}

const estadoInicialNovoMaterial = () => ({
    titulo: '',
    tipo: 'Institucional',
    url: '',
    isExterno: true,
    publicoAlvo: 'Colégio Todo' as PublicoAlvo,
})

const Materiais = () => {
    // --- SEGURANÇA E CONTEXTO ---
    const { user } = useAuth()
    const { isGestao, isGestaoEditavel, podeOperar } = usePodeEditar()
    const isProfessor = user?.authority?.includes('professor')
    const podeAdicionar = podeOperar
    const nomeAutor = user?.userName || 'Usuário Desconhecido'

    // --- ESTADOS BASE ---
    const [materiais, setMateriais] = useState<Material[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [termoBusca, setTermoBusca] = useState('')
    const [filtroPublicoCabecalho, setFiltroPublicoCabecalho] =
        useState<FiltroPublicoAlvoCabecalho>(FILTRO_PUBLICO_TODOS)
    const [abaAdmin, setAbaAdmin] = useState<'BIBLIOTECA' | 'PENDENTES'>('BIBLIOTECA')
    
    // --- ESTADOS DOS MODAIS ---
    const [isCriando, setIsCriando] = useState(false)
    // Precisamos armazenar o ID no aviso para poder contabilizar o clique depois
    const [avisoExterno, setAvisoExterno] = useState({ aberto: false, url: '', id: 0 }) 
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // --- ESTADO DO FORMULÁRIO ---
    const [novoMaterial, setNovoMaterial] = useState(estadoInicialNovoMaterial)

    // --- CARREGAR DADOS ---
    const fetchMateriais = async () => {
        try {
            setIsLoading(true)
            const data = await MateriaisService.getAll()
            setMateriais(data)
        } catch (error) {
            console.error("Erro ao buscar materiais:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchMateriais() }, [])

    // --- LÓGICA DE CLIQUE NOS LINKS (COM TRACKING) ---
    const processarAcesso = async (id: number, url: string, isExterno: boolean) => {
        if (isExterno) {
            setAvisoExterno({ aberto: true, url, id })
            return
        }
        
        // Se for interno, registra o clique e abre
        await MateriaisService.registrarAcesso(id)
        fetchMateriais() // Atualiza a tela silenciosamente para refletir o +1
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const confirmarAcessoExterno = async () => {
        await MateriaisService.registrarAcesso(avisoExterno.id)
        window.open(avisoExterno.url, '_blank', 'noopener,noreferrer')
        setAvisoExterno({ aberto: false, url: '', id: 0 })
        fetchMateriais() // Atualiza os contadores
    }

    // --- AÇÕES DO ADMIN (APROVAR/RECUSAR) ---
    const handleAprovar = async (id: number) => {
        try {
            await MateriaisService.aprovar(id)
            fetchMateriais()
        } catch (error) {
            alert('Erro ao aprovar material.')
        }
    }

    const handleDeletar = async (id: number) => {
        if (!window.confirm("Deseja excluir este material definitivamente?")) return;
        try {
            await MateriaisService.deletar(id)
            fetchMateriais()
        } catch (error) {
            alert("Erro ao excluir.")
        }
    }

    // --- AÇÃO DE SALVAR NOVO MATERIAL ---
    const handleCriarMaterial = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)

            await MateriaisService.create({
                titulo: novoMaterial.titulo.trim(),
                tipo: novoMaterial.tipo,
                url: novoMaterial.url.trim(),
                publicoAlvo: novoMaterial.publicoAlvo,
                autorNome: isGestao ? 'Equipe Gestora' : nomeAutor,
                ativo: isGestao,
                dataCriacao: new Date().toISOString(),
            })

            await fetchMateriais()
            setIsCriando(false)
            setNovoMaterial(estadoInicialNovoMaterial())
            
            if (!isGestao) {
                alert("Material enviado com sucesso! Ele ficará disponível assim que a coordenação aprovar.")
            }

        } catch (error) {
            alert("Erro ao salvar material.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFormValido = novoMaterial.titulo.trim().length > 0 && novoMaterial.url.trim().length > 0

    // --- FILTRO DE BUSCA E ABAS ---
    const materiaisFiltrados = useMemo(() => {
        let filtrados = materiais

        if (isGestao && abaAdmin === 'PENDENTES') {
            filtrados = filtrados.filter((m) => !m.ativo)
        } else {
            filtrados = filtrados.filter((m) => m.ativo)
        }

        filtrados = filtrados.filter((m) => usuarioVeConteudoPorPublicoAlvo(user, m.publicoAlvo))

        if (filtroPublicoCabecalho !== FILTRO_PUBLICO_TODOS) {
            filtrados = filtrados.filter((m) => m.publicoAlvo === filtroPublicoCabecalho)
        }

        if (termoBusca.trim()) {
            filtrados = filtrados.filter((m) =>
                m.titulo.toLowerCase().includes(termoBusca.toLowerCase()),
            )
        }

        return filtrados
    }, [termoBusca, materiais, abaAdmin, isGestao, user, filtroPublicoCabecalho])

    const pendentesCount = materiais.filter((m) => !m.ativo).length

    return (
        <div className="flex flex-col gap-8 p-4 max-w-6xl mx-auto relative min-w-0 w-full">
            
            {/* CABEÇALHO */}
            <Reveal direction="down">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Links e Materiais</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Documentos oficiais, links de estudo e referências recomendadas.</p>
                    </div>

                    {podeAdicionar && (
                        <button 
                            type="button"
                            onClick={() => {
                                setNovoMaterial(estadoInicialNovoMaterial())
                                setIsCriando(true)
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-md flex items-center gap-2 whitespace-nowrap"
                        >
                            <span>+</span> Enviar Material
                        </button>
                    )}
                </div>
            </Reveal>

            {/* CONTROLES DE ADMIN E BUSCA */}
            <Reveal direction="up" delay={100}>
                <div className="flex flex-col gap-4 w-full min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 w-full min-w-0">
                        <div className="relative w-full lg:flex-1 lg:min-w-0">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                                🔍
                            </span>
                            <input 
                                type="search" 
                                placeholder="Buscar material por título..." 
                                maxLength={MAX_TERMO_BUSCA}
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value.slice(0, MAX_TERMO_BUSCA))}
                                className="w-full min-w-0 pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none shadow-sm transition-all text-[16px]"
                            />
                        </div>
                        <select
                            value={filtroPublicoCabecalho}
                            onChange={(e) =>
                                setFiltroPublicoCabecalho(e.target.value as FiltroPublicoAlvoCabecalho)
                            }
                            aria-label="Filtrar por público-alvo"
                            className="w-full lg:w-[min(100%,14rem)] lg:shrink-0 min-h-11 min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        >
                            <option value={FILTRO_PUBLICO_TODOS}>Todos os públicos</option>
                            {PUBLICO_ALVO_OPCOES.map((op) => (
                                <option key={op} value={op}>
                                    Público: {op}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isGestao && (
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:w-auto md:self-end">
                            <button 
                                onClick={() => setAbaAdmin('BIBLIOTECA')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${abaAdmin === 'BIBLIOTECA' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Biblioteca Pública
                            </button>
                            <button 
                                onClick={() => setAbaAdmin('PENDENTES')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all relative ${abaAdmin === 'PENDENTES' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Fila de Aprovação
                                {pendentesCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                        {pendentesCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </Reveal>

            {/* LISTA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-48"></div>
                    ))
                ) : materiaisFiltrados.length > 0 ? (
                    materiaisFiltrados.map((item, index) => {
                        const externo = isUrlExterna(item.url)
                        return (
                        <Reveal key={item.id} direction="up" delay={index * 50}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full hover:shadow-lg transition-shadow group relative overflow-hidden">
                                
                                {/* Badge de Categoria e Contador */}
                                <div>
                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                                            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 shrink-0">
                                                {item.tipo}
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-700/60 px-2.5 py-1 rounded-full border border-gray-200/70 dark:border-gray-600/60 max-w-full break-words">
                                                {rotuloBadgePublico(item.publicoAlvo)}
                                            </span>
                                        </div>
                                        {item.ativo && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md shrink-0" title="Total de cliques">
                                                👁️ {item.acessos}
                                            </span>
                                        )}
                                        {!item.ativo && (
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 shrink-0">
                                                Aguardando Revisão
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 break-words hyphens-auto min-w-0">
                                        {item.titulo}
                                    </h3>
                                    
                                    <div className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-6">
                                        <span>👤 Enviado por: <strong className="text-gray-700 dark:text-gray-300">{item.autorNome}</strong></span>
                                        <span>📅 {formatarDataMaterial(item.dataCriacao)}</span>
                                    </div>
                                </div>

                                {/* Ações (Dinâmico conforme a Aba) */}
                                {item.ativo ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => processarAcesso(item.id, item.url, externo)}
                                            className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2"
                                        >
                                            {externo ? '🔗 Acessar Link' : '⬇️ Acessar Material'}
                                        </button>
                                        {isGestaoEditavel && (
                                            <button onClick={() => handleDeletar(item.id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-100 font-bold" title="Remover Material">
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    // Ações da Fila de Aprovação (Somente Admin vê isso aqui)
                                    <div className="flex gap-2 border-t pt-4 border-gray-100 dark:border-gray-700 mt-2">
                                        <button onClick={() => processarAcesso(item.id, item.url, externo)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors" title="Visualizar Link">
                                            👁️ Ver
                                        </button>
                                        <button onClick={() => handleDeletar(item.id)} className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors border border-red-100">
                                            Recusar
                                        </button>
                                        <button onClick={() => handleAprovar(item.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-sm">
                                            ✅ Aprovar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Reveal>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4 opacity-50">📭</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {abaAdmin === 'PENDENTES' ? 'Nenhum material na fila de aprovação.' : 'Nenhum material encontrado.'}
                        </h3>
                    </div>
                )}
            </div>

            {/* MODAL DE CRIAÇÃO (ADMIN / PROFESSOR) */}
            {isCriando && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
                    <Reveal direction="up" duration={300} className="w-full max-w-lg">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">Enviar Novo Material</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNovoMaterial(estadoInicialNovoMaterial())
                                        setIsCriando(false)
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handleCriarMaterial} className="p-6 md:p-8 flex flex-col gap-6">
                                
                                {!isGestao && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                        ℹ️ O material passará por aprovação da coordenação antes de ser publicado.
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                        Título *
                                    </label>
                                    <input
                                        required
                                        maxLength={MAX_TITULO}
                                        type="text"
                                        value={novoMaterial.titulo}
                                        onChange={(e) =>
                                            setNovoMaterial({
                                                ...novoMaterial,
                                                titulo: e.target.value.slice(0, MAX_TITULO),
                                            })
                                        }
                                        className="w-full min-w-0 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none transition-all text-lg"
                                        placeholder="Ex: Apostila de Algoritmos..."
                                    />
                                    <p
                                        className={`text-xs font-mono mt-1 text-right tabular-nums ${novoMaterial.titulo.length >= MAX_TITULO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                    >
                                        {novoMaterial.titulo.length}/{MAX_TITULO}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Tipo *</label>
                                    <select
                                        value={novoMaterial.tipo}
                                        onChange={(e) =>
                                            setNovoMaterial({
                                                ...novoMaterial,
                                                tipo: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none font-bold text-lg"
                                    >
                                        <option value="Institucional">Institucional</option>
                                        <option value="Artigo">Artigo Técnico</option>
                                        <option value="Video">Vídeo / Aula</option>
                                        <option value="Documento">Documento (PDF/Word)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        Público-Alvo *
                                    </label>
                                    <select
                                        value={novoMaterial.publicoAlvo}
                                        onChange={(e) =>
                                            setNovoMaterial({
                                                ...novoMaterial,
                                                publicoAlvo: e.target.value as PublicoAlvo,
                                            })
                                        }
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none font-bold text-lg"
                                    >
                                        {PUBLICO_ALVO_OPCOES.map((op) => (
                                            <option key={op} value={op}>
                                                {op}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                        URL / Link do Arquivo *
                                    </label>
                                    <input
                                        required
                                        type="url"
                                        maxLength={MAX_URL}
                                        value={novoMaterial.url}
                                        onChange={(e) =>
                                            setNovoMaterial({
                                                ...novoMaterial,
                                                url: e.target.value.slice(0, MAX_URL),
                                            })
                                        }
                                        className="w-full min-w-0 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none transition-all text-lg break-all"
                                        placeholder="https://..."
                                    />
                                    <p
                                        className={`text-xs font-mono mt-1 text-right tabular-nums ${novoMaterial.url.length >= MAX_URL ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                    >
                                        {novoMaterial.url.length}/{MAX_URL}
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input type="checkbox" id="checkExterno" checked={novoMaterial.isExterno} onChange={(e) => setNovoMaterial({...novoMaterial, isExterno: e.target.checked})} className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                    <label htmlFor="checkExterno" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <span className="font-bold block text-gray-900 dark:text-gray-100">É um link externo?</span>
                                        Se marcado, exibe um aviso de responsabilidade de LGPD antes do aluno sair da plataforma.
                                    </label>
                                </div>

                                <div className="mt-2 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNovoMaterial(estadoInicialNovoMaterial())
                                            setIsCriando(false)
                                        }}
                                        className="text-gray-600 dark:text-gray-400 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting || !isFormValido} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95">
                                        {isSubmitting ? 'Processando...' : (isGestao ? 'Publicar Material' : 'Enviar para Revisão')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* AVISO DE LINK EXTERNO COM TRACKING */}
            {avisoExterno.aberto && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm transition-opacity">
                    <Reveal direction="up" duration={200} className="w-full max-w-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                            
                            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
                                ⚠️
                            </div>
                            
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Aviso Externo</h3>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 font-medium">
                                Você está saindo do portal acadêmico. A instituição não controla nem se responsabiliza pelo conteúdo de sites de terceiros.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmarAcessoExterno}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                                >
                                    Estou Ciente, Continuar <span className="text-lg">↗</span>
                                </button>
                                <button 
                                    onClick={() => setAvisoExterno({ aberto: false, url: '', id: 0 })}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Cancelar e Voltar
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

        </div>
    )
}

export default Materiais