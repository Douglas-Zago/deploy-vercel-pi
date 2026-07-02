import React, { useState, useEffect, useMemo } from 'react'
import Reveal from '@/components/ui/Reveal'
import { usePodeEditar } from '@/utils/hooks/usePodeEditar'
import { InstitucionalService, Contato, Informacao } from '@/services/InstitucionalService'

type AbaType = 'CONTATOS' | 'INFORMACOES'

const MAX_BUSCA_INST = 120
const MAX_TOPICO_OU_TITULO = 140
const MAX_EMAIL_CONTATO = 100
const MAX_TELEFONE_CONTATO = 32
const MAX_DESCRICAO_INFO = 2000

const InformacoesDaEscola = () => {
    // --- SEGURANÇA E CONTEXTO ---
    const { isGestaoEditavel } = usePodeEditar()

    // --- ESTADOS BASE ---
    const [abaAtiva, setAbaAtiva] = useState<AbaType>('CONTATOS')
    const [contatos, setContatos] = useState<Contato[]>([])
    const [informacoes, setInformacoes] = useState<Informacao[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [termoBusca, setTermoBusca] = useState('')

    // --- ESTADOS DE MODAIS (Apenas Admin) ---
    const [modalContatoAberto, setModalContatoAberto] = useState(false)
    const [modalInfoAberto, setModalInfoAberto] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formContato, setFormContato] = useState({ setor: '', nome: '', email: '', telefone: '' })
    const [formInfo, setFormInfo] = useState({ titulo: '', categoria: 'Geral', descricao: '' })

    // --- CARREGAR DADOS ---
    const fetchDados = async () => {
        try {
            setIsLoading(true)
            const [resContatos, resInfos] = await Promise.all([
                InstitucionalService.getContatos(),
                InstitucionalService.getInformacoes()
            ])
            setContatos(resContatos)
            setInformacoes(resInfos)
        } catch (error) {
            console.error("Erro ao buscar dados institucionais:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchDados() }, [])

    // --- AÇÕES DO ADMIN (CRUD) ---
    const handleSalvarContato = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            await InstitucionalService.createContato(formContato)
            await fetchDados()
            setModalContatoAberto(false)
            setFormContato({ setor: '', nome: '', email: '', telefone: '' })
        } catch (error) {
            alert("Erro ao salvar contato.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSalvarInformacao = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await InstitucionalService.createInformacao({ ...formInfo, categoria: formInfo.categoria as any })
            await fetchDados()
            setModalInfoAberto(false)
            setFormInfo({ titulo: '', categoria: 'Geral', descricao: '' })
        } catch (error) {
            alert("Erro ao salvar informação.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeletarContato = async (id: number) => {
        if (!window.confirm("Excluir este contato definitivamente?")) return
        await InstitucionalService.deleteContato(id)
        fetchDados()
    }

    const handleDeletarInformacao = async (id: number) => {
        if (!window.confirm("Excluir esta informação definitivamente?")) return
        await InstitucionalService.deleteInformacao(id)
        fetchDados()
    }

    // --- FILTROS DE BUSCA ---
    const contatosFiltrados = useMemo(() => {
        return contatos.filter(c => 
            c.setor.toLowerCase().includes(termoBusca.toLowerCase()) || 
            c.nome.toLowerCase().includes(termoBusca.toLowerCase())
        )
    }, [contatos, termoBusca])

    const infosFiltradas = useMemo(() => {
        return informacoes.filter(i => 
            i.titulo.toLowerCase().includes(termoBusca.toLowerCase()) || 
            i.descricao.toLowerCase().includes(termoBusca.toLowerCase())
        )
    }, [informacoes, termoBusca])

    return (
        <div className="flex flex-col gap-8 p-4 max-w-6xl mx-auto w-full min-w-0">
            
            {/* CABEÇALHO */}
            <Reveal direction="down">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-0">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 break-words">
                            Informações da Escola
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Diretório oficial de contatos e regras da instituição.</p>
                    </div>

                    {/* Botão de Adicionar dinâmico baseado na aba (Apenas Admin) */}
                    {isGestaoEditavel && (
                        <button 
                            onClick={() => abaAtiva === 'CONTATOS' ? setModalContatoAberto(true) : setModalInfoAberto(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-md flex items-center gap-2 whitespace-nowrap"
                        >
                            <span>+</span> {abaAtiva === 'CONTATOS' ? 'Novo Contato' : 'Nova Informação'}
                        </button>
                    )}
                </div>
            </Reveal>

            {/* ABAS E BUSCA */}
            <Reveal direction="up" delay={100}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center w-full min-w-0">
                    
                    {/* Seletor de Abas */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:w-auto">
                        <button 
                            onClick={() => { setAbaAtiva('CONTATOS'); setTermoBusca(''); }}
                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${abaAtiva === 'CONTATOS' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            📞 Contatos
                        </button>
                        <button 
                            onClick={() => { setAbaAtiva('INFORMACOES'); setTermoBusca(''); }}
                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${abaAtiva === 'INFORMACOES' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            📋 Informações Úteis
                        </button>
                    </div>

                    {/* Input de Busca Dinâmico */}
                    <div className="relative w-full md:flex-1 md:max-w-md min-w-0">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">🔍</span>
                        <input 
                            type="search" 
                            placeholder={`Buscar em ${abaAtiva === 'CONTATOS' ? 'contatos' : 'informações'}...`}
                            maxLength={MAX_BUSCA_INST}
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value.slice(0, MAX_BUSCA_INST))}
                            className="w-full min-w-0 pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 outline-none shadow-sm transition-all text-[16px]"
                        />
                    </div>
                </div>
            </Reveal>

            {/* CONTEÚDO DAS ABAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-40"></div>)
                ) : abaAtiva === 'CONTATOS' ? (
                    // --- RENDER CONTATOS ---
                    contatosFiltrados.length > 0 ? (
                        contatosFiltrados.map((item, index) => (
                            <Reveal key={item.id} direction="up" delay={index * 50}>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-lg transition-shadow relative group">
                                    {isGestaoEditavel && (
                                        <button onClick={() => handleDeletarContato(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
                                            🗑️
                                        </button>
                                    )}
                                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">{item.setor}</span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.nome}</h3>
                                    <div className="mt-auto space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <p className="flex items-center gap-2">📧 <a href={`mailto:${item.email}`} className="hover:text-indigo-600 transition-colors">{item.email}</a></p>
                                        <p className="flex items-center gap-2">📱 <a href={`tel:${item.telefone}`} className="hover:text-indigo-600 transition-colors">{item.telefone}</a></p>
                                    </div>
                                </div>
                            </Reveal>
                        ))
                    ) : <EmptyState aba="contatos" />
                ) : (
                    // --- RENDER INFORMAÇÕES ---
                    infosFiltradas.length > 0 ? (
                        infosFiltradas.map((item, index) => (
                            <Reveal key={item.id} direction="up" delay={index * 50}>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-lg transition-shadow relative group">
                                    {isGestaoEditavel && (
                                        <button onClick={() => handleDeletarInformacao(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
                                            🗑️
                                        </button>
                                    )}
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 block bg-emerald-50 dark:bg-emerald-900/30 w-max px-3 py-1 rounded-full">{item.categoria}</span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">{item.titulo}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-auto">{item.descricao}</p>
                                </div>
                            </Reveal>
                        ))
                    ) : <EmptyState aba="informações" />
                )}
            </div>

            {/* ============================================== */}
            {/* MODAIS DE CRIAÇÃO (SÓ RENDERIZAM PARA ADMIN)   */}
            {/* ============================================== */}
            {isGestaoEditavel && modalContatoAberto && (
                <Modal 
                    titulo="Novo Contato" 
                    onClose={() => setModalContatoAberto(false)} 
                    onSubmit={handleSalvarContato} 
                    isSubmitting={isSubmitting}
                >
                    <Input label="Setor/Departamento *" maxLength={MAX_TOPICO_OU_TITULO} value={formContato.setor} onChange={(v) => setFormContato({...formContato, setor: v})} placeholder="Ex: Secretaria" />
                    <Input label="Nome do Responsável *" maxLength={MAX_TOPICO_OU_TITULO} value={formContato.nome} onChange={(v) => setFormContato({...formContato, nome: v})} placeholder="Ex: Maria Silva" />
                    <Input label="E-mail *" type="email" maxLength={MAX_EMAIL_CONTATO} value={formContato.email} onChange={(v) => setFormContato({...formContato, email: v})} placeholder="contato@pace.edu.br" />
                    <Input label="Telefone *" maxLength={MAX_TELEFONE_CONTATO} value={formContato.telefone} onChange={(v) => setFormContato({...formContato, telefone: v})} placeholder="(00) 00000-0000" />
                </Modal>
            )}

            {isGestaoEditavel && modalInfoAberto && (
                <Modal 
                    titulo="Nova Informação Útil" 
                    onClose={() => setModalInfoAberto(false)} 
                    onSubmit={handleSalvarInformacao} 
                    isSubmitting={isSubmitting}
                >
                    <Input label="Título *" maxLength={MAX_TOPICO_OU_TITULO} value={formInfo.titulo} onChange={(v) => setFormInfo({...formInfo, titulo: v})} placeholder="Ex: Regras da Biblioteca" />
                    <div className="mb-4 min-w-0">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoria *</label>
                        <select value={formInfo.categoria} onChange={(e) => setFormInfo({...formInfo, categoria: e.target.value})} className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
                            <option value="Horários">Horários</option>
                            <option value="Regras">Regras</option>
                            <option value="Localização">Localização</option>
                            <option value="Geral">Geral</option>
                        </select>
                    </div>
                    <div className="mb-4 min-w-0">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Descrição / Conteúdo *</label>
                        <textarea
                            required
                            rows={5}
                            maxLength={MAX_DESCRICAO_INFO}
                            value={formInfo.descricao}
                            onChange={(e) =>
                                setFormInfo({
                                    ...formInfo,
                                    descricao: e.target.value.slice(0, MAX_DESCRICAO_INFO),
                                })
                            }
                            className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none resize-none break-words text-[16px]"
                            placeholder="Digite as informações detalhadas aqui..."
                        />
                        <p
                            className={`text-xs font-mono mt-1 text-right tabular-nums ${formInfo.descricao.length >= MAX_DESCRICAO_INFO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                        >
                            {formInfo.descricao.length}/{MAX_DESCRICAO_INFO}
                        </p>
                    </div>
                </Modal>
            )}

        </div>
    )
}

// --- COMPONENTES AUXILIARES DE UI ---

interface EmptyStateProps {
    aba: string;
}

const EmptyState = ({ aba }: EmptyStateProps) => (
    <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <div className="text-4xl mb-4 opacity-50">📭</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nenhum resultado encontrado em {aba}.</h3>
    </div>
)

interface InputProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    maxLength: number
}

const Input = ({ label, value, onChange, placeholder, type = 'text', maxLength }: InputProps) => (
    <div className="mb-4 min-w-0">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
        <input 
            required 
            type={type} 
            maxLength={maxLength}
            value={value} 
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))} 
            className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-[16px]" 
            placeholder={placeholder} 
        />
        <p className={`text-xs font-mono mt-1 text-right tabular-nums ${value.length >= maxLength ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
            {value.length}/{maxLength}
        </p>
    </div>
)

interface ModalProps {
    titulo: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    children: React.ReactNode;
}

const Modal = ({ titulo, onClose, onSubmit, isSubmitting, children }: ModalProps) => (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
        <Reveal direction="up" className="w-full max-w-md my-auto">
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92dvh] flex flex-col min-w-0">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center gap-2 bg-gray-50 dark:bg-gray-900 shrink-0">
                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-white break-words min-w-0 pr-2">{titulo}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold shrink-0">✕</button>
                </div>
                <form onSubmit={onSubmit} className="p-6 overflow-y-auto min-w-0 flex flex-col">
                    {children}
                    <div className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                        <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 font-bold py-3 px-5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 w-full sm:w-auto">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 w-full sm:w-auto">
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </Reveal>
    </div>
)

export default InformacoesDaEscola