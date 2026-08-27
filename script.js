// Variáveis globais
let automacaoAtual = null;
let automacaoAtualProcesso = null; // Nova variável para controlar o processo
let progressInterval = null;
let isProcessing = false;

// URL do projeto do Supabase (Project Settings > API > Project URL)
const SUPABASE_URL = 'https://ntmupvlfezywrqncifvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YNWMOMvYtKaPMwmNxXlP5w_4SMftiXC';
const SUPABASE_TABLE_CANDIDATES = ['Sessions', 'sessions'];
const SUPABASE_FIELD_CANDIDATES = {
    solicit: ['Solicit', 'solicit'],
    status: ['Status', 'status'],
    code: ['Code', 'code']
};

async function supabaseRequest(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
        ...options,
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Supabase error ${response.status}: ${text}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

async function supabaseTableRequest(query = '', options = {}) {
    let lastError = null;

    for (const tableName of SUPABASE_TABLE_CANDIDATES) {
        try {
            return await supabaseRequest(`/rest/v1/${tableName}${query}`, options);
        } catch (error) {
            const message = String(error.message || error);
            if (!message.includes('PGRST205') && !message.includes('Could not find the table')) {
                throw error;
            }
            lastError = error;
        }
    }

    throw lastError || new Error('Não foi possível acessar a tabela do Supabase.');
}

async function supabaseTableSelect(fieldName, fieldValue) {
    let lastError = null;

    for (const tableName of SUPABASE_TABLE_CANDIDATES) {
        for (const candidateField of SUPABASE_FIELD_CANDIDATES[fieldName] || [fieldName]) {
            try {
                const query = `?select=*&${candidateField}=eq.${encodeURIComponent(fieldValue)}&order=id.desc&limit=1`;
                return await supabaseRequest(`/rest/v1/${tableName}${query}`);
            } catch (error) {
                const message = String(error.message || error);
                if (!message.includes('42703') && !message.includes('column') && !message.includes('does not exist')) {
                    throw error;
                }
                lastError = error;
            }
        }
    }

    throw lastError || new Error('Não foi possível consultar o registro no Supabase.');
}

async function supabaseTableInsert(payload) {
    let lastError = null;

    for (const tableName of SUPABASE_TABLE_CANDIDATES) {
        for (const [fieldName, fieldValue] of Object.entries(payload)) {
            // tentamos primeiro com o nome original em caixa, depois em minúsculas
        }

        const payloadVariants = [
            payload,
            {
                status: payload.status ?? payload.Status,
                solicit: payload.solicit ?? payload.Solicit,
                code: payload.code ?? payload.Code
            }
        ].filter((value, index, self) => self.findIndex(item => JSON.stringify(item) === JSON.stringify(value)) === index);

        for (const candidatePayload of payloadVariants) {
            try {
                return await supabaseRequest(`/rest/v1/${tableName}`, {
                    method: 'POST',
                    headers: {
                        Prefer: 'return=representation'
                    },
                    body: JSON.stringify(candidatePayload)
                });
            } catch (error) {
                const message = String(error.message || error);
                if (!message.includes('42703') && !message.includes('column') && !message.includes('does not exist')) {
                    throw error;
                }
                lastError = error;
            }
        }
    }

    throw lastError || new Error('Não foi possível gravar no Supabase.');
}

async function supabaseTableUpsertBySolicit(payload) {
    const solicit = payload.Solicit ?? payload.solicit;
    if (!solicit) {
        throw new Error('Solicit é obrigatório para gravar no Supabase.');
    }

    const statusValue = payload.Status ?? payload.status ?? 'Solicitado';
    const codeValue = payload.Code ?? payload.code ?? '000000';
    let lastError = null;

    for (const tableName of SUPABASE_TABLE_CANDIDATES) {
        for (const candidateField of ['Solicit', 'solicit']) {
            try {
                const existingRows = await supabaseRequest(
                    `/rest/v1/${tableName}?select=*&${candidateField}=eq.${encodeURIComponent(solicit)}&order=id.desc&limit=1`
                );

                if (!Array.isArray(existingRows) || existingRows.length === 0) {
                    return await supabaseTableInsert({
                        ...payload,
                        Status: statusValue,
                        Solicit: solicit,
                        Code: codeValue
                    });
                }

                const updatePayload = {
                    Status: statusValue,
                    status: statusValue,
                    Code: codeValue,
                    code: codeValue
                };

                return await supabaseRequest(
                    `/rest/v1/${tableName}?${candidateField}=eq.${encodeURIComponent(solicit)}`,
                    {
                        method: 'PATCH',
                        headers: {
                            Prefer: 'return=representation'
                        },
                        body: JSON.stringify(updatePayload)
                    }
                );
            } catch (error) {
                const message = String(error.message || error);
                if (!message.includes('42703') && !message.includes('column') && !message.includes('does not exist')) {
                    throw error;
                }
                lastError = error;
            }
        }
    }

    throw lastError || new Error('Não foi possível garantir o registro no Supabase.');
}

// Dados das automações
const automacoes = {
    relatorios: {
        nome: "Relatórios Automatizados",
        descricao: "Sistema de geração automática de relatórios",
        tempoEstimado: 3000,
        icone: "fas fa-chart-line"
    },
    dashboard: {
        nome: "Dashboard de Performance",
        descricao: "Monitoramento de KPIs em tempo real",
        tempoEstimado: 2500,
        icone: "fas fa-tachometer-alt"
    },
    consolidado: {
        nome: "Consolidar - Qualidade de pedidos da Inspeção",
        descricao: "Consolidação de dados de qualidade de pedidos para análise completa",
        tempoEstimado: 3500,
        icone: "fas fa-file-contract"
    },
    analise: {
        nome: "Análise de Dados Inteligente",
        descricao: "Processamento de dados com IA",
        tempoEstimado: 4000,
        icone: "fas fa-brain"
    },
    qualidade: {
        nome: "Controle de Qualidade",
        descricao: "Verificação automática de qualidade",
        tempoEstimado: 3500,
        icone: "fas fa-shield-alt"
    },
    inventario: {
        nome: "Gestão de Inventário",
        descricao: "Controle inteligente de estoque",
        tempoEstimado: 2800,
        icone: "fas fa-boxes"
    },
    monitoramento: {
        nome: "Monitoramento em Tempo Real",
        descricao: "Vigilância contínua dos sistemas",
        tempoEstimado: 2000,
        icone: "fas fa-eye"
    },
    alertas: {
        nome: "Alertas Inteligentes",
        descricao: "Sistema de notificações proativo",
        tempoEstimado: 1800,
        icone: "fas fa-bell"
    },
    otimizacao: {
        nome: "Otimização de Processos",
        descricao: "Melhoria contínua da eficiência",
        tempoEstimado: 4500,
        icone: "fas fa-rocket"
    }
};

// Função para buscar código do relatório no Supabase
async function buscarCodigoRelatorio() {
    const refreshBtn = document.querySelector('.refresh-code-btn');
    const codigoInput = document.getElementById('relatorio-codigo');
    
    if (!refreshBtn || !codigoInput) return;
    
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    codigoInput.value = '';
    
    try {
        const rows = await supabaseTableSelect('solicit', 'QP_input');

        const codigo = rows && rows.length ? (rows[0].Code ?? rows[0].code ?? '000000') : '000000';
        codigoInput.value = codigo || '000000';
        criarNotificacao('Código do relatório atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao buscar código do Supabase:', error);
        codigoInput.value = '000000';
        criarNotificacao('Erro ao buscar código: ' + error.message, 'error');
    } finally {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

// Função para buscar código do relatório da Inspeção no Supabase
async function buscarCodigoRelatorioInspecao() {
    const refreshBtn = document.querySelector('#relatorio-codigo-inspecao').nextElementSibling;
    const codigoInput = document.getElementById('relatorio-codigo-inspecao');
    
    if (!refreshBtn || !codigoInput) return;
    
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    codigoInput.value = '';
    
    try {
        const rows = await supabaseTableSelect('solicit', 'QP_Inspecao');

        const codigo = rows && rows.length ? (rows[0].Code ?? rows[0].code ?? '000000') : '000000';
        codigoInput.value = codigo || '000000';
        criarNotificacao('Código QP_Inspecao atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao buscar código QP_Inspecao:', error);
        codigoInput.value = '000000';
        criarNotificacao('Erro ao buscar código QP_Inspecao: ' + error.message, 'error');
    } finally {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

// Função para iniciar automação
function iniciarAutomacao(tipo) {
    if (isProcessing) return;

    automacaoAtual = tipo;
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    modalTitle.textContent = `Iniciar ${automacoes[tipo].nome}`;
    modalMessage.textContent = `Tem certeza que deseja iniciar a automação "${automacoes[tipo].nome}"?`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Animação de entrada do modal
    setTimeout(() => {
        modal.classList.add('modal-active');
    }, 10);

    // Adicionar efeito de hover nos cards
    adicionarEfeitosVisuais();
}

// Função para iniciar automação com QP_Inspecao
function iniciarAutomacaoInspecao(tipo) {
    if (isProcessing) return;

    automacaoAtual = tipo;
    automacaoAtualProcesso = 'QP_Inspecao'; // Define o processo como QP_Inspecao
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    modalTitle.textContent = `Iniciar ${automacoes[tipo].nome}`;
    modalMessage.textContent = `Tem certeza que deseja iniciar a automação "${automacoes[tipo].nome}" com processo QP_Inspecao?`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Animação de entrada do modal
    setTimeout(() => {
        modal.classList.add('modal-active');
    }, 10);

    // Adicionar efeito de hover nos cards
    adicionarEfeitosVisuais();
}

// Função para iniciar automação com QP_Consolidado
function iniciarAutomacaoConsolidado(tipo) {
    if (isProcessing) return;

    automacaoAtual = tipo;
    automacaoAtualProcesso = 'QP_Consolidado'; // Define o processo para QP_Consolidado
    
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    modalTitle.textContent = `Iniciar ${automacoes[tipo].nome}`;
    modalMessage.textContent = `Tem certeza que deseja iniciar a automação "${automacoes[tipo].nome}"?`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Animação de entrada do modal
    setTimeout(() => {
        modal.classList.add('modal-active');
    }, 10);
}

// Função para fechar modal
function fecharModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('modal-active');

    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetarProgresso();
    }, 300);
}

// Função para confirmar inicialização no Supabase
async function confirmarInicializacao() {
    if (!automacaoAtual || isProcessing) return;

    isProcessing = true;
    const btnConfirm = document.getElementById('btn-confirm');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Processando...';

    let codigoRelatorio = '000000';
    if (automacaoAtual === 'relatorios') {
        codigoRelatorio = document.getElementById('relatorio-codigo')?.value || '000000';
    } else if (automacaoAtualProcesso === 'QP_Inspecao') {
        codigoRelatorio = document.getElementById('relatorio-codigo-inspecao')?.value || '000000';
    }

    const solicit = automacaoAtualProcesso === 'QP_Inspecao'
        ? 'QP_Inspecao'
        : 'QP_input';

    try {
        await supabaseTableUpsertBySolicit({
            Status: 'Solicitado',
            Solicit: solicit,
            Code: codigoRelatorio
        });

        criarNotificacao('Automação registrada no Supabase com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao gravar no Supabase:', error);
        criarNotificacao('Erro ao gravar no Supabase: ' + error.message, 'error');
    }

    let progress = 0;
    const totalTime = automacoes[automacaoAtual].tempoEstimado;

    progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            finalizarAutomacao();
        }

        progressFill.style.width = progress + '%';

        const mensagens = automacaoAtualProcesso === 'QP_Inspecao' ? [
            'Enviando solicitação QP_Inspecao...',
            'Registrando status...',
            'Atualizando solicitação...',
            'Validando código...',
            'Finalizando operação...'
        ] : [
            'Enviando solicitação...',
            'Registrando status...',
            'Atualizando solicitação...',
            'Validando código...',
            'Finalizando operação...'
        ];

        const mensagemIndex = Math.min(
            Math.floor((progress / 100) * mensagens.length),
            mensagens.length - 1
        );

        progressText.textContent = mensagens[mensagemIndex];
    }, totalTime / 100);
}

