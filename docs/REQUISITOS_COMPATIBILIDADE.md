# Requisitos de Compatibilidade — PACE

**Portal de Apoio e Comunicação Escolar (PACE)**  
Versão do documento: **1.0.0**  
Versão da aplicação: **1.3.0**  
Última atualização: **julho/2026**

Este documento define os requisitos mínimos e recomendados para uso do PACE em navegadores, dispositivos móveis e desktops. Ele serve como referência para equipes de TI, suporte, QA e comunicação institucional.

---

## 1. Resoluções suportadas

O PACE é uma aplicação web responsiva, projetada prioritariamente para **smartphones** e também utilizável em tablets e desktops.

| Classificação | Largura mínima | Largura máxima testada | Observação |
|---|---|---|---|
| **Mínima suportada** | 320 px | — | iPhone SE e equivalentes |
| **Mobile (foco principal)** | 320 px – 767 px | — | Layout otimizado para uso com uma mão |
| **Tablet** | 768 px – 1023 px | — | Navegação adaptada; algumas tabelas usam scroll horizontal |
| **Desktop** | 1024 px+ | 2560 px | Painéis administrativos com mais colunas |
| **Ultra-wide** | 1536 px+ | — | Conteúdo centralizado; sem layout exclusivo |

**Altura mínima recomendada:** 568 px (retrato). Telas menores podem exigir scroll vertical adicional em modais e formulários.

**Densidade de pixels:** suporte a telas Retina/HiDPI (1x, 2x, 3x). Ícones e imagens são dimensionados de forma fluida.

---

## 2. Breakpoints responsivos

O PACE utiliza **Tailwind CSS v4** com os breakpoints definidos em `tailwind.config.cjs`:

| Token | Largura mínima | Uso típico no PACE |
|---|---|---|
| *(base)* | 0 px | Mobile first — layout principal, botões touch (min. 44–48 px) |
| `xs` | 576 px | Ajustes intermediários em formulários e cards |
| `sm` | 640 px | Modais de tela cheia → modais centralizados; grids em 2 colunas |
| `md` | 768 px | Sidebar visível; tabelas administrativas; padding ampliado |
| `lg` | 1024 px | Layout pós-login com menu lateral; calendário desktop |
| `xl` | 1280 px | Painéis de gestão com mais área útil |
| `2xl` | 1536 px | Conteúdo máximo centralizado |

**Unidades especiais usadas no código:**

- `100dvh` — altura dinâmica da viewport (barra de endereço mobile)
- `touch-manipulation` — otimização de toque em botões críticos
- `text-[16px]` em inputs mobile — evita zoom automático no iOS Safari

---

## 3. Sistemas operacionais móveis

### Android mínimo

| Requisito | Versão |
|---|---|
| **Versão mínima suportada** | Android **8.0 (Oreo)** — API 26 |
| **Versão recomendada** | Android **12+** |
| **Navegador recomendado** | Google Chrome (últimas 2 versões) ou Samsung Internet (últimas 2 versões) |

### iOS / iPadOS mínimo

| Requisito | Versão |
|---|---|
| **Versão mínima suportada** | iOS / iPadOS **15.4** |
| **Versão recomendada** | iOS / iPadOS **17+** |
| **Navegador recomendado** | Safari (últimas 2 versões) |

> **Nota:** O PACE não possui aplicativo nativo (APK/IPA). O acesso em dispositivos móveis é exclusivamente via navegador web.

---

## 4. Navegadores suportados (desktop e mobile)

Suporte oficial limitado aos **dois últimos major releases** de cada navegador, com JavaScript habilitado.

| Navegador | Desktop | Mobile | Status |
|---|---|---|---|
| Google Chrome | ✅ | ✅ | Totalmente suportado |
| Mozilla Firefox | ✅ | ✅ | Totalmente suportado |
| Microsoft Edge (Chromium) | ✅ | ✅ | Totalmente suportado |
| Safari (macOS) | ✅ | — | Totalmente suportado |
| Safari (iOS/iPadOS) | — | ✅ | Totalmente suportado |
| Samsung Internet | — | ✅ | Suportado |
| Opera (Chromium) | ⚠️ | ⚠️ | Suporte best-effort |
| Internet Explorer 11 | ❌ | ❌ | **Não suportado** |
| Navegadores in-app (WebView genérico) | ⚠️ | ⚠️ | Pode funcionar; não testado oficialmente |

**Stack técnica que define compatibilidade:**

