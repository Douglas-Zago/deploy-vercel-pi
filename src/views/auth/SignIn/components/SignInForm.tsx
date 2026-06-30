// src/views/auth/SignIn/components/SignInForm.tsx

import React, { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'

interface SignInFormProps {
    className?: string
    disableSubmit?: boolean
    setMessage?: (message: string) => void
    passwordHint?: React.ReactNode
}

const signInSchema = z.object({
    email: z.string().email('Informe um e-mail válido.'),
    password: z.string().min(1, 'A senha é obrigatória.'),
})

const SignInForm = ({ className, disableSubmit, setMessage, passwordHint }: SignInFormProps) => {
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [termosAceitos, setTermosAceitos] = useState(false)

    const [isTermosOpen, setIsTermosOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erroLocal, setErroLocal] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErroLocal('')

        if (!termosAceitos) {
            setErroLocal('Você precisa aceitar os Termos de Uso para acessar o portal.')
            return
        }

        const parsed = signInSchema.safeParse({ email, password })
        if (!parsed.success) {
            setErroLocal(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
            return
        }

        setLoading(true)

        const result = await signIn(parsed.data)

        if (result?.status === 'failed') {
            setErroLocal('Credenciais inválidas. Verifique seu e-mail e senha.')
            setMessage?.('Credenciais inválidas.')
        } else if (result?.status === 'success') {
            localStorage.setItem('pace_termos_aceitos', 'true')
        }

        setLoading(false)
    }

    return (
        <div className={className}>
            <Reveal direction="up" duration={0.4}>
                <form onSubmit={handleLogin} className="space-y-5">
                    {erroLocal && (
                        <div className="animate-[shake_0.35s_ease-in-out] rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm overflow-hidden">
                            <div className="flex items-start gap-3 p-4">
                                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                        Não foi possível continuar
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                                        {erroLocal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            E-mail
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="email"
                                required
                                disabled={disableSubmit || loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm hover:shadow-md"
                                placeholder="Digite seu e-mail institucional"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Senha
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm6-3h-1V7a5 5 0 00-10 0v1H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zm-8-1a3 3 0 116 0v1h-6V7z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="password"
                                required
                                disabled={disableSubmit || loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm hover:shadow-md"
                                placeholder="Digite sua senha"
                            />
                        </div>

                        <div className="flex justify-end w-full -mt-0.5">
                            {passwordHint}
                        </div>
                    </div>

                    {/* Aceite de Termos de Uso */}
                    <div className="flex items-start gap-3 pt-1">
                        <label htmlFor="termos" className="relative mt-0.5 cursor-pointer shrink-0">
                            <input
                                id="termos"
                                type="checkbox"
                                checked={termosAceitos}
                                disabled={disableSubmit || loading}
                                onChange={(e) => setTermosAceitos(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-500/20"></div>
                            <svg
                                className="absolute inset-0 m-auto w-3.5 h-3.5 text-white opacity-0 scale-75 transition-all peer-checked:opacity-100 peer-checked:scale-100"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </label>

                        <label htmlFor="termos" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                            Li e aceito os{' '}
                            <button
                                type="button"
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline focus:outline-none"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsTermosOpen(true)
                                }}
                            >
                                Termos de Uso e Política de Privacidade
                            </button>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={disableSubmit || loading || !termosAceitos}
                        className="w-full flex items-center justify-center gap-2.5 py-4 px-4 mt-6 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-90"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span>Acessando...</span>
                            </>
                        ) : (
                            <>
                                <span>Entrar no Portal</span>
                                <svg className="w-4 h-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </Reveal>

            {/* MODAL DE TERMOS DE USO */}
            {isTermosOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm">
                    <Reveal direction="down" duration={0.3} className="w-full max-w-3xl">
                        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start sm:items-center gap-4 bg-gray-50/70 dark:bg-gray-800/50">
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                        Documento Institucional
                                    </p>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                        Termos de Uso, Privacidade e Tratamento de Dados
                                    </h2>
                                </div>

                                <button
                                    onClick={() => setIsTermosOpen(false)}
                                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-5 sm:p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 leading-7 space-y-6 [scrollbar-width:thin] [scrollbar-color:rgba(99,102,241,0.45)_transparent]">
                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        1. Aceitação dos Termos
                                    </h3>
                                    <p>
                                        Ao acessar o portal PACE (Portal de Apoio e Comunicação Escolar), o usuário declara ter lido,
                                        compreendido e aceito integralmente estes Termos de Uso, a Política de Privacidade aplicável e
                                        as diretrizes internas da instituição de ensino. O acesso ao ambiente digital pressupõe uso
                                        responsável, ético e compatível com a finalidade educacional, administrativa e de comunicação
                                        institucional para a qual a plataforma foi desenvolvida.
                                    </p>
                                    <p>
                                        Caso o usuário não concorde com qualquer cláusula aqui prevista, não deverá prosseguir com o
                                        acesso ao sistema. A continuidade da utilização do portal será interpretada como manifestação
                                        livre, informada e inequívoca de concordância com as disposições deste documento.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        2. Finalidade do Portal e Limites de Uso
                                    </h3>
                                    <p>
                                        O PACE constitui ambiente institucional voltado à gestão acadêmica, comunicação entre usuários,
                                        disponibilização de materiais, acompanhamento escolar, abertura de chamados, reservas de espaços,
                                        registro de ocorrências operacionais e demais funcionalidades vinculadas à rotina pedagógica e
                                        administrativa.
                                    </p>
                                    <p>
                                        O uso da plataforma é estritamente restrito a usuários autorizados, incluindo alunos, professores,
                                        responsáveis, colaboradores e equipe gestora, conforme níveis de acesso definidos pela instituição.
                                        É vedado o compartilhamento de credenciais, a tentativa de acesso não autorizado, a manipulação
                                        indevida de dados ou qualquer utilização que extrapole a finalidade legítima do sistema.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        3. Coleta de Dados Pessoais e Base Legal (LGPD)
                                    </h3>
                                    <p>
                                        Nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o PACE poderá tratar
                                        dados pessoais necessários à execução de atividades educacionais, administrativas, legais e de
                                        segurança institucional. Isso pode incluir, entre outros, nome completo, matrícula, vínculo
                                        acadêmico, turma, e-mail, histórico de acessos, interações em módulos específicos e registros de
                                        operações efetuadas dentro da plataforma.
                                    </p>
                                    <p>
                                        O tratamento desses dados se fundamenta, conforme o caso, no cumprimento de obrigação legal ou
                                        regulatória, na execução de contrato ou procedimentos preliminares relacionados à prestação de
                                        serviços educacionais, na proteção do crédito, no exercício regular de direitos ou no legítimo
                                        interesse institucional, sempre observados os princípios da necessidade, adequação, finalidade e
                                        segurança.
                                    </p>
                                    <p>
                                        O usuário reconhece que determinadas informações são indispensáveis para o funcionamento do portal
                                        e para a prestação regular dos serviços escolares, razão pela qual a eventual recusa no fornecimento
                                        de dados essenciais poderá inviabilizar parcial ou integralmente o acesso a determinadas
                                        funcionalidades.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        4. Uso de Imagem, Voz, Conteúdo e Direitos Autorais
                                    </h3>
                                    <p>
                                        Em módulos, materiais, comunicados, aulas gravadas, arquivos enviados, formulários, eventos,
                                        comunicados multimídia ou interações mediadas pela plataforma, poderá haver circulação de conteúdos
                                        que envolvam imagem, voz, nome, produções intelectuais, materiais didáticos e outros elementos
                                        protegidos por direitos autorais, direitos de personalidade e normas institucionais.
                                    </p>
                                    <p>
                                        O usuário compromete-se a não reproduzir, distribuir, gravar, recortar, republicar, comercializar
                                        ou utilizar indevidamente qualquer conteúdo disponibilizado no PACE sem autorização expressa da
                                        instituição ou do respectivo titular de direitos. O uso acadêmico autorizado não implica cessão
                                        irrestrita de direitos, nem permissão para exploração pública, divulgação externa ou reaproveitamento
                                        fora do contexto educacional previsto.
                                    </p>
                                    <p>
                                        Havendo funcionalidades que envolvam vídeo, áudio, registro de presença, compartilhamento de mídias,
                                        projetos ou apresentações, o usuário declara ciência de que o ambiente digital poderá operar como
                                        meio oficial de registro e armazenamento institucional, respeitados os limites legais aplicáveis.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        5. Responsabilidade no Módulo de Achados e Perdidos
                                    </h3>
                                    <p>
                                        O módulo de Achados e Perdidos tem natureza estritamente colaborativa e informativa, servindo como
                                        canal de registro, comunicação e localização de objetos supostamente encontrados ou procurados dentro
                                        do ambiente escolar. A instituição não garante a recuperação do bem, nem assume responsabilidade por
                                        declarações falsas, descrições incorretas, omissões de informação ou disputas de propriedade entre
                                        usuários.
                                    </p>
                                    <p>
                                        O usuário que cadastrar item encontrado ou procurado deve agir com boa-fé, fornecer informações
                                        verdadeiras e evitar descrições enganosas. A entrega final do objeto, quando cabível, poderá estar
                                        sujeita a procedimentos internos de validação, conferência e identificação do legítimo possuidor.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        6. Responsabilidade no Uso da Central de Chamados e Reservas de Laboratórios
                                    </h3>
                                    <p>
                                        A utilização da Central de Chamados, da gestão de laboratórios, da reserva de salas e de demais
                                        módulos operacionais deve observar critérios de necessidade, veracidade e finalidade institucional.
                                        Todo chamado ou solicitação registrada poderá ser auditado, priorizado, recusado, reclassificado ou
                                        cancelado conforme regras internas, disponibilidade operacional, validação de permissões e interesse
                                        administrativo.
                                    </p>
                                    <p>
                                        Solicitações duplicadas, abusivas, falsas, ofensivas ou incompatíveis com a finalidade do sistema
                                        poderão ser indeferidas, registradas e, em casos graves, submetidas à apuração disciplinar. O envio
                                        de informações inverídicas sobre infraestrutura, manutenção, indisponibilidade de recursos ou ocupação
                                        de laboratórios poderá ensejar restrições de uso e responsabilização conforme o regulamento interno.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        7. Segurança da Conta e Conduta do Usuário
                                    </h3>
                                    <p>
                                        É responsabilidade exclusiva do usuário manter sigilo sobre seu e-mail, senha, códigos de acesso
                                        e demais credenciais vinculadas ao portal. O compartilhamento dessas informações com terceiros,
                                        mesmo que colegas, familiares ou pessoas próximas, é desaconselhado e poderá comprometer a segurança
                                        dos dados e a integridade dos registros acadêmicos e administrativos.
                                    </p>
                                    <p>
                                        O usuário compromete-se ainda a não praticar engenharia social, uso automatizado indevido, tentativa
                                        de fraude, exploração de vulnerabilidades, envio de arquivos maliciosos, alteração de registros,
                                        coleta indevida de dados ou qualquer conduta que possa afetar a disponibilidade, integridade,
                                        autenticidade ou confidencialidade da plataforma.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        8. Política de Retenção, Auditoria e Exclusão de Dados
                                    </h3>
                                    <p>
                                        Os dados tratados no PACE poderão ser mantidos pelo prazo necessário ao cumprimento de finalidades
                                        acadêmicas, administrativas, legais, regulatórias, de segurança e de preservação de histórico
                                        institucional. Isso inclui logs de acesso, registros de alterações, solicitações operacionais,
                                        interações com módulos internos e documentos vinculados à vida escolar do usuário.
                                    </p>
                                    <p>
                                        Mesmo em caso de encerramento de vínculo com a instituição, determinados dados poderão permanecer
                                        armazenados quando houver obrigação legal, necessidade de preservação de direitos, prevenção à fraude,
                                        atendimento a exigências de órgãos competentes ou manutenção de histórico acadêmico e administrativo.
                                    </p>
                                    <p>
                                        Quando aplicável e juridicamente possível, solicitações relacionadas a revisão, correção, anonimização,
                                        limitação ou eliminação de dados poderão ser analisadas pela instituição conforme a legislação vigente,
                                        observadas as hipóteses legais de retenção obrigatória e os limites técnicos do ambiente institucional.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        9. Atualizações, Monitoramento e Medidas Administrativas
                                    </h3>
                                    <p>
                                        A instituição poderá revisar, atualizar ou complementar estes Termos de Uso a qualquer tempo, visando
                                        adequação normativa, melhoria da segurança da informação, atualização de processos internos ou expansão
                                        funcional do portal. As versões atualizadas passarão a produzir efeitos a partir de sua disponibilização
                                        no ambiente institucional.
                                    </p>
                                    <p>
                                        O uso do sistema poderá ser monitorado para fins de segurança, suporte técnico, continuidade do serviço,
                                        prevenção a incidentes, auditoria interna e conformidade regulatória. Havendo indícios de uso indevido,
                                        a instituição poderá restringir acessos, suspender funcionalidades específicas ou adotar medidas
                                        administrativas cabíveis, sem prejuízo de eventual responsabilização civil, acadêmica ou legal.
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        10. Ciência e Concordância
                                    </h3>
                                    <p>
                                        Ao selecionar a opção de aceite e prosseguir com o acesso ao PACE, o usuário declara estar ciente de
                                        que leu este documento, compreendeu suas disposições e concorda em utilizar o portal de forma ética,
                                        segura, compatível com o ordenamento jurídico e alinhada às normas institucionais aplicáveis.
                                    </p>
                                </section>
                            </div>

                            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-gray-50/60 dark:bg-gray-800/50">
                                <button
                                    onClick={() => setIsTermosOpen(false)}
                                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => {
                                        setTermosAceitos(true)
                                        setIsTermosOpen(false)
                                    }}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]"
                                >
                                    Li e Aceito
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

            <style>{`
                @keyframes shake {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    )
}

export default SignInForm