// Função para finalizar automação
function finalizarAutomacao() {
    clearInterval(progressInterval);

    setTimeout(() => {
        const card = document.querySelector(`[data-automation="${automacaoAtual}"]`);
        card.classList.add('success');
        card.classList.add('processing');

        // Efeito de sucesso
        criarEfeitoSucesso(card);

        // Reset modal
        fecharModal();

        // Reset estados
        setTimeout(() => {
            card.classList.remove('success', 'processing');
            isProcessing = false;
        }, 2000);

    }, 500);
}

// Função para criar efeito de sucesso
function criarEfeitoSucesso(card) {
    // Criar partículas de sucesso
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        particle.style.background = '#dc2626'; // Vermelho para partículas

        card.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    // Vibrar o card
    card.style.animation = 'successPulse 0.6s ease';
}

// Função para resetar progresso
function resetarProgresso() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const btnConfirm = document.getElementById('btn-confirm');

    progressFill.style.width = '0%';
    progressText.textContent = 'Preparando inicialização...';
    btnConfirm.disabled = false;
    btnConfirm.textContent = 'Confirmar';

    // Resetar variáveis globais
    automacaoAtual = null;
    automacaoAtualProcesso = null;

    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Função para adicionar efeitos visuais
function adicionarEfeitosVisuais() {
    // Removido: Cards não devem ter animações de hover
    // Os cards permanecem fixos sem movimentação
}

