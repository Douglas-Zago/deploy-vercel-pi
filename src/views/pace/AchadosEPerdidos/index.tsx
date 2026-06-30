// src/views/pace/AchadosEPerdidos/index.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import { isPerfilGestao } from '@/constants/roles.constant'
import { AchadosService, Achado, CategoriaAchado } from '@/services/AchadosService'

const MAX_TITULO = 100
const MAX_DESCRICAO = 500
const MAX_LOCAL = 100
const MAX_BUSCA = 120
const MAX_NOME_RETIRADA = 120

const formatarDataAchado = (dataStr: string | null | undefined): string => {
    if (!dataStr) return '—'
    const parsed = Date.parse(dataStr)
    if (!Number.isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString('pt-BR')
    }
    return dataStr
}

export default function AchadosEPerdidos() {
    // --- SEGURANÇA E CONTEXTO ---
    const { user } = useAuth()
    const isGestao = isPerfilGestao(user?.authority)

    // --- ESTADOS BASE ---
    const [itens, setItems] = useState<Achado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [termoBusca, setTermoBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Disponível' | 'Devolvido'>('Disponível')

    // --- MODAIS E FORMULÁRIOS ---
    const [isCriando, setIsCriando] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Modal de Instrução (Aluno)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    
    // Modal de Devolução (Admin)
    const [isDevolvendo, setIsDevolvendo] = useState(false)
    const [itemParaDevolver, setItemParaDevolver] = useState<Achado | null>(null)
    const [nomeRetirada, setNomeRetirada] = useState('')

    // Dados do Novo Item
    const [novoItem, setNovoItem] = useState({
        titulo: '',
        categoria: 'Vestuário' as CategoriaAchado,
        descricao: '',
        local: '',
    })
    const [imagemFile, setImagemFile] = useState<File | null>(null)
    const [lgpdAceito, setLgpdAceito] = useState(false)

    // --- FETCH DADOS ---
    const fetchItens = async () => {
        setIsLoading(true)
        try {
            const data = await AchadosService.getAll()
            setItems(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchItens() }, [])

    // --- AÇÕES DO ADMIN ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem é muito grande. Máximo permitido: 5MB.')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        setImagemFile(file)
        setLgpdAceito(false)
    }

    const handleSalvarItem = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            await AchadosService.create(
                {
                    titulo: novoItem.titulo.trim(),
                    categoria: novoItem.categoria,
                    descricao: novoItem.descricao.trim(),
                    local: novoItem.local.trim(),
                    autorId: user?.userId ? Number(user.userId) || null : null,
                    autorNome: user?.userName ?? null,
                },
                imagemFile,
            )
            
            await fetchItens()
            setIsCriando(false)
            setNovoItem({ titulo: '', categoria: 'Vestuário', descricao: '', local: '' })
            setImagemFile(null)
            setLgpdAceito(false)
        } catch (error) {
            alert("Erro ao registrar item.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmarDevolucao = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!itemParaDevolver || nomeRetirada.trim().length < 3) return
        
        try {
            setIsSubmitting(true)
            await AchadosService.marcarComoDevolvido(itemParaDevolver.id, nomeRetirada.trim())
            await fetchItens()
            setIsDevolvendo(false)
            setItemParaDevolver(null)
            setNomeRetirada('')
        } catch (error) {
            alert("Erro ao registrar devolução.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeletar = async (id: number) => {
        if(!window.confirm("Deseja excluir este registro do sistema permanentemente?")) return
        try {
            await AchadosService.deletar(id)
            await fetchItens()
        } catch (error) {
            alert("Erro ao excluir.")
        }
    }

    // --- FILTROS & PRIVACIDADE ---
    const itensFiltrados = useMemo(() => {
        let baseItems = itens
        if (!isGestao) {
            baseItems = baseItems.filter((i) => !i.devolvido)
        }

        let filtrados = baseItems
        if (filtroStatus !== 'Todos') {
            if (filtroStatus === 'Disponível') {
                filtrados = filtrados.filter((i) => !i.devolvido)
            } else {
                filtrados = filtrados.filter((i) => i.devolvido)
            }
        }

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase()
            filtrados = filtrados.filter(
                (i) =>
                    i.titulo.toLowerCase().includes(termo) ||
                    i.descricao.toLowerCase().includes(termo),
            )
        }

        return filtrados
    }, [itens, filtroStatus, termoBusca, isGestao])

    const podeMarcarComoDevolvido = (item: Achado) =>
        !item.devolvido &&
        (isGestao || (item.autorId != null && String(item.autorId) === user?.userId))

    // --- VALIDAÇÕES DE FORMULÁRIO ---
    const isFormValido =
        novoItem.titulo.trim().length > 2 &&
        novoItem.descricao.trim().length > 5 &&
        novoItem.local.trim().length > 2
    const podeSalvar = isFormValido && (!imagemFile || lgpdAceito)

    const getCategoriaIcon = (categoria: string) => {
        switch(categoria) {
            case 'Vestuário': return '👕'
            case 'Eletrônicos': return '📱'
            case 'Documentos': return '🪪'
            case 'Material Escolar': return '🎒'
            default: return '📦'
        }
    }

    return (
        <div className="flex flex-col gap-8 w-full p-4 md:p-8">
            
            {/* CABEÇALHO */}
            <Reveal direction="down">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Achados e Perdidos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Perdeu algo? Verifique se foi entregue na secretaria.</p>
                    </div>

                    {isGestao && (
                        <button 
                            onClick={() => setIsCriando(true)}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 text-lg"
                        >
                            <span>+</span> Registrar Item
                        </button>
                    )}
                </div>
            </Reveal>

            {/* CONTROLES DE BUSCA */}
            <Reveal direction="up" delay={100}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        placeholder="Buscar item (ex: Caderno, Casaco)..." 
                        maxLength={MAX_BUSCA}
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value.slice(0, MAX_BUSCA))}
                        className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                    />
                    
                    {/* O filtro exibe opções diferentes baseadas na permissão */}
                    <select 
                        value={filtroStatus} 
                        onChange={(e) => setFiltroStatus(e.target.value as any)}
                        className="px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold shadow-sm"
                    >
                        {isGestao ? (
                            <>
                                <option value="Todos">Exibir: Todos</option>
                                <option value="Disponível">🟢 Somente Disponíveis</option>
                                <option value="Devolvido">⚪ Histórico (Devolvidos)</option>
                            </>
                        ) : (
                            <>
                                <option value="Todos">Exibir: Todos Disponíveis</option>
                                {/* Esconde o filtro de 'Devolvidos' para não admins */}
                            </>
                        )}
                    </select>
                </div>
            </Reveal>

            {/* LISTAGEM (MASONRY GRID) */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : itensFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {itensFiltrados.map((item, index) => (
                        <Reveal key={item.id} direction="up" delay={index * 50}>
                            <div
                                className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all min-w-0 ${
                                    item.devolvido
                                        ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-gray-50/80 dark:bg-gray-900/40 opacity-[0.88]'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                            >
                                
                                {/* Área da Imagem */}
                                <div className="relative h-48 w-full min-h-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {item.imagemUrl ? (
                                        <img src={item.imagemUrl} alt={item.titulo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-6xl opacity-30">{getCategoriaIcon(item.categoria)}</div>
                                    )}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-1rem)]">
                                        <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full break-words">
                                            {item.categoria}
                                        </span>
                                        {item.devolvido ? (
                                            <span className="bg-emerald-600/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/80 shadow-sm">
                                                Devolvido
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Informações */}
                                <div className="p-5 flex flex-col flex-grow min-w-0">
                                    <h3
                                        className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 break-words hyphens-auto min-w-0"
                                        title={item.titulo}
                                    >
                                        {item.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-4 min-h-[2.5rem] break-words hyphens-auto min-w-0">
                                        {item.descricao}
                                    </p>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 min-w-0">
                                        <span className="flex items-start gap-1 break-words hyphens-auto min-w-0">
                                            <span className="shrink-0">📍</span>
                                            <span>
                                                Encontrado: <span className="break-words">{item.local}</span>
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1 break-all sm:break-words min-w-0">
                                            📅 Registrado: {formatarDataAchado(item.dataCriacao)}
                                        </span>
                                        {item.devolvido && item.entreguePara && isGestao ? (
                                            <span className="flex items-start gap-1 text-indigo-600 dark:text-indigo-400 mt-1 break-words min-w-0">
                                                <span className="shrink-0">👤</span>
                                                <span>Entregue para: {item.entreguePara}</span>
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Ações do Card */}
                                    <div className="mt-5 pt-2 flex flex-wrap gap-2 min-w-0">
                                        {!item.devolvido && podeMarcarComoDevolvido(item) ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setItemParaDevolver(item)
                                                    setIsDevolvendo(true)
                                                }}
                                                className="flex-1 min-w-[10rem] bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 font-bold py-2 px-3 rounded-lg transition-colors"
                                            >
                                                Marcar como Devolvido
                                            </button>
                                        ) : null}
                                        {!item.devolvido && !podeMarcarComoDevolvido(item) ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsInfoOpen(true)}
                                                className="flex-1 min-w-[10rem] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold py-2 px-3 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                                            >
                                                É meu! Como retirar?
                                            </button>
                                        ) : null}
                                        {isGestao ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeletar(item.id)}
                                                className="px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors font-bold shrink-0"
                                                title="Excluir Registro"
                                            >
                                                🗑️
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            ) : (
                <Reveal direction="up">
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <span className="text-6xl mb-4 opacity-50">📭</span>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Nenhum item encontrado</h3>
                        <p className="text-gray-500 mt-2 max-w-md">Que bom! Parece que não há itens perdidos no momento (ou os filtros não retornaram nada).</p>
                    </div>
                </Reveal>
            )}

            {/* ================================================================= */}
            {/* MODAL ADMIN: REGISTRAR NOVO ITEM COM PROTEÇÃO LGPD                */}
            {/* ================================================================= */}
            {isCriando && isGestao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity overflow-y-auto">
                    <Reveal direction="up" duration={300} className="w-full max-w-2xl my-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">Registrar Item Encontrado</h3>
                                <button onClick={() => { setIsCriando(false); setImagemFile(null); setLgpdAceito(false) }} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full text-xl font-bold">✕</button>
                            </div>
                            
                            <form onSubmit={handleSalvarItem} className="p-6 md:p-8 flex flex-col gap-6">
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 flex flex-col gap-5">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">O que é? *</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={MAX_TITULO}
                                                value={novoItem.titulo}
                                                onChange={(e) =>
                                                    setNovoItem({ ...novoItem, titulo: e.target.value.slice(0, MAX_TITULO) })
                                                }
                                                placeholder="Ex: Estojo azul da Faber Castell"
                                                className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 text-right tabular-nums">
                                                {novoItem.titulo.length}/{MAX_TITULO}
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Categoria *</label>
                                                <select value={novoItem.categoria} onChange={(e) => setNovoItem({...novoItem, categoria: e.target.value as CategoriaAchado})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold">
                                                    <option value="Vestuário">👕 Vestuário</option>
                                                    <option value="Eletrônicos">📱 Eletrônicos</option>
                                                    <option value="Material Escolar">🎒 Material Escolar</option>
                                                    <option value="Documentos">🪪 Documentos</option>
                                                    <option value="Outros">📦 Outros</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Onde foi achado? *</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={MAX_LOCAL}
                                                value={novoItem.local}
                                                onChange={(e) =>
                                                    setNovoItem({
                                                        ...novoItem,
                                                        local: e.target.value.slice(0, MAX_LOCAL),
                                                    })
                                                }
                                                placeholder="Ex: Pátio Principal, Banco 3"
                                                className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 text-right tabular-nums">
                                                {novoItem.local.length}/{MAX_LOCAL}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Upload de Imagem (Opcional) */}
                                    <div className="w-full md:w-1/3 flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Foto do Item (Opcional)</label>
                                        <div className="flex-grow border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center p-4 relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center overflow-hidden">
                                            <input type="file" accept="image/jpeg, image/png" ref={fileInputRef} onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            {imagemFile ? (
                                                <div className="absolute inset-0 w-full h-full p-2">
                                                    <img src={URL.createObjectURL(imagemFile)} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm rounded-lg m-2">
                                                        Trocar Imagem
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-3xl mb-2">📸</span>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Clique para enviar</span>
                                                    <span className="text-[10px] text-gray-400 mt-1">JPG/PNG até 5MB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Descrição Detalhada *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        maxLength={MAX_DESCRICAO}
                                        value={novoItem.descricao}
                                        onChange={(e) =>
                                            setNovoItem({
                                                ...novoItem,
                                                descricao: e.target.value.slice(0, MAX_DESCRICAO),
                                            })
                                        }
                                        placeholder="Descreva cor, marca, marcas de uso ou características únicas..."
                                        className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none break-words"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 text-right tabular-nums">
                                        {novoItem.descricao.length}/{MAX_DESCRICAO}
                                    </p>
                                </div>

                                {/* PROTEÇÃO LGPD - SÓ APARECE SE TIVER IMAGEM */}
                                {imagemFile && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
                                        <input type="checkbox" id="lgpdCheck" checked={lgpdAceito} onChange={(e) => setLgpdAceito(e.target.checked)} className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-600 cursor-pointer" />
                                        <label htmlFor="lgpdCheck" className="text-sm text-amber-800 dark:text-amber-300 cursor-pointer">
                                            <strong className="block mb-1">Termo de Responsabilidade Visual (LGPD)</strong>
                                            Declaro que a foto anexada foca estritamente no objeto perdido e <strong>NÃO</strong> expõe o rosto, uniforme identificável ou identidade de alunos, funcionários ou terceiros.
                                        </label>
                                    </div>
                                )}

                                <div className="mt-2 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={() => { setIsCriando(false); setImagemFile(null); setLgpdAceito(false) }} className="text-gray-600 dark:text-gray-400 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting || !podeSalvar} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-xl disabled:opacity-50 transition-transform active:scale-95 shadow-md">
                                        {isSubmitting ? 'Salvando...' : 'Publicar Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL ADMIN: MARCAR DEVOLVIDO */}
            {isDevolvendo && itemParaDevolver && (isGestao || String(itemParaDevolver.autorId) === user?.userId) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
                    <Reveal direction="up" duration={200} className="w-full max-w-md">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                            <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-2">Registrar Devolução</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm break-words hyphens-auto">
                                Você está prestes a devolver:{' '}
                                <strong className="text-gray-900 dark:text-white">{itemParaDevolver.titulo}</strong>
                            </p>
                            
                            <form onSubmit={handleConfirmarDevolucao} className="flex flex-col gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Atenção: Exija Documento!</label>
                                    <input
                                        required
                                        type="text"
                                        minLength={3}
                                        maxLength={MAX_NOME_RETIRADA}
                                        value={nomeRetirada}
                                        onChange={(e) => setNomeRetirada(e.target.value.slice(0, MAX_NOME_RETIRADA))}
                                        placeholder="Nome e/ou Matrícula do aluno"
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none text-lg min-w-0"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => { setIsDevolvendo(false); setNomeRetirada('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3.5 rounded-xl transition-colors">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting || nomeRetirada.trim().length < 3} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors shadow-md">Confirmar</button>
                                </div>
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* MODAL ALUNO/PROFESSOR: INFO COMO RETIRAR */}
            {isInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
                    <Reveal direction="up" duration={200} className="w-full max-w-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                            <div className="text-6xl mb-4">🏫</div>
                            <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-2">Este item é seu?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Por questões de segurança, a retirada de objetos deve ser feita <strong>presencialmente na Secretaria</strong>. Apresente sua carteirinha de estudante e descreva detalhes do item para comprovar que é seu.
                            </p>
                            <button onClick={() => setIsInfoOpen(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-md">
                                Entendi, vou até lá!
                            </button>
                        </div>
                    </Reveal>
                </div>
            )}

        </div>
    )
}