import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import { appendMockUser, initialPasswordFromCpf } from '@/mock/data/authData'
import { ALUNO, COORDENACAO, DIRECAO, PROFESSOR } from '@/constants/roles.constant'

export type CargoUsuario = 'ALUNO' | 'PROFESSOR' | 'DIRECAO' | 'COORDENACAO'

export interface PasswordResetRequest {
  id: string
  matricula: string
  nome: string
  cargo: string
  senhaGerada: string
  status: 'PENDENTE' | 'ENTREGUE'
  createdAt: string
}

export interface Usuario {
  id: string
  nome: string
  matricula: string
  cpf: string
  email: string
  cargo: CargoUsuario
  turma?: string
  ativo: boolean
  dataCriacao: string
}

export type UsuarioDTO = Omit<Usuario, 'id' | 'dataCriacao'>

export type SalvarUsuarioResponse = {
  usuario: Usuario
  senhaGerada?: string
}

const USE_MOCK = appConfig.enableMock

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const CARGO_TO_AUTHORITY: Record<CargoUsuario, string> = {
  DIRECAO: DIRECAO,
  COORDENACAO: COORDENACAO,
  PROFESSOR: PROFESSOR,
  ALUNO: ALUNO,
}

let mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'Douglas Direção',
    matricula: 'DIR001',
    cpf: '12345678900',
    email: 'douglas.direcao@pace.edu.br',
    cargo: 'DIRECAO',
    turma: 'Todas',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: '6',
    nome: 'Carla Coordenação',
    matricula: 'COO001',
    cpf: '45678901234',
    email: 'carla.coord@pace.edu.br',
    cargo: 'COORDENACAO',
    turma: 'Todas',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'João Professor',
    matricula: 'PRF001',
    cpf: '78901234567',
    email: 'joao.professor@pace.edu.br',
    cargo: 'PROFESSOR',
    turma: 'Todas',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: '3',
    nome: 'Maria Aluna',
    matricula: 'ALN2024',
    cpf: '11122233344',
    email: 'maria.aluna@pace.edu.br',
    cargo: 'ALUNO',
    turma: '9º Ano A',
    ativo: false,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: '4',
    nome: 'Pedro Aluno',
    matricula: 'ALN2025',
    cpf: '22233344455',
    email: 'pedro.aluno@pace.edu.br',
    cargo: 'ALUNO',
    turma: '3º Ano B',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: '5',
    nome: 'Ana Aluna',
    matricula: 'ALN2026',
    cpf: '33344455566',
    email: 'ana.aluna@pace.edu.br',
    cargo: 'ALUNO',
    turma: 'Turma Única',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
]

function syncMockAuthUser(usuario: Usuario, senha: string, primeiroAcesso = true): void {
  appendMockUser({
    userId: usuario.id,
    userName: usuario.nome,
    email: usuario.email,
    matricula: usuario.matricula,
    cpf: usuario.cpf,
    password: senha,
    authority: [CARGO_TO_AUTHORITY[usuario.cargo]],
    active: usuario.ativo,
    primeiroAcesso,
    avatar: '',
    turma: usuario.turma ?? null,
  })
}

