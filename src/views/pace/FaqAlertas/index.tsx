import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Reveal from '@/components/ui/Reveal'
import {
    FaqAlertService,
    type AlertaGlobal,
    type FaqItem,
} from '@/services/FaqAlertService'
import { usePodeEditar } from '@/utils/hooks/usePodeEditar'

type AbaGestao = 'FAQ' | 'ALERTA'

const MAX_PERGUNTA = 200
const MAX_RESPOSTA = 2000
const MAX_TITULO_ALERTA = 120
const MAX_MENSAGEM_ALERTA = 1000

const GestaoFaqAlertas = () => {
    const { podeEditar } = usePodeEditar()
    const [abaAtiva, setAbaAtiva] = useState<AbaGestao>('FAQ')
    const [faqItens, setFaqItens] = useState<FaqItem[]>([])
    const [alertaAtual, setAlertaAtual] = useState<AlertaGlobal | null>(null)

    const [modalFaqAberto, setModalFaqAberto] = useState(false)
    const [faqEmEdicao, setFaqEmEdicao] = useState<FaqItem | null>(null)
    const [pergunta, setPergunta] = useState('')
    const [resposta, setResposta] = useState('')

    const [tituloAlerta, setTituloAlerta] = useState('')
    const [mensagemAlerta, setMensagemAlerta] = useState('')
    const [salvando, setSalvando] = useState(false)

    const carregarDados = useCallback(() => {
        setFaqItens(FaqAlertService.getFaqItems())
        setAlertaAtual(FaqAlertService.getAlertaGlobal())
    }, [])

    useEffect(() => {
        carregarDados()
        return FaqAlertService.subscribe(carregarDados)
    }, [carregarDados])

    const abrirNovoFaq = () => {
        setFaqEmEdicao(null)
        setPergunta('')
        setResposta('')
        setModalFaqAberto(true)
    }

    const abrirEditarFaq = (item: FaqItem) => {
        setFaqEmEdicao(item)
        setPergunta(item.pergunta)
        setResposta(item.resposta)
        setModalFaqAberto(true)
    }

    const handleSalvarFaq = (e: FormEvent) => {
        e.preventDefault()
        if (!pergunta.trim() || !resposta.trim()) return

        if (faqEmEdicao) {
            FaqAlertService.updateFaqItem(faqEmEdicao.id, {
                pergunta,
                resposta,
            })
        } else {
            FaqAlertService.addFaqItem(pergunta, resposta)
        }

        carregarDados()
        setModalFaqAberto(false)
    }

    const handleExcluirFaq = (id: string) => {
        if (!window.confirm('Excluir esta pergunta do FAQ?')) return
        FaqAlertService.deleteFaqItem(id)
        carregarDados()
    }

    const handleAtivarAlerta = async (e: FormEvent) => {
        e.preventDefault()
        if (!tituloAlerta.trim() || !mensagemAlerta.trim()) return

        setSalvando(true)
        try {
            FaqAlertService.ativarAlerta(tituloAlerta, mensagemAlerta)
            carregarDados()
        } finally {
            setSalvando(false)
        }
    }

    const handleDesativarAlerta = () => {
        if (!window.confirm('Desativar o alerta urgente para todos os usuários?')) return
        FaqAlertService.desativarAlerta()
        carregarDados()
    }

    const alertaEstaAtivo = alertaAtual?.ativo === true

    return (
        <div className="flex flex-col gap-8 p-4 max-w-6xl mx-auto w-full min-w-0">
            <Reveal direction="down">
                <CabecalhoPagina
                    titulo="FAQ e Alertas"
                    subtitulo="Gerencie o conteúdo público do FAQ e os avisos urgentes exibidos a todos os usuários logados."
                />
            </Reveal>

            <Reveal direction="up" delay={100}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setAbaAtiva('FAQ')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                abaAtiva === 'FAQ'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            ❓ FAQ Dinâmico
                        </button>
                        <button
                            type="button"
                            onClick={() => setAbaAtiva('ALERTA')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                abaAtiva === 'ALERTA'
                                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            🚨 Alerta Global
                        </button>
                    </div>

                    {abaAtiva === 'FAQ' && podeEditar && (
                        <button
                            type="button"
                            onClick={abrirNovoFaq}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-md whitespace-nowrap"
                        >
                            + Nova Pergunta
                        </button>
                    )}
                </div>
            </Reveal>

            {abaAtiva === 'FAQ' ? (
                <Reveal direction="up" delay={150}>
                    <div className="space-y-4">
                        {faqItens.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                Nenhuma pergunta cadastrada. Adicione a primeira.
                            </p>
                        ) : (
                            faqItens.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                                >
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 break-words">
                                        {item.pergunta}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {item.resposta}
                                    </p>
                                    {podeEditar && (
                                    <AcoesFaqItem
                                        onEditar={() => abrirEditarFaq(item)}
                                        onExcluir={() => handleExcluirFaq(item.id)}
                                    />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Reveal>
            ) : (
                <Reveal direction="up" delay={150}>
                    <div className="grid lg:grid-cols-2 gap-6">
                        {podeEditar ? (
                        <form
                            onSubmit={handleAtivarAlerta}
                            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Publicar alerta urgente
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ao ativar, substitui qualquer alerta anterior. Todos os usuários
                                logados verão um pop-up obrigatório até confirmarem ciência.
                            </p>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    maxLength={MAX_TITULO_ALERTA}
                                    value={tituloAlerta}
                                    onChange={(e) => setTituloAlerta(e.target.value)}
                                    className="w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Ex.: Manutenção programada"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Mensagem
                                </label>
                                <textarea
                                    maxLength={MAX_MENSAGEM_ALERTA}
                                    rows={5}
                                    value={mensagemAlerta}
                                    onChange={(e) => setMensagemAlerta(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500 resize-y"
                                    placeholder="Descreva o comunicado urgente..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold transition-colors"
                            >
                                {salvando ? 'Ativando...' : 'Ativar Alerta Urgente'}
                            </button>
                        </form>
                        ) : (
                        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Publicar alerta urgente
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Modo apresentação: a publicação de alertas está desativada nesta conta.
                            </p>
                        </div>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Status atual
                            </h2>

                            {alertaEstaAtivo && alertaAtual ? (
                                <>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold uppercase">
                                        ● Ativo
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
                                        <p className="font-bold text-gray-900 dark:text-white mb-2">
                                            {alertaAtual.titulo}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {alertaAtual.mensagem}
                                        </p>
                                    </div>
                                    {podeEditar && (
                                    <button
                                        type="button"
                                        onClick={handleDesativarAlerta}
                                        className="w-full min-h-[44px] rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Desativar Alerta
                                    </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Nenhum alerta urgente ativo no momento.
                                    {alertaAtual && !alertaAtual.ativo && (
                                        <span className="block mt-2 text-gray-400">
                                            Último alerta ({alertaAtual.titulo}) foi desativado.
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </Reveal>
            )}

            {modalFaqAberto && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setModalFaqAberto(false)}
                        aria-hidden
                    />
                    <form
                        onSubmit={handleSalvarFaq}
                        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {faqEmEdicao ? 'Editar pergunta' : 'Nova pergunta'}
                        </h3>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Pergunta</label>
                            <input
                                type="text"
                                maxLength={MAX_PERGUNTA}
                                value={pergunta}
                                onChange={(e) => setPergunta(e.target.value)}
                                className="w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Resposta</label>
                            <textarea
                                maxLength={MAX_RESPOSTA}
                                rows={5}
                                value={resposta}
                                onChange={(e) => setResposta(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setModalFaqAberto(false)}
                                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

function CabecalhoPagina({
    titulo,
    subtitulo,
}: {
    titulo: string
    subtitulo: string
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-0">
            <div className="min-w-0">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 break-words">
                    {titulo}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitulo}</p>
            </div>
        </div>
    )
}

function AcoesFaqItem({
    onEditar,
    onExcluir,
}: {
    onEditar: () => void
    onExcluir: () => void
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={onEditar}
                className="px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
                Editar
            </button>
            <button
                type="button"
                onClick={onExcluir}
                className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/50"
            >
                Excluir
            </button>
        </div>
    )
}

export default GestaoFaqAlertas
