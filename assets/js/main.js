// Cosmic Tools - Global JavaScript
class CosmicTools {
    constructor() {
        this.currentTool = null;
        // Update the tools object in main.js
this.tools = {
    'cosmic-journal': {
        name: 'Cosmic Journal',
        color: '#00ffb3',
        icon: '📓',
        description: 'Advanced trading journal with analytics'
    },
    'cosmic-analyzer': {
        name: 'Cosmic Analyzer',
        color: '#3b7cff',
        icon: '🔍',
        description: 'Market analysis tool with session tracking'
    }
};
        this.init();
    }

    init() {
        this.detectCurrentTool();
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupToolTransitions();
        this.setupLoadingOverlay();
        this.setupTheme();
        this.updateToolIndicator();
        this.setupBreadcrumbs();
    }

    detectCurrentTool() {
        const path = window.location.pathname;
        if (path.includes('cosmic-journal')) {
            this.currentTool = 'cosmic-journal';
        } else if (path.includes('cosmic-analyzer')) {
            this.currentTool = 'cosmic-analyzer';
        } else {
            this.currentTool = 'hub';
        }
    }

    setupNavigation() {
        // Highlight current page in navigation
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
                link.classList.add('active');
            } else if (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) {
                if (linkPath === 'index.html') {
                    link.classList.add('active');
                }
            }
        });

        // Update tool indicator
        this.updateToolIndicator();
    }

    updateToolIndicator() {
        const indicator = document.getElementById('current-tool');
        if (indicator && this.currentTool !== 'hub') {
            const tool = this.tools[this.currentTool];
            if (tool) {
                indicator.textContent = tool.name;
                indicator.style.borderColor = `${tool.color}40`;
                indicator.style.background = `${tool.color}15`;
            }
        } else if (indicator) {
            indicator.textContent = 'Home';
            indicator.style.borderColor = 'rgba(0, 255, 179, 0.2)';
            indicator.style.background = 'rgba(0, 255, 179, 0.1)';
        }
    }

    setupMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');
        
        if (menuBtn && mobileNav) {
            menuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                menuBtn.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
                    mobileNav.classList.remove('active');
                    menuBtn.textContent = '☰';
                }
            });

            // Close menu when clicking a link
            mobileNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileNav.classList.remove('active');
                    menuBtn.textContent = '☰';
                });
            });
        }
    }

    setupToolTransitions() {
        // Add smooth transition for tool links
        const toolLinks = document.querySelectorAll('a[href*="tools/"]');
        
        toolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('disabled')) {
                    e.preventDefault();
                    return;
                }
                
                // Show loading overlay
                this.showLoading();
                
                // Simulate loading time for demo
                setTimeout(() => {
                    this.hideLoading();
                }, 800);
            });
        });
    }

    setupLoadingOverlay() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Show loading for internal tool navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.includes('tools/') && !link.classList.contains('disabled')) {
                this.showLoading();
            }
        });

        // Hide loading when page is loaded
        window.addEventListener('load', () => {
            this.hideLoading();
        });
    }

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            setTimeout(() => {
                this.loadingOverlay.classList.remove('active');
            }, 300);
        }
    }

    setupTheme() {
        // Load saved theme preferences
        const savedTheme = localStorage.getItem('cosmic-tools-theme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
        }

        // Setup theme switcher if exists
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
                localStorage.setItem('cosmic-tools-theme', e.target.value);
            });
        }
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Update CSS variables based on theme
        const root = document.documentElement;
        switch (theme) {
            case 'dark':
                root.style.setProperty('--bg-dark', '#0a0e14');
                root.style.setProperty('--bg-panel', '#1a1f25');
                break;
            case 'light':
                root.style.setProperty('--bg-dark', '#f8fafc');
                root.style.setProperty('--bg-panel', '#ffffff');
                root.style.setProperty('--text-primary', '#1e293b');
                root.style.setProperty('--text-secondary', '#64748b');
                break;
            case 'blue':
                root.style.setProperty('--accent-primary', '#3b82f6');
                root.style.setProperty('--accent-secondary', '#8b5cf6');
                break;
        }
    }

    setupBreadcrumbs() {
        // Only setup on tool pages
        if (this.currentTool !== 'hub') {
            const breadcrumbContainer = document.querySelector('.tool-breadcrumb');
            if (breadcrumbContainer) {
                const tool = this.tools[this.currentTool];
                breadcrumbContainer.innerHTML = `
                    <a href="/" class="breadcrumb-item">Home</a>
                    <span class="breadcrumb-separator">›</span>
                    <a href="/index.html" class="breadcrumb-item">Tools</a>
                    <span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-current">${tool.name}</span>
                `;
            }
        }
    }

    // Tool initialization method (called from tool pages)
    initializeTool(toolName) {
        this.currentTool = toolName;
        this.updateToolIndicator();
        this.setupBreadcrumbs();
        
        // Update document title
        const tool = this.tools[toolName];
        if (tool) {
            document.title = `${tool.name} - Cosmic Tools`;
        }
    }

    // Data sharing between tools (placeholder for future implementation)
    shareData(dataType, data) {
        // This would be implemented when we have multiple tools sharing data
        console.log(`Sharing ${dataType} data:`, data);
        localStorage.setItem(`cosmic-${dataType}`, JSON.stringify(data));
    }

    getSharedData(dataType) {
        const data = localStorage.getItem(`cosmic-${dataType}`);
        return data ? JSON.parse(data) : null;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.CosmicTools = new CosmicTools();
    
    // Add fade-in animations
    const elements = document.querySelectorAll('.tool-card, .feature-card, .quick-access-card');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
    });
    
    // Setup tooltips
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const title = el.getAttribute('title');
            if (title) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                document.body.appendChild(tooltip);
                
                const rect = el.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 10}px`;
                tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
                
                el._tooltip = tooltip;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            if (el._tooltip) {
                el._tooltip.remove();
                el._tooltip = null;
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + / to focus search
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close mobile menu
        if (e.key === 'Escape') {
            const mobileNav = document.getElementById('mobile-nav');
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                const menuBtn = document.getElementById('mobile-menu-btn');
                if (menuBtn) menuBtn.textContent = '☰';
            }
        }
    });
});