export const UsuariosService = {
  getUsuarios: async (): Promise<Usuario[]> => {
    if (USE_MOCK) {
      await simulateDelay(800)
      return [...mockUsuarios]
    }
    return await ApiService.fetchDataWithAxios<Usuario[]>({
      url: '/usuarios',
      method: 'GET',
    })
  },

  salvarUsuario: async (data: UsuarioDTO, id?: string): Promise<SalvarUsuarioResponse> => {
    if (USE_MOCK) {
      await simulateDelay(800)
      if (id) {
        const index = mockUsuarios.findIndex((u) => u.id === id)
        if (index === -1) throw new Error('Usuário não encontrado')
        mockUsuarios[index] = { ...mockUsuarios[index], ...data }
        return { usuario: mockUsuarios[index] }
      }

      const senhaGerada = initialPasswordFromCpf(data.cpf)
      const novoUsuario: Usuario = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        dataCriacao: new Date().toISOString(),
      }
      mockUsuarios = [novoUsuario, ...mockUsuarios]
      syncMockAuthUser(novoUsuario, senhaGerada, true)
      return { usuario: novoUsuario, senhaGerada }
    }

    const usuario = await ApiService.fetchDataWithAxios<Usuario, UsuarioDTO>({
      url: id ? `/usuarios/${id}` : '/usuarios',
      method: id ? 'PUT' : 'POST',
      data,
    })
    return { usuario }
  },

  alternarStatus: async (id: string, ativo: boolean): Promise<void> => {
    if (USE_MOCK) {
      await simulateDelay(500)
      const index = mockUsuarios.findIndex((u) => u.id === id)
      if (index > -1) {
        mockUsuarios[index].ativo = ativo
      }
      return
    }
    await ApiService.fetchDataWithAxios<void, { ativo: boolean }>({
      url: `/usuarios/${id}/status`,
      method: 'PATCH',
      data: { ativo },
    })
  },

  resetarSenha: async (id: string): Promise<string> => {
    if (USE_MOCK) {
      await simulateDelay(600)
      const usuario = mockUsuarios.find((u) => u.id === id)
      if (!usuario) throw new Error('Usuário não encontrado')
      const senha = initialPasswordFromCpf(usuario.cpf)
      syncMockAuthUser(usuario, senha, true)
      return senha
    }
    const response = await ApiService.fetchDataWithAxios<{ senha: string }, void>({
      url: `/usuarios/${id}/resetar-senha`,
      method: 'POST',
    })
    return response.senha
  },

  getPendingPasswordResets: async (): Promise<PasswordResetRequest[]> => {
    if (USE_MOCK) {
      await simulateDelay(500)
      return []
    }
    return await ApiService.fetchDataWithAxios<PasswordResetRequest[]>({
      url: '/auth/esqueci-senha/solicitacoes',
      method: 'GET',
    })
  },

  finalizePasswordReset: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await simulateDelay(300)
      return
    }
    await ApiService.fetchDataWithAxios<void>({
      url: `/auth/esqueci-senha/${id}/entregue`,
      method: 'POST',
    })
  },

  importarCSV: async (file: File): Promise<{ sucesso: number; erros: number }> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          const lines = text.split('\n').filter((line) => line.trim() !== '')

          let inseridos = 0
          const cargosValidos: CargoUsuario[] = ['ALUNO', 'PROFESSOR', 'DIRECAO', 'COORDENACAO']

          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.trim())
            const [nome, matricula, email, cpf, cargoRaw, turmaRaw] = parts
            if (nome && matricula && email && cpf) {
              const cargoUpper = (cargoRaw?.toUpperCase() || 'ALUNO') as CargoUsuario
              const cargo = cargosValidos.includes(cargoUpper) ? cargoUpper : 'ALUNO'
              const turma = cargo === 'ALUNO' ? turmaRaw || 'Turma Única' : turmaRaw || 'Todas'
              const senhaGerada = initialPasswordFromCpf(cpf)

              const novoUsuario: Usuario = {
                id: Math.random().toString(36).substring(2, 10),
                nome: nome.trim(),
                matricula: matricula.trim(),
                email: email.trim().toLowerCase(),
                cpf: cpf.replace(/\D/g, ''),
                cargo,
                turma,
                ativo: true,
                dataCriacao: new Date().toISOString(),
              }
              mockUsuarios.unshift(novoUsuario)
              syncMockAuthUser(novoUsuario, senhaGerada, true)
              inseridos++
            }
          }
          setTimeout(() => {
            resolve({ sucesso: inseridos, erros: lines.length - 1 - inseridos })
          }, 1500)
        }
        reader.readAsText(file)
      })
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await ApiService.fetchDataWithAxios<{ sucesso: number; erros: number }>({
      url: '/usuarios/importar-csv',
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response as any).data || response
  },
}
