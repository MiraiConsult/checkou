// ===== GERENCIAMENTO DE PROPOSTAS COM LOCALSTORAGE =====

class ProposalManager {
    constructor() {
        this.storageKey = 'proposals_data';
        this.settingsKey = 'app_settings';
        this.itemsKey = 'current_items';
        this.loadSettings();
    }

    // Gerar UUID único
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Formatar data
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Carregar configurações
    loadSettings() {
        const settings = localStorage.getItem(this.settingsKey);
        if (!settings) {
            this.settings = {
                agencyName: 'Agência Digital Pro',
                email: 'contato@agencia.com'
            };
            this.saveSettings();
        } else {
            this.settings = JSON.parse(settings);
        }
    }

    // Salvar configurações
    saveSettings() {
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }

    // Obter todas as propostas
    getAllProposals() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // Salvar proposta
    saveProposal(proposal) {
        const proposals = this.getAllProposals();
        
        if (proposal.id) {
            // Atualizar proposta existente
            const index = proposals.findIndex(p => p.id === proposal.id);
            if (index !== -1) {
                proposals[index] = { ...proposals[index], ...proposal, updatedAt: new Date().toISOString() };
            }
        } else {
            // Criar nova proposta
            proposal.id = this.generateUUID();
            proposal.createdAt = new Date().toISOString();
            proposal.updatedAt = new Date().toISOString();
            proposal.status = proposal.status || 'draft';
            proposals.push(proposal);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(proposals));
        return proposal;
    }

    // Obter proposta por ID
    getProposal(id) {
        const proposals = this.getAllProposals();
        return proposals.find(p => p.id === id);
    }

    // Deletar proposta
    deleteProposal(id) {
        const proposals = this.getAllProposals();
        const filtered = proposals.filter(p => p.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    // Duplicar proposta
    duplicateProposal(id) {
        const proposal = this.getProposal(id);
        if (!proposal) return null;

        const newProposal = { ...proposal };
        delete newProposal.id;
        newProposal.status = 'draft';
        return this.saveProposal(newProposal);
    }

    // Atualizar status
    updateStatus(id, status) {
        const proposal = this.getProposal(id);
        if (proposal) {
            proposal.status = status;
            this.saveProposal(proposal);
        }
    }

    // Obter propostas recentes
    getRecentProposals(limit = 5) {
        const proposals = this.getAllProposals();
        return proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
    }

    // Calcular métricas
    getMetrics() {
        const proposals = this.getAllProposals();
        
        const metrics = {
            total: proposals.length,
            active: proposals.filter(p => p.status !== 'draft').length,
            revenue: proposals.reduce((sum, p) => sum + (p.total || 0), 0),
            pending: proposals.filter(p => p.status === 'sent').length,
            approved: proposals.filter(p => p.status === 'approved').length,
            draft: proposals.filter(p => p.status === 'draft').length
        };

        return metrics;
    }

    // Obter propostas com prazo próximo
    getUpcomingDeadlines(days = 7) {
        const proposals = this.getAllProposals();
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return proposals
            .filter(p => {
                if (!p.deadline) return false;
                const deadline = new Date(p.deadline);
                return deadline >= now && deadline <= futureDate;
            })
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    // Salvar itens atuais
    saveCurrentItems(items) {
        localStorage.setItem(this.itemsKey, JSON.stringify(items));
    }

    // Carregar itens atuais
    loadCurrentItems() {
        const items = localStorage.getItem(this.itemsKey);
        return items ? JSON.parse(items) : [];
    }

    // Limpar dados
    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.itemsKey);
            alert('Todos os dados foram limparados.');
            location.reload();
        }
    }

