/**
 * DorLog Reports JavaScript
 * Funcionalidades adicionais para relatórios HTML
 */

(function() {
    'use strict';
    
    // Configurações
    const CONFIG = {
        animationDelay: 100,
        fadeInDuration: 500
    };
    
    /**
     * Inicializar animações ao carregar a página
     */
    function initAnimations() {
        const cards = document.querySelectorAll('.report-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, CONFIG.animationDelay * index);
        });
    }
    
    /**
     * Função para animar números (contador animado)
     */
    function animateNumbers() {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(element => {
            const finalValue = parseFloat(element.textContent);
            if (isNaN(finalValue)) return;
            
            let currentValue = 0;
            const increment = finalValue / 50; // 50 frames de animação
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                
                // Formatar números com casas decimais se necessário
                if (finalValue % 1 !== 0) {
                    element.textContent = currentValue.toFixed(1);
                } else {
                    element.textContent = Math.floor(currentValue);
                }
            }, 20);
        });
    }
    
    /**
     * Adicionar funcionalidade de impressão
     */
    function setupPrintFunction() {
        // Criar botão de imprimir se não existir
        const printButton = document.createElement('button');
        printButton.innerHTML = '🖨️ Imprimir Relatório';
        printButton.className = 'print-btn no-print';
        printButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        printButton.addEventListener('click', () => {
            window.print();
        });
        
        document.body.appendChild(printButton);
    }
    
    /**
     * Funcionalidade para compartilhamento (se disponível)
     */
    function setupShareFunction() {
        if (navigator.share) {
            const shareButton = document.createElement('button');
            shareButton.innerHTML = '📤 Compartilhar';
            shareButton.className = 'share-btn no-print';
            shareButton.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            
            shareButton.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Relatório de saúde DorLog',
                        url: window.location.href
                    });
                } catch (error) {
                    console.log('Compartilhamento cancelado ou não suportado');
                }
            });
            
            document.body.appendChild(shareButton);
        }
    }
    
    /**
     * Adicionar tooltip para elementos com informações adicionais
     */
    function setupTooltips() {
        const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
        
        elementsWithTooltip.forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1001;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
            `;
            
            document.body.appendChild(tooltip);
            
            element.addEventListener('mouseenter', (e) => {
                tooltip.style.left = e.pageX + 10 + 'px';
                tooltip.style.top = e.pageY - 40 + 'px';
                tooltip.style.opacity = '1';
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
            
            element.addEventListener('mousemove', (e) => {
                tooltip.style.left = e.pageX + 10 + 'px';
                tooltip.style.top = e.pageY - 40 + 'px';
            });
        });
    }
    
    /**
     * Funcionalidade para gráficos simples com barras CSS
     */
    function setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const value = bar.getAttribute('data-value') || 0;
            const fill = bar.querySelector('.progress-fill');
            
            if (fill) {
                setTimeout(() => {
                    fill.style.width = value + '%';
                }, 500);
            }
        });
    }
    
    /**
     * Adicionar data e hora de visualização
     */
    function addViewTimestamp() {
        const timestamp = document.createElement('div');
        timestamp.className = 'view-timestamp no-print';
        timestamp.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 11px;
            z-index: 1000;
        `;
        
        const now = new Date();
        timestamp.textContent = `Visualizado em: ${now.toLocaleString('pt-BR')}`;
        
        document.body.appendChild(timestamp);
    }
    
    /**
     * Funcionalidade de busca/filtro simples
     */
    function setupSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar no relatório...';
        searchInput.className = 'search-input no-print';
        searchInput.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            width: 200px;
        `;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.report-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = searchTerm ? 'none' : 'block';
                }
            });
        });
        
        document.body.appendChild(searchInput);
    }
    
    /**
     * Inicializar todas as funcionalidades
     */
    function init() {
        // Aguardar DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Executar inicializações
        initAnimations();
        setTimeout(animateNumbers, 300);
        setupPrintFunction();
        setupShareFunction();
        setupTooltips();
        setupProgressBars();
        addViewTimestamp();
        setupSearch();
        
        console.log('DorLog Reports: Funcionalidades carregadas com sucesso');
    }
    
    // Inicializar quando a página carregar
    init();
    
    // Expor algumas funções globalmente se necessário
    window.DorLogReports = {
        animateNumbers,
        setupProgressBars
    };
    
})();