// Função para criar notificações
function criarNotificacao(mensagem, tipo) {
    // Remover notificações existentes
    const notificacoesExistentes = document.querySelectorAll('.notification');
    notificacoesExistentes.forEach(n => n.remove());

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${tipo === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}
            </div>
            <div class="notification-message">${mensagem}</div>
        </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remover após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Função para animação de entrada sequencial
function animarEntradaCards() {
    const cards = document.querySelectorAll('.automation-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Função para efeito de digitação no título
function efeitoDigitação() {
    const titulo = document.querySelector('.welcome-title');
    const texto = titulo.textContent;
    titulo.textContent = '';

    let i = 0;
    const timer = setInterval(() => {
        if (i < texto.length) {
            titulo.textContent += texto.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 100);
}

// Função para criar estrelas flutuantes
function criarEstrelasFlutuantes() {
    const background = document.querySelector('.background');

    setInterval(() => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = Math.random() * 2 + 's';

        background.appendChild(star);

        setTimeout(() => {
            star.remove();
        }, 5000);
    }, 300);
}

// Função para efeito de parallax no background
function efeitoParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const background = document.querySelector('.background');

        background.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
}

// Função para detectar movimento do mouse e criar efeito interativo - REMOVIDO
// Cards permanecem fixos sem animações de mouse
function efeitoMouseInterativo() {
    // Removido: Cards não devem ter animações interativas
}

// Função para criar efeito de loading nos botões
function adicionarEfeitoLoading() {
    const botoes = document.querySelectorAll('.start-btn');

    botoes.forEach(botao => {
        botao.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                this.innerHTML = '<span class="btn-text">Iniciando...</span><div class="spinner"></div>';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = '<span class="btn-text">Iniciar Automação</span><i class="fas fa-play btn-icon"></i>';
                }, 2000);
            }
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar efeitos
    adicionarEfeitosVisuais();
    animarEntradaCards();
    efeitoDigitação();
    criarEstrelasFlutuantes();
    efeitoParallax();
    efeitoMouseInterativo();
    adicionarEfeitoLoading();

    // Buscar código automaticamente ao carregar a página
    setTimeout(() => {
        buscarCodigoRelatorio();
        buscarCodigoRelatorioInspecao();
    }, 2000);

    // Fechar modal ao clicar fora
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });

    // Botão de cancelar do modal
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', fecharModal);
    }
});