    // Exportar dados
    exportData() {
        const proposals = this.getAllProposals();
        const settings = this.settings;
        const data = { proposals, settings };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `propostas-rapida-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Instância global
const proposalManager = new ProposalManager();

// ===== FUNÇÕES DE INTERFACE =====

// Atualizar métricas do dashboard
function updateMetrics() {
    const metrics = proposalManager.getMetrics();
    
    const activeEl = document.getElementById('metric-active');
    const revenueEl = document.getElementById('metric-revenue');
    const pendingEl = document.getElementById('metric-pending');

    if (activeEl) activeEl.textContent = metrics.active;
    if (revenueEl) revenueEl.textContent = proposalManager.formatCurrency(metrics.revenue);
    if (pendingEl) pendingEl.textContent = metrics.pending;
}

// Atualizar tabela de propostas recentes
function updateRecentProposals() {
    const proposals = proposalManager.getRecentProposals();
    const tbody = document.getElementById('recent-proposals');

    if (!tbody) return;

    if (proposals.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    Nenhuma proposta criada ainda. <a href="#" onclick="switchView('editor'); return false;" style="color: #2D6BE4;">Criar primeira proposta</a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = proposals.map(proposal => `
        <tr>
            <td>${proposal.projectTitle || '—'}</td>
            <td>${proposal.clientName || '—'}</td>
            <td>${proposalManager.formatDate(proposal.createdAt)}</td>
            <td>${proposalManager.formatCurrency(proposal.total || 0)}</td>
            <td>
                <span class="status-badge status-${proposal.status}">
                    ${proposal.status === 'draft' ? 'Rascunho' : proposal.status === 'sent' ? 'Enviado' : 'Aprovado'}
                </span>
            </td>
            <td>
                <div class="action-menu">
                    <button class="action-btn" onclick="showActionMenu(this, '${proposal.id}')">⋮</button>
                    <div class="action-dropdown hidden">
                        <a href="#" onclick="editProposal('${proposal.id}'); return false;">Ver</a>
                        <a href="#" onclick="duplicateProposal('${proposal.id}'); return false;">Duplicar</a>
                        <a href="#" onclick="deleteProposal('${proposal.id}'); return false;" style="color: #EF4444;">Excluir</a>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// Atualizar prazos próximos
function updateUpcomingDeadlines() {
    const deadlines = proposalManager.getUpcomingDeadlines();
    const container = document.getElementById('upcoming-deadlines');

    if (!container) return;

    if (deadlines.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">Nenhum prazo próximo</p>';
        return;
    }

    container.innerHTML = deadlines.map(proposal => `
        <div style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px;">
            <strong>${proposal.projectTitle}</strong>
            <div style="color: #999;">Prazo: ${proposalManager.formatDate(proposal.deadline)}</div>
        </div>
    `).join('');
}

// Menu de ações
function showActionMenu(btn, proposalId) {
    const dropdown = btn.nextElementSibling;
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Editar proposta
function editProposal(proposalId) {
    const proposal = proposalManager.getProposal(proposalId);
    if (!proposal) return;

    // Preencher formulário
    document.getElementById('clientName').value = proposal.clientName || '';
    document.getElementById('company').value = proposal.company || '';
    document.getElementById('email').value = proposal.email || '';
    document.getElementById('projectTitle').value = proposal.projectTitle || '';
    document.getElementById('category').value = proposal.category || '';
    document.getElementById('description').value = proposal.description || '';
    document.getElementById('deadline').value = proposal.deadline || '';
    document.getElementById('validity').value = proposal.validity || '';

    // Carregar itens
    loadItemsIntoForm(proposal.items || []);

    // Armazenar ID da proposta sendo editada
    document.getElementById('editor-view').dataset.proposalId = proposalId;

    // Mudar para view de editor
    switchView('editor');

    // Scroll para o topo
    document.querySelector('.editor-form').scrollTop = 0;
}

// Duplicar proposta
function duplicateProposal(proposalId) {
    const newProposal = proposalManager.duplicateProposal(proposalId);
    if (newProposal) {
        alert('Proposta duplicada com sucesso!');
        updateRecentProposals();
        updateMetrics();
    }
}

// Deletar proposta
function deleteProposal(proposalId) {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
        proposalManager.deleteProposal(proposalId);
        updateRecentProposals();
        updateMetrics();
        alert('Proposta excluída com sucesso!');
    }
}

// Adicionar item
function addItem() {
    const items = proposalManager.loadCurrentItems();
    items.push({ name: '', value: 0 });
    proposalManager.saveCurrentItems(items);
    renderItems();
}

// Remover item
function removeItem(index) {
    const items = proposalManager.loadCurrentItems();
    items.splice(index, 1);
    proposalManager.saveCurrentItems(items);
    renderItems();
}

// Atualizar item
function updateItem(index, field, value) {
    const items = proposalManager.loadCurrentItems();
    if (field === 'value') {
        items[index].value = parseFloat(value) || 0;
    } else {
        items[index][field] = value;
    }
    proposalManager.saveCurrentItems(items);
    updatePreview();
}

// Renderizar itens
function renderItems() {
    const items = proposalManager.loadCurrentItems();
    const container = document.getElementById('items-list');

    if (!container) return;

    container.innerHTML = items.map((item, index) => `
        <div class="item-row">
            <input type="text" placeholder="Nome do item" value="${item.name}" onchange="updateItem(${index}, 'name', this.value)">
            <input type="number" placeholder="0,00" value="${item.value}" step="0.01" onchange="updateItem(${index}, 'value', this.value)">
            <button class="item-remove" onclick="removeItem(${index})">✕</button>
        </div>
    `).join('');

    updatePreview();
}

// Carregar itens no formulário
function loadItemsIntoForm(items) {
    proposalManager.saveCurrentItems(items);
    renderItems();
}

// Atualizar preview em tempo real
function updatePreview() {
    const items = proposalManager.loadCurrentItems();
    const total = items.reduce((sum, item) => sum + (item.value || 0), 0);

    // Atualizar campo de total
    const totalEl = document.getElementById('total-value');
    if (totalEl) {
        totalEl.textContent = proposalManager.formatCurrency(total);
    }

    // Atualizar preview da tabela
    const previewItems = document.getElementById('preview-items');
    if (previewItems) {
        if (items.length === 0) {
            previewItems.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center; padding: 20px; color: #999;">Nenhum item adicionado</td>
                </tr>
            `;
        } else {
            previewItems.innerHTML = items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: right;">${proposalManager.formatCurrency(item.value)}</td>
                </tr>
            `).join('');
        }
    }

    // Atualizar total no preview
    const previewTotal = document.getElementById('preview-total');
    if (previewTotal) {
        previewTotal.textContent = proposalManager.formatCurrency(total);
    }
}

// Atualizar preview com dados do formulário
function updatePreviewData() {
    const clientName = document.getElementById('clientName').value || '—';
    const company = document.getElementById('company').value || '—';
    const email = document.getElementById('email').value || '—';
    const projectTitle = document.getElementById('projectTitle').value || 'Proposta Comercial';
    const deadline = document.getElementById('deadline').value;
    const validity = document.getElementById('validity').value;
    const description = document.getElementById('description').value || 'Aguardando dados...';

    // Atualizar preview
    const previewClient = document.getElementById('preview-client');
    const previewCompany = document.getElementById('preview-company-name');
    const previewEmail = document.getElementById('preview-email');
    const previewTitle = document.getElementById('preview-project-title');
    const previewDeadline = document.getElementById('preview-deadline');
    const previewValidity = document.getElementById('preview-validity');
    const previewDesc = document.getElementById('preview-description');
    const previewDate = document.getElementById('preview-date');

    if (previewClient) previewClient.textContent = clientName;
    if (previewCompany) previewCompany.textContent = company;
    if (previewEmail) previewEmail.textContent = email;
    if (previewTitle) previewTitle.textContent = `Proposta Comercial: ${projectTitle}`;
    if (previewDeadline) previewDeadline.textContent = deadline ? proposalManager.formatDate(deadline) : '—';
    if (previewValidity) previewValidity.textContent = validity ? proposalManager.formatDate(validity) : '—';
    if (previewDesc) previewDesc.textContent = description;
    if (previewDate) previewDate.textContent = new Date().toLocaleDateString('pt-BR');
}

// Salvar rascunho
function saveDraft() {
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

    const editorView = document.getElementById('editor-view');
    if (editorView.dataset.proposalId) {
        proposal.id = editorView.dataset.proposalId;
    }

    proposalManager.saveProposal(proposal);
    alert('Rascunho salvo com sucesso!');
}

// Gerar proposta (marcar como enviada)
function generateProposal() {
    const items = proposalManager.loadCurrentItems();
    
    if (!document.getElementById('projectTitle').value) {
        alert('Por favor, preencha o título do projeto');
        return;
    }

    if (items.length === 0) {
        alert('Por favor, adicione pelo menos um item');
        return;
    }

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
        status: 'sent'
    };

