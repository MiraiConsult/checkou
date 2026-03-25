// ===== NAVEGAÇÃO E INTERAÇÕES =====

// Trocar de view
function switchView(viewName) {
    // Ocultar todas as views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.add('hidden'));

    // Mostrar view selecionada
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.classList.remove('hidden');
    }

    // Atualizar menu ativo
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const activeItem = document.querySelector(`[data-view="${viewName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    // Fechar sidebar em mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

// Inicializar navegação
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const viewName = this.dataset.view;
            switchView(viewName);
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebar && mobileMenuToggle && window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ===== ESTILOS DINÂMICOS PARA MENU DE AÇÕES =====

const style = document.createElement('style');
style.textContent = `
    .action-menu {
        position: relative;
    }

    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
        color: #999;
        transition: color 0.3s;
    }

    .action-btn:hover {
        color: var(--primary-light);
    }

    .action-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        min-width: 150px;
    }

    .action-dropdown.hidden {
        display: none;
    }

    .action-dropdown a {
        display: block;
        padding: 12px 16px;
        text-decoration: none;
        color: var(--text-dark);
        font-size: 14px;
        transition: all 0.3s;
        border-bottom: 1px solid var(--border-color);
    }

    .action-dropdown a:last-child {
        border-bottom: none;
    }

    .action-dropdown a:hover {
        background: var(--background-light);
        color: var(--primary-light);
    }
`;
document.head.appendChild(style);

// ===== LANDING PAGE =====

// Hamburger menu na landing page
function initializeLandingPage() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const nav = document.querySelector('.navbar-nav');
            if (nav) {
                nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            }
        });
    }
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página do app ou landing page
    const appBody = document.querySelector('.app-body');
    
    if (appBody) {
        // Página do app
        initializeNavigation();
        
        // Inicializar com dashboard
        switchView('dashboard');
    } else {
        // Landing page
        initializeLandingPage();
    }
});

// ===== RESPONSIVIDADE =====

// Ajustar layout em mudanças de tamanho
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});

// ===== SALVAMENTO AUTOMÁTICO =====

// Auto-save a cada 30 segundos
setInterval(function() {
    const editorView = document.getElementById('editor-view');
    if (editorView && !editorView.classList.contains('hidden')) {
        const items = proposalManager.loadCurrentItems();
        const proposal = {
            clientName: document.getElementById('clientName').value,
            company: document.getElementById('company').value,
            email: document.getElementById('email').value,
            projectTitle: document.getElementById('projectTitle').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            deadline: document.getElementById('deadline').value,
            validity: document.getElementById('validity').value,
            items: items,
            total: items.reduce((sum, item) => sum + (item.value || 0), 0),
            status: 'draft'
        };

        if (editorView.dataset.proposalId) {
            proposal.id = editorView.dataset.proposalId;
        }

        if (proposal.projectTitle || proposal.clientName || items.length > 0) {
            proposalManager.saveProposal(proposal);
        }
    }
}, 30000);

// ===== ATALHOS DE TECLADO =====

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn && !document.getElementById('editor-view').classList.contains('hidden')) {
            saveDraftBtn.click();
        }
    }

    // Ctrl/Cmd + P para imprimir
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        const printBtn = document.getElementById('printBtn');
        if (printBtn && !document.getElementById('editor-view').classList.contains('hidden')) {
            printBtn.click();
        }
    }
});

// ===== VALIDAÇÃO DE FORMULÁRIO =====

function validateProposal() {
    const projectTitle = document.getElementById('projectTitle').value.trim();
    const items = proposalManager.loadCurrentItems();

    const errors = [];

    if (!projectTitle) {
        errors.push('Título do projeto é obrigatório');
    }

    if (items.length === 0) {
        errors.push('Adicione pelo menos um item');
    }

    if (items.some(item => !item.name || item.value <= 0)) {
        errors.push('Todos os itens devem ter nome e valor maior que zero');
    }

    return errors;
}

// ===== NOTIFICAÇÕES =====

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyle);

// ===== INTEGRAÇÃO COM LANDING PAGE =====

// Se estamos na landing page, redirecionar botões para app.html
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.app-body')) {
        // Landing page
        const buttons = document.querySelectorAll('button[onclick*="window.location"]');
        buttons.forEach(btn => {
            if (btn.textContent.includes('Começar') || btn.textContent.includes('Experimentar')) {
                btn.onclick = function() {
                    window.location.href = 'app.html';
                };
            }
        });
    }
});