- React 19 + Vite 6 (ES Modules nativos)
- CSS moderno: Flexbox, Grid, Custom Properties, `backdrop-filter`
- APIs: `fetch` (via Axios), `localStorage`, `sessionStorage`

---

## 5. Orientação da tela

| Orientação | Suporte | Comportamento |
|---|---|---|
| **Retrato (portrait)** | ✅ Principal | Layout otimizado; experiência recomendada em smartphones |
| **Paisagem (landscape)** | ✅ Suportado | Conteúdo adaptável; modais e teclado virtual podem reduzir área útil |
| **Rotação dinâmica** | ✅ | Layout recalcula via media queries; sem recarregamento obrigatório |

Em telas muito baixas em paisagem (< 400 px de altura), modais e formulários longos podem exigir scroll.

---

## 6. Acessibilidade

**Meta de conformidade:** boas práticas alinhadas à **WCAG 2.1 nível AA** (objetivo progressivo; conformidade total não garantida em todas as telas).

| Recurso | Status no PACE |
|---|---|
| Contraste de cores (tema claro/escuro) | ✅ Suportado |
| Redimensionamento de texto (até 200%) | ✅ Layout fluido |
| Navegação por teclado (desktop) | ⚠️ Parcial — formulários e botões principais |
| Leitores de tela (ARIA) | ⚠️ Parcial — alguns componentes com `aria-label` |
| Foco visível | ✅ Via Tailwind `focus:ring` |
| Áreas de toque mínimas (mobile) | ✅ Alvo mínimo ~44–48 px nos módulos críticos |
| Animações (`framer-motion`) | ⚠️ Respeita preferência do SO quando aplicável |
| Idioma da página | `lang` configurável; locale padrão **pt-BR** |

**Limitações conhecidas:**

- Tabelas administrativas densas podem ser difíceis de navegar com leitor de tela.
- Alguns gráficos e calendários interativos dependem primariamente de interação visual.
- Upload de imagens no módulo Achados e Perdidos exige interação visual.

Solicitações de acessibilidade devem ser encaminhadas à Secretaria ou ao Encarregado de Dados (DPO).

---

## 7. Requisitos de internet

| Requisito | Especificação |
|---|---|
| **Conexão** | Obrigatória — aplicação **online-first** |
| **Modo offline** | ❌ Não suportado (sem PWA / Service Worker) |
| **Largura de banda mínima** | 1 Mbps (recomendado: 5 Mbps+) |
| **Latência recomendada** | < 300 ms para API |
| **Protocolo** | HTTPS em produção (obrigatório) |
| **API** | Prefixo `/api` — autenticação, CRUD e comunicação em tempo real simulada via mock em ambiente demo |

**Comportamento sem conexão:**

- Login, navegação autenticada e envio de formulários **falham** sem rede.
- Mensagens de erro genéricas podem ser exibidas; não há fila de sincronização offline.

**Consumo estimado de dados (por sessão típica de 30 min):**

- Navegação leve (comunicados, calendário): ~5–15 MB
- Upload de imagens (Achados e Perdidos): + tamanho do arquivo (máx. conforme política do módulo)

---

## 8. Requisitos de hardware

### Smartphones (uso principal)

| Componente | Mínimo | Recomendado |
|---|---|---|
| RAM | 2 GB | 4 GB+ |
| Processador | Quad-core 1,4 GHz | Octa-core 2,0 GHz+ |
| Armazenamento livre | 100 MB (cache do navegador) | 500 MB+ |
| Câmera | Opcional | Necessária apenas para upload no Achados e Perdidos |

### Tablets

| Componente | Mínimo | Recomendado |
|---|---|---|
| RAM | 2 GB | 4 GB+ |
| Tela | 768 px de largura | 10" ou superior |

### Desktops / notebooks (gestão)

| Componente | Mínimo | Recomendado |
|---|---|---|
| RAM | 4 GB | 8 GB+ |
| Resolução | 1024 × 768 | 1920 × 1080 |
| Periféricos | Teclado + mouse | — |

---

## 9. Funcionalidades não suportadas

| Funcionalidade | Status |
|---|---|
| Aplicativo nativo (Android/iOS) | ❌ Não disponível |
| Modo offline / sincronização em background | ❌ |
| Internet Explorer 11 e navegadores legacy | ❌ |
| Impressão otimizada de todas as telas | ⚠️ Parcial (`print:hidden` em menus) |
| Notificações push nativas | ❌ |
| Biometria nativa (Face ID / impressão digital via app) | ❌ |
| Acesso sem JavaScript | ❌ |
| Navegação anônima com persistência de sessão | ⚠️ Limitada — `localStorage` pode ser bloqueado |
| Múltiplas abas com edição simultânea do mesmo registro | ⚠️ Sem controle de concorrência |
| Exportação em massa de todos os módulos | ⚠️ Apenas onde explicitamente disponível (ex.: CSV de usuários) |
| Integração com leitores de tela em gráficos ApexCharts | ⚠️ Limitada |

