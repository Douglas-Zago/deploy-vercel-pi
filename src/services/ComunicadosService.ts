import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { Comunicado, ComunicadoRequest } from '@/@types/portal'

export type { Comunicado } from '@/@types/portal'

export let comunicadosMock: Comunicado[] = [
    {
        id: 1,
        titulo: 'Reunião de Pais e Mestres - 1º Bimestre',
        conteudo:
            'Convocamos todos os responsáveis para a reunião de alinhamento do primeiro bimestre. O comparecimento é fundamental para o acompanhamento do aluno. Discutiremos o desempenho acadêmico, calendário de avaliações e novos projetos da escola. Não faltem.',
        autor: 'Direção Acadêmica',
        dataPublicacao: '2026-04-10T14:30:00.000Z',
        publicoAlvo: 'Colégio Todo',
        ativo: true,
        autorId: null,
    },
    {
        id: 2,
        titulo: 'Manutenção do Laboratório de TI',
        conteudo:
            'O laboratório de TI 01 estará fechado para manutenção preventiva dos computadores nesta sexta-feira. Atualizaremos as licenças dos softwares e faremos limpeza física das máquinas. Utilizem o Laboratório 02 provisoriamente.',
        autor: 'Equipe de Infraestrutura',
        dataPublicacao: '2026-04-05T09:15:00.000Z',
        publicoAlvo: 'Professores',
        ativo: true,
        autorId: null,
    },
    {
        id: 3,
        titulo: 'Abertura das Inscrições para a Feira de Ciências',
        conteudo:
            'Alunos interessados em participar da Feira de Ciências devem procurar seus professores orientadores até o final do mês. Os projetos vencedores receberão bolsas de incentivo à pesquisa científica.',
        autor: 'Coordenação de Ciências',
        dataPublicacao: '2026-04-02T18:45:00.000Z',
        publicoAlvo: '9º Ano A',
        ativo: true,
        autorId: null,
    },
]

const USE_MOCK = appConfig.enableMock

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const ComunicadosService = {
    getAll: async (): Promise<Comunicado[]> => {
        if (USE_MOCK) {
            await delay(800)
            return [...comunicadosMock]
        }

        return ApiService.fetchDataWithAxios<Comunicado[]>({
            url: '/comunicados',
            method: 'get',
        })
    },

    create: async (novoComunicado: ComunicadoRequest & { autor?: string; dataPublicacao?: string }): Promise<Comunicado> => {
        if (USE_MOCK) {
            await delay(800)
            const comunicadoCriado: Comunicado = {
                id: Math.max(0, ...comunicadosMock.map((c) => c.id)) + 1,
                titulo: novoComunicado.titulo,
                conteudo: novoComunicado.conteudo,
                autor: novoComunicado.autor ?? null,
                dataPublicacao: novoComunicado.dataPublicacao ?? new Date().toISOString(),
                publicoAlvo: novoComunicado.publicoAlvo ?? null,
                ativo: true,
                autorId: null,
            }
            comunicadosMock.unshift(comunicadoCriado)
            return comunicadoCriado
        }

        return ApiService.fetchDataWithAxios<Comunicado>({
            url: '/comunicados',
            method: 'post',
            data: novoComunicado,
        })
    },
}