    const editorView = document.getElementById('editor-view');
    if (editorView.dataset.proposalId) {
        proposal.id = editorView.dataset.proposalId;
    }

    proposalManager.saveProposal(proposal);
    alert('Proposta gerada e salva com sucesso!');
    
    // Limpar formulário
    resetForm();
    
    // Voltar para dashboard
    switchView('dashboard');
    updateRecentProposals();
    updateMetrics();
}

// Resetar formulário
function resetForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('company').value = '';
    document.getElementById('email').value = '';
    document.getElementById('projectTitle').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('validity').value = '';
    proposalManager.saveCurrentItems([]);
    renderItems();
    document.getElementById('editor-view').dataset.proposalId = '';
}

// Imprimir / PDF
function printProposal() {
    window.print();
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    updateMetrics();
    updateRecentProposals();
    updateUpcomingDeadlines();
    renderItems();

    // Event listeners para preview em tempo real
    const formInputs = ['clientName', 'company', 'email', 'projectTitle', 'deadline', 'validity', 'description'];
    formInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreviewData);
            el.addEventListener('change', updatePreviewData);
        }
    });

    // Botões de ação
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) addItemBtn.addEventListener('click', addItem);

    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);

    const generateProposalBtn = document.getElementById('generateProposalBtn');
    if (generateProposalBtn) generateProposalBtn.addEventListener('click', generateProposal);

    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', printProposal);

    // Botões de configurações
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        document.getElementById('agencyName').value = proposalManager.settings.agencyName;
        document.getElementById('settingsEmail').value = proposalManager.settings.email;
        
        saveSettingsBtn.addEventListener('click', function() {
            proposalManager.settings.agencyName = document.getElementById('agencyName').value;
            proposalManager.settings.email = document.getElementById('settingsEmail').value;
            proposalManager.saveSettings();
            
            // Atualizar preview
            const previewCompany = document.getElementById('preview-company');
            if (previewCompany) previewCompany.textContent = proposalManager.settings.agencyName;
            
            alert('Configurações salvas com sucesso!');
        });
    }

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) exportDataBtn.addEventListener('click', () => proposalManager.exportData());

    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) clearDataBtn.addEventListener('click', () => proposalManager.clearAllData());

    // Atualizar preview da agência
    const previewCompany = document.getElementById('preview-company');
    if (previewCompany) previewCompany.textContent = proposalManager.settings.agencyName;

    // Novo botão de proposta na sidebar
    const newProposalBtn = document.getElementById('newProposalBtn');
    if (newProposalBtn) {
        newProposalBtn.addEventListener('click', function() {
            resetForm();
            switchView('editor');
        });
    }
});