---

## 10. Tecnologias obrigatórias no cliente

O PACE **não funciona** sem os recursos abaixo habilitados no navegador:

| Tecnologia | Obrigatório | Finalidade no PACE |
|---|---|---|
| **JavaScript (ES2020+)** | ✅ Sim | Renderização React, roteamento, formulários, validação |
| **Cookies** | ⚠️ Condicional | Usado se `accessTokenPersistStrategy = 'cookies'` (padrão atual: `localStorage`) |
| **localStorage** | ✅ Sim (padrão) | Token de autenticação, aceite de termos (`pace_termos_aceitos`), dados mock demo |
| **sessionStorage** | ⚠️ Alternativa | Estratégia opcional de persistência de token |
| **CSS Flexbox / Grid** | ✅ Sim | Layout responsivo |
| **Fetch / XMLHttpRequest** | ✅ Sim | Comunicação com API (Axios) |
| **File API** | ⚠️ Condicional | Upload de imagens e CSV |
| **Intl / Date** | ✅ Sim | Formatação de datas (Day.js) |

**Bloqueadores de conteúdo:** extensões que bloqueiam `localStorage`, scripts ou requisições à API podem impedir login e persistência de sessão.

---

## 11. Limites do suporte oficial

O suporte técnico institucional cobre exclusivamente ambientes que atendam a **todos** os critérios abaixo:

1. Navegador da lista de suportados, atualizado, com JavaScript habilitado.
2. Dispositivo dentro dos requisitos mínimos de hardware e SO.
3. Conexão estável à internet (HTTPS).
4. Resolução ≥ 320 px de largura.
5. Uso em orientação retrato ou paisagem dentro dos limites descritos.

**Fora do escopo de suporte:**

- Dispositivos ou navegadores não listados neste documento.
- Modificações no navegador (flags experimentais, ROM customizada, jailbreak).
- Problemas causados por VPN, proxy ou firewall que bloqueie `/api`.
- Performance em redes 2G ou satelital instável.
- Incompatibilidade por bloqueio de `localStorage` (modo estrito de privacidade).

**SLA de correção (referência interna):**

| Severidade | Exemplo | Prazo alvo |
|---|---|---|
| Crítica | Impossibilidade de login em ambiente suportado | 24 h úteis |
| Alta | Módulo principal inacessível no mobile | 3 dias úteis |
| Média | Layout quebrado em resolução suportada | 10 dias úteis |
| Baixa | Ajuste visual menor | Próximo ciclo de release |

---

## 12. Matriz rápida de referência

```
✅ Resoluções suportadas     → 320 px – 2560 px (mobile first)
✅ Breakpoints               → xs 576 | sm 640 | md 768 | lg 1024 | xl 1280 | 2xl 1536
✅ Android mínimo            → 8.0 (Oreo) — recomendado 12+
✅ iOS mínimo                → 15.4 — recomendado 17+
✅ Navegadores               → Chrome, Firefox, Edge, Safari (2 últimas versões)
✅ Orientação                → Retrato (principal) e paisagem (suportada)
✅ Acessibilidade            → WCAG 2.1 AA (meta progressiva)
✅ Internet                  → Obrigatória; mín. ~1 Mbps; sem offline
✅ Hardware mobile           → 2 GB RAM, quad-core 1,4 GHz
✅ Não suportado             → IE11, offline, app nativo, JS desabilitado
✅ Tecnologias obrigatórias  → JavaScript, localStorage, CSS moderno
✅ Limites do suporte        → Ambientes fora desta matriz = best-effort
```

---

## 13. Histórico de revisões

| Versão | Data | Alteração |
|---|---|---|
| 1.0.0 | jul/2026 | Documento inicial com base na stack PACE v1.3.0 |

---

## 14. Referências técnicas do repositório

- Breakpoints: `tailwind.config.cjs`
- Persistência de sessão: `src/configs/app.config.ts` (`accessTokenPersistStrategy`)
- Viewport: `index.html` (`width=device-width, initial-scale=1.0`)
- Build: Vite 6 + React 19 + TypeScript 5.7
