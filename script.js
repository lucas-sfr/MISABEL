// Variáveis globais
let automacaoAtual = null;
let automacaoAtualProcesso = null; // Nova variável para controlar o processo
let progressInterval = null;
let isProcessing = false;

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

// Função para buscar código do relatório da API
async function buscarCodigoRelatorio() {
    const refreshBtn = document.querySelector('.refresh-code-btn');
    const codigoInput = document.getElementById('relatorio-codigo');
    
    if (!refreshBtn || !codigoInput) return;
    
    // Adicionar estado de loading
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    codigoInput.value = '';
    
    try {
        console.log('🔍 Buscando código da API logs_hoje...');
        
        const response = await fetch('https://elpis.globalhitss.com.br/api/logs_hoje', {
            method: 'GET',
            headers: {
                'Authorization': 'Lenovo!Hitss!Global',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const logs = await response.json();
        console.log('📋 Logs recebidos:', logs);

        // Filtrar pelo maior ID com processo QP_input e status Iniciado
        let logSelecionado = null;
        let maiorId = -1;

        if (Array.isArray(logs)) {
            logs.forEach(log => {
                // Tenta encontrar com os diferentes nomes de campo possíveis
                const processo = log.processo || log.nome_processo;
                if (processo === 'QP_input' && 
                    log.status === 'Iniciado' && 
                    log.id > maiorId) {
                    maiorId = log.id;
                    logSelecionado = log;
                }
            });
        }

        if (logSelecionado) {
            // Extrair código do campo observacao
            const codigo = logSelecionado.observacao || '';
            const codigoFormatado = codigo;
            
            codigoInput.value = codigoFormatado;
            console.log('✅ Código encontrado:', codigoFormatado);
            console.log('📋 Log selecionado:', logSelecionado);
            
            criarNotificacao('Código do relatório atualizado com sucesso!', 'success');
        } else {
            console.log('⚠️ Nenhum log encontrado com os critérios');
            codigoInput.value = '000000';
            criarNotificacao('Nenhum código disponível no momento', 'error');
        }

    } catch (error) {
        console.error('❌ Erro ao buscar código:', error);
        codigoInput.value = '000000';
        criarNotificacao('Erro ao buscar código: ' + error.message, 'error');
    } finally {
        // Remover estado de loading
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

// Função para buscar código do relatório da API para QP_Inspecao
async function buscarCodigoRelatorioInspecao() {
    const refreshBtn = document.querySelector('#relatorio-codigo-inspecao').nextElementSibling;
    const codigoInput = document.getElementById('relatorio-codigo-inspecao');
    
    if (!refreshBtn || !codigoInput) return;
    
    // Adicionar estado de loading
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    codigoInput.value = '';
    
    try {
        console.log('🔍 Buscando código da API logs_hoje para QP_Inspecao...');
        
        const response = await fetch('https://elpis.globalhitss.com.br/api/logs_hoje', {
            method: 'GET',
            headers: {
                'Authorization': 'Lenovo!Hitss!Global',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const logs = await response.json();
        console.log('📋 Logs recebidos:', logs);

        // Filtrar pelo maior ID com processo QP_Inspecao e status Iniciado
        let logSelecionado = null;
        let maiorId = -1;

        if (Array.isArray(logs)) {
            logs.forEach(log => {
                // Tenta encontrar com os diferentes nomes de campo possíveis
                const processo = log.processo || log.nome_processo;
                if (processo === 'QP_Inspecao' && 
                    log.status === 'Iniciado' && 
                    log.id > maiorId) {
                    maiorId = log.id;
                    logSelecionado = log;
                }
            });
        }

        if (logSelecionado) {
            // Extrair código do campo observacao
            const codigo = logSelecionado.observacao || '';
            const codigoFormatado = codigo;
            
            codigoInput.value = codigoFormatado;
            console.log('✅ Código QP_Inspecao encontrado:', codigoFormatado);
            console.log('📋 Log selecionado:', logSelecionado);
            
            criarNotificacao('Código QP_Inspecao atualizado com sucesso!', 'success');
        } else {
            console.log('⚠️ Nenhum log QP_Inspecao encontrado com os critérios');
            codigoInput.value = '000000';
            criarNotificacao('Nenhum código QP_Inspecao disponível no momento', 'error');
        }

    } catch (error) {
        console.error('❌ Erro ao buscar código QP_Inspecao:', error);
        codigoInput.value = '000000';
        criarNotificacao('Erro ao buscar código QP_Inspecao: ' + error.message, 'error');
    } finally {
        // Remover estado de loading
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

// Função para confirmar inicialização
async function confirmarInicializacao() {
    if (!automacaoAtual || isProcessing) return;

    isProcessing = true;
    const btnConfirm = document.getElementById('btn-confirm');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Processando...';

    // Verificar se é a automação de relatorios, QP_Inspecao ou QP_Consolidado e fazer requisição para API
    if (automacaoAtual === 'relatorios' || automacaoAtualProcesso === 'QP_Inspecao' || automacaoAtualProcesso === 'QP_Consolidado') {
        // Obter código do campo de input correto (QP_Consolidado não tem código)
        let codigoRelatorio = '000000';
        if (automacaoAtualProcesso === 'QP_Inspecao') {
            const codigoInput = document.getElementById('relatorio-codigo-inspecao');
            codigoRelatorio = codigoInput ? codigoInput.value : '000000';
        } else if (automacaoAtual === 'relatorios') {
            const codigoInput = document.getElementById('relatorio-codigo');
            codigoRelatorio = codigoInput ? codigoInput.value : '000000';
        }
        
        // URL formatada como Raw String e com .strip() como no Python
        const url = "https://elpis.globalhitss.com.br/api/log".trim();
        
        // Payload exato como no Python, usando o código do relatório
        const payload = {
            "usuario": "MIS_Auomat",  // usuario (campo que a API espera)
            "maquina": "Site_Mis",  // máquina específica
            "tipo_processo": "RPA",  // tipo_processo="RPA"
            "processo": automacaoAtualProcesso || "QP_input",  // Usa QP_Inspecao, QP_Consolidado ou QP_input
            "status": "Solicitado",  // status="Solicitado" (campo que a API espera)
            "observacao": codigoRelatorio  // observacao com o código (QP_Consolidado usa '000000')
        };

        console.log('🔍 Iniciando requisição para API...');
        console.log('📋 Código do relatório:', codigoRelatorio);
        console.log('📋 URL da requisição:', url);
        console.log('📋 Headers:', {
            'Content-Type': 'application/json',
            'Authorization': 'Lenovo!Hitss!Global'
        });
        console.log('📋 Payload a ser enviado:', JSON.stringify(payload, null, 2));
        console.log('📋 Payload formatado:', payload);

        // Enviar requisição POST como no exemplo
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Lenovo!Hitss!Global'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Sucesso:', result);
                const mensagemSucesso = automacaoAtualProcesso === 'QP_Inspecao' 
                    ? 'Relatório QP_Inspecao solicitado com sucesso!' 
                    : 'Relatório de Qualidade de Pedidos solicitado com sucesso!';
                criarNotificacao(mensagemSucesso, 'success');
            } else {
                console.log('❌ Erro:', result);
                criarNotificacao('Erro ao enviar requisição', 'error');
            }
        } catch (error) {
            console.error('❌ Erro de conexão:', error);
            criarNotificacao('Erro de conexão: ' + error.message, 'error');
        }
    }

    // Animação de progresso
    let progress = 0;
    const totalTime = automacoes[automacaoAtual].tempoEstimado;

    progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Progresso variável
        if (progress >= 100) {
            progress = 100;
            finalizarAutomacao();
        }

        progressFill.style.width = progress + '%';

        // Mensagens dinâmicas de progresso
        const mensagens = automacaoAtualProcesso === 'QP_Inspecao' ? [
            'Enviando solicitação QP_Inspecao...',
            'Conectando ao servidor...',
            'Processando requisição de inspeção...',
            'Registrando QP_Inspecao no sistema...',
            'Confirmando solicitação de inspeção...',
            'Solicitação QP_Inspecao registrada!'
        ] : automacaoAtualProcesso === 'QP_Consolidado' ? [
            'Enviando solicitação QP_Consolidado...',
            'Conectando ao servidor...',
            'Processando requisição de consolidação...',
            'Registrando QP_Consolidado no sistema...',
            'Confirmando solicitação de consolidação...',
            'Solicitação QP_Consolidado registrada!'
        ] : automacaoAtual === 'relatorios' ? [
            'Enviando solicitação...',
            'Conectando ao servidor...',
            'Processando requisição...',
            'Registrando no sistema...',
            'Confirmando solicitação...',
            'Solicitação registrada!'
        ] : [
            'Inicializando sistemas...',
            'Carregando configurações...',
            'Conectando aos serviços...',
            'Processando dados...',
            'Otimizando algoritmos...',
            'Finalizando configuração...',
            'Automação ativa!'
        ];

        const mensagemIndex = Math.floor((progress / 100) * mensagens.length);
        progressText.textContent = mensagens[Math.min(mensagemIndex, mensagens.length - 1)];

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
