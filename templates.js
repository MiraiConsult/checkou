// Templates pré-escritos para diferentes categorias
const TEMPLATES = {
    'dev-frontend': {
        name: 'Dev Frontend',
        icon: '💻',
        color: '#3B82F6',
        description: 'Desenvolvimento de interfaces web modernas',
        scope: `Desenvolvimento de interface frontend utilizando tecnologias modernas e boas práticas de UX/UI.

Entregáveis:
• Código-fonte comentado e documentado
• Componentes reutilizáveis
• Testes unitários
• Documentação técnica
• Deploy em ambiente de produção
• Suporte pós-entrega de 30 dias`
    },
    'dev-backend': {
        name: 'Dev Backend',
        icon: '⚙️',
        color: '#8B5CF6',
        description: 'Desenvolvimento de APIs e servidores',
        scope: `Desenvolvimento de backend robusto com arquitetura escalável.

Entregáveis:
• API RESTful ou GraphQL
• Banco de dados estruturado
• Autenticação e autorização
• Testes automatizados
• Documentação da API
• Deploy em servidor de produção
• Monitoramento e logs`
    },
    'design-ui': {
        name: 'Design UI/UX',
        icon: '🎨',
        color: '#8B5CF6',
        description: 'Design de interfaces e experiência do usuário',
        scope: `Criação de identidade visual e design de interface com foco em experiência do usuário.

Entregáveis:
• Pesquisa de usuário e análise de concorrentes
• Wireframes e protótipos interativos
• Design system completo
• Guia de estilo e especificações
• Arquivos editáveis (Figma/XD)
• Handoff para desenvolvimento
• Testes de usabilidade`
    },
    'design-graphic': {
        name: 'Design Gráfico',
        icon: '🖼️',
        color: '#F59E0B',
        description: 'Criação de materiais gráficos profissionais',
        scope: `Criação de identidade visual e materiais gráficos profissionais.

Entregáveis:
• Logo e variações
• Paleta de cores
• Tipografia
• Cartão de visita
• Papel timbrado
• Assinatura de email
• Guia de marca completo
• Arquivos em múltiplos formatos`
    },
    'marketing': {
        name: 'Marketing Digital',
        icon: '📢',
        color: '#F59E0B',
        description: 'Estratégia e execução de marketing digital',
        scope: `Desenvolvimento de estratégia e execução de campanha de marketing digital.

Entregáveis:
• Análise de mercado e concorrentes
• Estratégia de conteúdo
• Criação de conteúdo (posts, vídeos, imagens)
• Gestão de redes sociais
• Campanhas de email marketing
• Relatórios de desempenho
• Otimização contínua`
    },
    'copywriting': {
        name: 'Copywriting',
        icon: '✍️',
        color: '#10B981',
        description: 'Redação persuasiva e estratégica',
        scope: `Redação de conteúdo persuasivo e estratégico para conversão.

Entregáveis:
• Copy para landing page
• Descrições de produtos/serviços
• Emails de marketing
• Anúncios e headlines
• Roteiros de vídeo
• Conteúdo para redes sociais
• Revisão e otimização`
    },
    'consultoria': {
        name: 'Consultoria',
        icon: '💼',
        color: '#10B981',
        description: 'Consultoria estratégica e assessoria',
        scope: `Consultoria estratégica e assessoria especializada.

Entregáveis:
• Diagnóstico e análise situacional
• Plano de ação estratégico
• Recomendações e insights
• Apresentação executiva
• Acompanhamento de implementação
• Relatório final
• Suporte pós-consultoria`
    }
};

// Função para renderizar templates no modal
function renderTemplatesModal() {
    const grid = document.getElementById('templatesModalGrid');
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(TEMPLATES).forEach(([key, template]) => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-icon" style="background: ${template.color}20; color: ${template.color};">
                ${template.icon}
            </div>
            <h3>${template.name}</h3>
            <p>${template.description}</p>
            <div class="template-details">
                <ul style="margin: 0; padding-left: 20px;">
                    ${template.scope.split('\n').filter(line => line.trim().startsWith('•')).map(line => `<li>${line.trim().substring(2)}</li>`).join('')}
                </ul>
            </div>
            <button class="btn btn-primary btn-block template-button" onclick="useTemplate('${key}')">
                Usar este Template
            </button>
        `;

        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('template-button')) {
                const details = this.querySelector('.template-details');
                const button = this.querySelector('.template-button');
                details.classList.toggle('show');
                button.classList.toggle('show');
            }
        });

        grid.appendChild(card);
    });
}

// Função para usar um template
function useTemplate(templateKey) {
    const template = TEMPLATES[templateKey];
    if (!template) return;

    // Preencher o formulário com dados do template
    document.getElementById('category').value = templateKey;
    document.getElementById('description').value = template.scope;

    // Fechar o modal
    closeTemplateModal();

    // Focar no próximo campo
    document.getElementById('projectTitle').focus();
}

// Função para abrir modal de templates
function openTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderTemplatesModal();
    }
}

// Função para fechar modal de templates
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Renderizar templates na página de templates
function renderTemplatesPage() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(TEMPLATES).forEach(([key, template]) => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-icon" style="background: ${template.color}20; color: ${template.color};">
                ${template.icon}
            </div>
            <h3>${template.name}</h3>
            <p>${template.description}</p>
            <p style="font-size: 12px; color: #999; margin: 12px 0;">
                ${template.scope.split('\n').filter(line => line.trim().startsWith('•')).length} entregáveis
            </p>
            <button class="btn btn-primary btn-block" onclick="navigateToEditorWithTemplate('${key}')">
                Usar Template
            </button>
        `;
        grid.appendChild(card);
    });
}

// Navegar para editor com template
function navigateToEditorWithTemplate(templateKey) {
    switchView('editor');
    setTimeout(() => {
        useTemplate(templateKey);
    }, 100);
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    renderTemplatesPage();
    
    const useTemplateBtn = document.getElementById('useTemplateBtn');
    if (useTemplateBtn) {
        useTemplateBtn.addEventListener('click', openTemplateModal);
    }

    const closeTemplateModalBtn = document.getElementById('closeTemplateModal');
    if (closeTemplateModalBtn) {
        closeTemplateModalBtn.addEventListener('click', closeTemplateModal);
    }

    // Fechar modal ao clicar fora
    const modal = document.getElementById('templateModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeTemplateModal();
            }
        });
    }
});
