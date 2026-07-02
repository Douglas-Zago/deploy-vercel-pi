export const TERMOS_VERSAO = '3.0.0'

export const TERMOS_DATA_ATUALIZACAO = '01 de julho de 2026'

export type TermoSecao = {
    titulo: string
    paragrafos: string[]
}

export const TERMOS_DE_USO_SECOES: TermoSecao[] = [
    {
        titulo: '1. Sobre o Projeto e Aceitação dos Termos',
        paragrafos: [
            'O PACE (Portal de Apoio e Comunicação Escolar) é um sistema web desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas, com finalidade acadêmica e demonstração de soluções para o ambiente escolar.',
            'Ao acessar o portal, o usuário declara ter lido e aceito estes Termos de Uso e a Política de Privacidade aqui descrita. O uso pressupõe conduta responsável, compatível com a finalidade educacional e institucional do projeto.',
            'Caso não concorde com qualquer disposição, o usuário não deverá prosseguir com o login. O aceite no momento do acesso registra a concordância com a versão vigente deste documento.',
        ],
    },
    {
        titulo: '2. Finalidade do Portal',
        paragrafos: [
            'O PACE centraliza funcionalidades voltadas à rotina escolar: painel inicial, mural de comunicados, agenda, calendário, central de materiais, achados e perdidos, informações institucionais, chamados, reservas de laboratórios e módulos de gestão para perfis autorizados.',
            'O sistema foi concebido para apoiar a comunicação e a organização escolar em contexto acadêmico. Em ambiente de demonstração, parte dos dados e integrações pode operar com recursos simulados (mock), sem caracterizar um serviço comercial em produção.',
        ],
    },
    {
        titulo: '3. Cadastro, Perfis de Acesso e Controle de Permissões',
        paragrafos: [
            'O cadastro de usuários é realizado pela gestão institucional simulada no sistema. Não há auto-cadastro público. Cada usuário recebe credenciais iniciais e pode ser solicitado a alterar a senha no primeiro acesso.',
            'O acesso às funcionalidades é controlado por perfis (Direção, Coordenação, Professor e Aluno), com restrições aplicadas nas rotas e no menu conforme o papel do usuário autenticado. Tentativas de acessar áreas não autorizadas são bloqueadas pelo sistema.',
            'É vedado compartilhar credenciais, acessar o sistema em nome de terceiros ou tentar burlar as permissões definidas para cada perfil.',
        ],
    },
    {
        titulo: '4. Proteção de Dados Pessoais (LGPD)',
        paragrafos: [
            'Em alinhamento com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o PACE trata apenas os dados necessários ao funcionamento do portal, como nome, matrícula, e-mail, CPF, turma, cargo e informações inseridas nos módulos (comunicados, chamados, reservas, materiais, entre outros).',
            'O tratamento tem finalidade educacional e institucional, vinculada à demonstração do sistema no contexto do TCC. Os dados não são comercializados. Em ambiente acadêmico, o armazenamento pode ocorrer localmente no navegador (localStorage) para fins de simulação e persistência de sessão.',
            'No módulo Achados e Perdidos, o envio de imagens exige aceite expresso do usuário quanto ao uso da foto para identificação do objeto, observando o princípio de minimização de dados pessoais.',
        ],
    },
    {
        titulo: '5. Direitos do Titular de Dados',
        paragrafos: [
            'O titular dos dados pode, nos termos da LGPD, solicitar informações sobre o tratamento realizado, correção de dados inexatos ou desatualizados e, quando aplicável, a exclusão de informações desnecessárias.',
            'Em contexto acadêmico, pedidos relacionados a dados tratados no PACE devem ser encaminhados à equipe responsável pelo projeto ou à Secretaria da instituição parceira da demonstração, que analisará a solicitação conforme a legislação vigente e as limitações técnicas do protótipo.',
        ],
    },
    {
        titulo: '6. Segurança de Senhas e Credenciais',
        paragrafos: [
            'O usuário é responsável por manter em sigilo seu e-mail e senha. O compartilhamento de credenciais é proibido e pode resultar em bloqueio de acesso no ambiente de demonstração.',
            'A recuperação de senha solicita o e-mail institucional e, por medida de segurança, não informa se o endereço está ou não cadastrado, evitando que terceiros descubram contas válidas.',
            'O sistema pode exigir troca de senha no primeiro acesso. Senhas devem ser pessoais e não reutilizadas em outros serviços.',
        ],
    },
    {
        titulo: '7. Responsabilidade do Usuário',
        paragrafos: [
            'O usuário compromete-se a utilizar o PACE de forma ética, fornecendo informações verídicas nos formulários e respeitando os demais membros da comunidade escolar simulada.',
            'É proibido tentar acessar áreas restritas, explorar falhas de segurança, enviar conteúdo ofensivo ou utilizar o sistema para finalidades alheias ao contexto educacional do projeto.',
            'Conteúdos publicados em comunicados, materiais e demais módulos devem respeitar direitos autorais e a privacidade de terceiros. O uso indevido de imagens, documentos ou informações de outros usuários é de responsabilidade de quem o praticar.',
        ],
    },
    {
        titulo: '8. Uso de Conteúdo e Imagem',
        paragrafos: [
            'Materiais didáticos, comunicados e arquivos disponibilizados no portal destinam-se ao uso no contexto escolar demonstrado pelo projeto. Não é permitida a reprodução ou divulgação externa sem autorização dos respectivos titulares.',
            'No Achados e Perdidos, as imagens enviadas devem mostrar apenas o objeto em questão, evitando exposição desnecessária de pessoas ou dados pessoais identificáveis.',
        ],
    },
    {
        titulo: '9. Cookies, Sessão e Armazenamento Local',
        paragrafos: [
            'O PACE utiliza recursos do navegador para funcionar corretamente: JavaScript para a interface, localStorage para manter a sessão autenticada, o aceite destes termos e, em ambiente de demonstração, dados simulados da aplicação.',
            'Cookies podem ser utilizados conforme a configuração de persistência do sistema. O bloqueio de JavaScript, cookies ou localStorage pelo navegador pode impedir o login e o uso do portal.',
            'O usuário pode limpar os dados do navegador a qualquer momento, ciente de que isso encerrará a sessão ativa e poderá exigir novo aceite dos termos.',
        ],
    },
    {
        titulo: '10. Compatibilidade e Requisitos Técnicos',
        paragrafos: [
            'O PACE foi desenvolvido com abordagem Mobile First, priorizando a experiência em smartphones e adaptando o layout para tablets e desktops.',
            'Faixas de resolução consideradas no projeto: celulares entre 360 px e 430 px de largura; tablets entre 768 px e 1024 px; desktops com resolução mínima de 1280 × 720 px e recomendada até 1920 × 1080 px.',
            'Sistemas operacionais móveis suportados: Android 10 ou superior e iOS 15 ou superior. Navegadores suportados: Google Chrome, Microsoft Edge, Mozilla Firefox e Apple Safari, nas duas versões estáveis mais recentes de cada um.',
            'É obrigatório ter JavaScript habilitado, bem como cookies e localStorage permitidos pelo navegador. Não há garantia de funcionamento em navegadores obsoletos, incluindo Internet Explorer.',
        ],
    },
    {
        titulo: '11. Limitações do Sistema',
        paragrafos: [
            'O PACE possui finalidade acadêmica e institucional, desenvolvido para apresentação e avaliação do TCC. Não constitui produto comercial nem serviço com suporte contínuo em nível de produção.',
            'Algumas funcionalidades podem ser aprimoradas em versões futuras do projeto, incluindo integrações reais com serviços de e-mail, banco de dados em servidor e monitoramento avançado.',
            'O funcionamento depende da infraestrutura de hospedagem utilizada na demonstração, da qualidade da conexão à internet e do dispositivo do usuário. Não há garantia de desempenho em aparelhos muito antigos ou fora dos requisitos técnicos descritos neste documento.',
            'Em ambiente de TCC, dados e operações podem ser simulados. Comportamentos observados na demonstração não representam necessariamente processos definitivos de uma instituição de ensino em operação real.',
        ],
    },
    {
        titulo: '12. Atualizações deste Documento',
        paragrafos: [
            'Esta versão {VERSAO} foi publicada em {DATA}. O documento pode ser revisado ao longo do desenvolvimento do projeto para refletir novas funcionalidades, ajustes técnicos ou adequações solicitadas na avaliação acadêmica.',
            'Alterações relevantes poderão exigir novo aceite no login. Recomenda-se consultar periodicamente a versão vigente antes de utilizar o portal.',
        ],
    },
    {
        titulo: '13. Ciência e Concordância',
        paragrafos: [
            'Ao marcar a opção de aceite e acessar o PACE, o usuário declara ter lido este documento, compreendido as regras de uso, as práticas de proteção de dados e os requisitos técnicos do sistema.',
            'O usuário concorda em utilizar o portal de forma responsável, respeitando os perfis de acesso, a privacidade dos demais usuários e o caráter acadêmico do projeto.',
        ],
    },
]

export const TERMOS_TITULO = 'Termos de Uso e Política de Privacidade'

export const TERMOS_SUBTITULO = 'PACE — Projeto Acadêmico (TCC em ADS)'

export const getTermosParagrafosRenderizados = (secao: TermoSecao): string[] =>
    secao.paragrafos.map((paragrafo) =>
        paragrafo.replace('{VERSAO}', TERMOS_VERSAO).replace('{DATA}', TERMOS_DATA_ATUALIZACAO),
    )
