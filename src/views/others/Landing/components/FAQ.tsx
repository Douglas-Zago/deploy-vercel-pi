import { useState } from 'react'
import { HiChevronDown } from 'react-icons/hi'
import { FaWhatsapp, FaInstagram, FaPhone } from 'react-icons/fa'
import type React from 'react'

interface FAQProps {
    mode: string
}

interface FAQItem {
    id: number
    question: string
    answer: React.ReactNode
}

const faqItems: FAQItem[] = [
    {
        id: 1,
        question: 'Como justifico uma falta?',
        answer: (
            <div>
                <p>Presencialmente na secretaria em até 48h.</p>
                <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                    alt="Secretaria"
                    className="mt-4 rounded-xl w-full max-w-md shadow-md"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        ),
    },
    {
        id: 2,
        question: 'Como acesso o Portal do Aluno?',
        answer: 'Clique em "Acessar o Portal". Seu usuário é sua Matrícula e a senha é sua Data de Nascimento.',
    },
    {
        id: 3,
        question: 'Onde vejo minhas notas?',
        answer: (
            <div>
                <p>Após o login, acesse a "Área do Aluno" no menu lateral. Assista ao tutorial rápido abaixo:</p>
                <iframe
                    className="w-full aspect-video mt-4 rounded-xl shadow-md"
                    src="https://www.youtube.com/embed/LXb3EKWsInQ"
                    title="Tutorial do Portal"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        ),
    },
    {
        id: 4,
        question: 'Qual o horário da secretaria?',
        answer: 'De segunda a sexta, das 07h30 às 18h00.',
    },
]

const FAQ = ({ mode }: FAQProps) => {
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [copiedPhone, setCopiedPhone] = useState(false)

    const toggleExpand = (id: number) => {
        const isOpening = expandedId !== id
        setExpandedId(isOpening ? id : null)
        if (isOpening) {
            setTimeout(() => {
                document.getElementById('faq-item-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 200)
        }
    }

    const handleCopyPhone = async () => {
        try {
            await navigator.clipboard.writeText('(11) 99999-9999')
            setCopiedPhone(true)
            setTimeout(() => setCopiedPhone(false), 2000)
        } catch (err: unknown) {
            console.error('Erro ao copiar:', err)
        }
    }

    const bgClass = mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    const borderClass = mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
    const textClass = mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
    const headingClass = mode === 'dark' ? 'text-white' : 'text-gray-900'
    const cardClass =
        mode === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
            : 'bg-white border-gray-200 hover:bg-gray-50'
    const contactCardClass =
        mode === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300'
            : 'bg-white border-gray-200 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-400/50 transition-all duration-300'

    return (
        <section id="faq" className={`py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-semibold mb-4 tracking-wider uppercase">Suporte Rápido</span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-6">
                        Dúvidas Frequentes (FAQ)
                    </h2>
                    <p className={`text-lg ${textClass}`}>
                        Encontre respostas para as perguntas mais comuns sobre o portal escolar
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4 mb-12">
                    {faqItems.map((item) => (
                        <div
                            key={item.id}
                            id={'faq-item-' + item.id}
                            className={`border ${borderClass} rounded-lg transition-all duration-200 ${cardClass}`}
                        >
                            <button
                                onClick={() => toggleExpand(item.id)}
                                className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors`}
                            >
                                <span className={`font-semibold ${headingClass}`}>
                                    {item.question}
                                </span>
                                <HiChevronDown
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        expandedId === item.id ? 'transform rotate-180' : ''
                                    } ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                                />
                            </button>

                            {/* Answer - Smooth Grid Animation */}
                            <div className={`grid transition-all duration-300 ease-in-out ${expandedId === item.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className={`px-6 py-4 border-t ${borderClass} ${textClass}`}>
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-8 border border-blue-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h3 className={`text-2xl font-bold ${headingClass} mb-2`}>
                            Não encontrou a resposta que procura?
                        </h3>
                        <p className={`${textClass}`}>
                            Estamos aqui para ajudar! Escolha uma opção abaixo para entrar em contato conosco.
                        </p>
                    </div>

                    {/* Ajustado de 4 colunas para 3 colunas para manter o layout perfeito */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card 1: WhatsApp */}
                        <a
                            href="https://wa.me/5511999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`border ${borderClass} rounded-lg p-6 transition-all duration-200 ${contactCardClass} group inline-block w-full h-full`}
                        >
                            <div className="flex flex-col items-center justify-center text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FaWhatsapp className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h4 className={`font-semibold ${headingClass} mb-2`}>
                                    WhatsApp
                                </h4>
                                <p className={`text-sm ${textClass}`}>
                                    Mensagem no WhatsApp
                                </p>
                            </div>
                        </a>

                        {/* Card 2: Instagram */}
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`border ${borderClass} rounded-lg p-6 transition-all duration-200 ${contactCardClass} group inline-block w-full h-full`}
                        >
                            <div className="flex flex-col items-center justify-center text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FaInstagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                </div>
                                <h4 className={`font-semibold ${headingClass} mb-2`}>
                                    Instagram
                                </h4>
                                <p className={`text-sm ${textClass}`}>
                                    Nosso Instagram
                                </p>
                            </div>
                        </a>

                        {/* Card 3: Copiar Telefone */}
                        <button
                            onClick={handleCopyPhone}
                            className={`border ${borderClass} rounded-lg p-6 transition-all duration-200 ${contactCardClass} group`}
                        >
                            <div className="flex flex-col items-center justify-center text-center h-full">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FaPhone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <h4 className={`font-semibold ${headingClass} mb-2`}>
                                    Telefone
                                </h4>
                                <p className={`text-sm ${textClass}`}>
                                    {copiedPhone ? '✓ Copiado!' : 'Copiar Número'}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