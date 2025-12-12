// Hub integration
(function() {
    // Share data with hub if available
    if (window.CosmicTools) {
        // Share trade count with hub
        function shareTradeStats() {
            const trades = this.getTrades();
            const accounts = this.getAccounts();
            const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
            
            const stats = {
                tradeCount: trades.length,
                activeAccount: activeAccount ? activeAccount.name : null,
                totalPnL: trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
                lastUpdated: new Date().toISOString()
            };
            
            window.CosmicTools.shareData('journal-stats', stats);
        }
        
        // Override saveTrade to share stats
        const originalSaveTrade = CosmicJournal.prototype.saveTrade;
        CosmicJournal.prototype.saveTrade = async function(e) {
            await originalSaveTrade.call(this, e);
            shareTradeStats.call(this);
        };
        
        // Share stats on initialization
        setTimeout(() => {
            if (window.cosmicJournalInstance) {
                shareTradeStats.call(window.cosmicJournalInstance);
            }
        }, 1000);
    }
})();

// Create static stars
function createStaticStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'static-stars';
    
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'static-star';
        
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = Math.random() * 1.5 + 0.5;
        const delay = Math.random() * 8;
        
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
}

// Create shooting stars
function createShootingStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'shooting-stars';
    
    for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
}

// Cosmic Journal - Enhanced with all requested features
class CosmicJournal {
    constructor() {
        this.STORAGE_KEYS = {
            TRADES: 'trades', 
            NOTES: 'journal-notes', 
            CUSTOM_ORDER: 'customOrder', 
            SORT_PREF: 'sortBy',
            ACCOUNTS: 'accounts',
            ACTIVE_ACCOUNT: 'activeAccount',
            THEME: 'theme',
            ANALYTICS_MODE: 'analyticsMode',
            WITHDRAWALS: 'withdrawals',
            BACKGROUND_IMAGE: 'backgroundImage',
            FROSTED_GLASS: 'frostedGlass',
            BACKGROUND_ANIMATION: 'backgroundAnimation' // NEW: For pausing background effects
        };
        this.state = {
            editingId: null, 
            deleteMode: false, 
            selectedForDelete: new Set(), 
            dragSourceId: null,
            lastDeletedBackup: null, 
            undoTimer: null,
            selectedMonth: new Date().getMonth(),
            selectedYear: new Date().getFullYear(),
            hoverData: null,
            editingAccountId: null
        };
        this.init();
    }

    // Core initialization
    init() {
        this.cacheDOM();
        this.setDefaults();
        this.bindEvents();
        this.loadData();
        
        // Show accounts panel first if no accounts exist
        const accounts = this.getAccounts();
        if (accounts.length === 0) {
            this.showPanel('accounts');
        } else {
            this.showPanel(this.getTrades().length ? 'view' : 'add');
        }
        
        this.populateCalendarControls();
        this.initializeAnalyticsMode();
    }

    // DOM caching for performance
    cacheDOM() {
        this.dom = {};
        const ids = [
            'add-tab','view-tab','analytics-tab','accounts-tab','settings-tab',
            'add-panel','view-panel','analytics-panel','accounts-panel','settings-panel',
            'trade-form','trade-photo','file-preview','preview-placeholder','preview-wrap',
            'remove-photo','trade-type','trade-symbol','trade-timeframe','trade-date',
            'trade-pnl','entry-strategy','exit-strategy','trade-comment','save-btn',
            'clear-btn','trades-root','empty-msg','stats-bar','stat-total','stat-total-pnl',
            'stat-win','stat-avg','modal-bg','modal-content','close-modal',
            'toggle-delete-mode','bulk-actions','confirm-delete','cancel-delete',
            'filter-symbol','filter-type','filter-timeframe','sort-select','photo-only',
            'photo-only-img','toast-wrap','a-total','a-total-pnl','a-win',
            'a-avg','equityCanvas','monthlyCanvas','strategyCanvas','clear-all-settings',
            'show-equity','show-calendar','equity-view','calendar-view',
            'calendar-container','miniEquityCanvas','calendar-month','calendar-year',
            'calendar-controls','account-name-input','account-size-input','create-account-btn',
            'accounts-list','account-display','account-name','account-size','journal-title',
            'current-balance','account-total-pnl','account-return','account-win-rate',
            'day-trades-modal','day-trades-title','day-trades-content','close-day-trades',
            'equity-tooltip','symbolCanvas','timeframeCanvas','typeCanvas',
            'csv-modal','close-csv-modal','csv-account-select','export-csv-btn','import-csv-file',
            'backup-modal','close-backup-modal','backup-account-select','export-backup-btn','import-backup-file',
            'csv-import-export-btn','backup-import-btn','edit-account-modal','edit-account-name',
            'edit-account-size','close-edit-account','save-account-changes','cancel-edit-account',
            'analytics-display-mode', 'month-display', 'prev-month', 'next-month',
            'withdrawal-btn', 'withdrawal-modal', 'close-withdrawal', 'withdrawal-amount',
            'withdrawal-date', 'withdrawal-notes', 'confirm-withdrawal', 'no-preview','background-picture', 
            'background-picture-info', 'remove-background', 'frosted-glass-effect',
            'background-animation' // NEW: For pausing background effects
        ];
        
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) this.dom[id] = el;
        });
    }

    setDefaults() {
        if (this.dom['trade-date']) this.dom['trade-date'].value = new Date().toISOString().split('T')[0];
        if (this.dom['withdrawal-date']) this.dom['withdrawal-date'].value = new Date().toISOString().split('T')[0];
        this.updateSortSelect();
        this.loadBackgroundSettings();
        this.loadBackgroundAnimationSetting(); // NEW: Load background animation setting
    }

    // Storage utilities
    storage(key, value) {
        if (value === undefined) {
            try { 
                return JSON.parse(localStorage.getItem(key) || 
                    ('notes' in this.STORAGE_KEYS && key === this.STORAGE_KEYS.NOTES ? '""' : '[]')); 
            }
            catch(e) { 
                return key === this.STORAGE_KEYS.NOTES ? '' : []; 
            }
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    getTrades() { return this.storage(this.STORAGE_KEYS.TRADES); }
    setTrades(trades) { this.storage(this.STORAGE_KEYS.TRADES, trades); }
    getCustomOrder() { return this.storage(this.STORAGE_KEYS.CUSTOM_ORDER); }
    setCustomOrder(order) { this.storage(this.STORAGE_KEYS.CUSTOM_ORDER, order); }
    clearCustomOrder() { localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_ORDER); }
    getSortPref() { return localStorage.getItem(this.STORAGE_KEYS.SORT_PREF) || 'date-desc'; }
    setSortPref(pref) { localStorage.setItem(this.STORAGE_KEYS.SORT_PREF, pref); }
    getNotes() { return localStorage.getItem(this.STORAGE_KEYS.NOTES) || ''; }
    setNotes(notes) { localStorage.setItem(this.STORAGE_KEYS.NOTES, notes); }
    getAccounts() { return this.storage(this.STORAGE_KEYS.ACCOUNTS); }
    setAccounts(accounts) { this.storage(this.STORAGE_KEYS.ACCOUNTS, accounts); }
    getActiveAccount() { return localStorage.getItem(this.STORAGE_KEYS.ACTIVE_ACCOUNT); }
    setActiveAccount(accountId) { localStorage.setItem(this.STORAGE_KEYS.ACTIVE_ACCOUNT, accountId); }
    getAnalyticsMode() { return localStorage.getItem(this.STORAGE_KEYS.ANALYTICS_MODE) || 'currency'; }
    setAnalyticsMode(mode) { localStorage.setItem(this.STORAGE_KEYS.ANALYTICS_MODE, mode); }
    getWithdrawals() { return this.storage(this.STORAGE_KEYS.WITHDRAWALS); }
    setWithdrawals(withdrawals) { this.storage(this.STORAGE_KEYS.WITHDRAWALS, withdrawals); }
    getBackgroundAnimation() { 
        const setting = localStorage.getItem(this.STORAGE_KEYS.BACKGROUND_ANIMATION);
        return setting === null ? 'true' : setting; // Default to true (animations on)
    }
    setBackgroundAnimation(enabled) { 
        localStorage.setItem(this.STORAGE_KEYS.BACKGROUND_ANIMATION, enabled.toString()); 
    }

    // Check if account is selected
    canChangeTabs() {
        const accounts = this.getAccounts();
        const activeAccount = this.getActiveAccount();
        return accounts.length > 0 && activeAccount;
    }

    // Event binding with delegation
    bindEvents() {

        // Background and frosted glass settings
        this.on('background-picture', 'change', e => this.handleBackgroundUpload(e));
        this.on('remove-background', 'click', () => this.removeBackgroundImage());
        this.on('frosted-glass-effect', 'change', e => {
            this.applyFrostedGlass(e.target.checked);
            this.toast(`Frosted glass effect ${e.target.checked ? 'enabled' : 'disabled'}`, 2000);
        });
        
        // NEW: Background animation toggle
        this.on('background-animation', 'change', e => {
            this.toggleBackgroundAnimation(e.target.checked);
        });

        // Tab navigation
        ['add-tab','view-tab','analytics-tab','accounts-tab','settings-tab'].forEach(tab => {
            this.on(tab, 'click', () => this.showPanel(tab.split('-')[0]));
        });

        // Form events
        this.on('trade-form', 'submit', e => this.saveTrade(e));
        this.on('clear-btn', 'click', () => this.clearForm());
        this.on('trade-photo', 'change', e => this.previewImage(e));
        this.on('remove-photo', 'click', () => this.clearPreview());
        this.on('preview-wrap', 'click', () => this.dom['trade-photo'].click());

        // View controls
        this.on('toggle-delete-mode', 'click', () => this.toggleDeleteMode());
        this.on('confirm-delete', 'click', () => this.confirmBulkDelete());
        this.on('cancel-delete', 'click', () => this.cancelDeleteMode());

        // Data management
        this.on('clear-all-settings', 'click', () => this.clearAllData());

        // Analytics toggle
        this.on('show-equity', 'click', () => this.showEquityView());
        this.on('show-calendar', 'click', () => this.showCalendarView());
        this.on('prev-month', 'click', () => this.navigateMonth(-1));
        this.on('next-month', 'click', () => this.navigateMonth(1));
        this.on('calendar-year', 'change', () => this.handleCalendarYearChange());

        // Accounts management
        this.on('create-account-btn', 'click', () => this.createAccount());

        // Edit account modal
        this.on('close-edit-account', 'click', () => this.closeEditAccountModal());
        this.on('edit-account-modal', 'click', e => { 
            if (e.target === this.dom['edit-account-modal']) this.closeEditAccountModal(); 
        });
        this.on('cancel-edit-account', 'click', () => this.closeEditAccountModal());
        this.on('save-account-changes', 'click', () => this.saveAccountChanges());

        // Analytics mode
        this.on('analytics-display-mode', 'change', e => {
            this.setAnalyticsMode(e.target.value);
            this.refreshAnalytics();
            this.drawMiniEquityChart();
            this.toast(`Analytics mode changed to ${e.target.value === 'currency' ? 'Currency' : 'Percentage'}`, 2000);
        });

        // Filters & sort
        this.on('filter-symbol', 'change', () => this.renderTrades());
        this.on('filter-type', 'change', () => this.renderTrades());
        this.on('filter-timeframe', 'change', () => this.renderTrades());
        this.on('sort-select', 'change', e => this.handleSortChange(e));

        // Modal & UI
        this.on('close-modal', 'click', () => this.closeModal());
        this.on('modal-bg', 'click', e => { 
            if (e.target === this.dom['modal-bg']) this.closeModal(); 
        });
        this.on('photo-only', 'click', () => this.closePhotoViewer());
        this.on('close-day-trades', 'click', () => this.closeDayTradesModal());
        this.on('day-trades-modal', 'click', e => { 
            if (e.target === this.dom['day-trades-modal']) this.closeDayTradesModal(); 
        });

        // Settings
        this.on('csv-import-export-btn', 'click', () => this.openCsvModal());
        this.on('backup-import-btn', 'click', () => this.openBackupModal());
        this.on('close-csv-modal', 'click', () => this.closeCsvModal());
        this.on('close-backup-modal', 'click', () => this.closeBackupModal());
        this.on('csv-modal', 'click', e => { 
            if (e.target === this.dom['csv-modal']) this.closeCsvModal(); 
        });
        this.on('backup-modal', 'click', e => { 
            if (e.target === this.dom['backup-modal']) this.closeBackupModal(); 
        });
        this.on('export-csv-btn', 'click', () => this.exportCsv());
        this.on('import-csv-file', 'change', e => this.importCsv(e));
        this.on('export-backup-btn', 'click', () => this.backupData());
        this.on('import-backup-file', 'change', e => this.restoreData(e));

        // Withdrawal functionality
        this.on('withdrawal-btn', 'click', () => this.openWithdrawalModal());
        this.on('close-withdrawal', 'click', () => this.closeWithdrawalModal());
        this.on('withdrawal-modal', 'click', e => { 
            if (e.target === this.dom['withdrawal-modal']) this.closeWithdrawalModal(); 
        });
        this.on('confirm-withdrawal', 'click', () => this.recordWithdrawal());

        // Equity curve hover - FIXED: Added proper tooltip handling
        if (this.dom['equityCanvas']) {
            this.on(this.dom['equityCanvas'], 'mousemove', e => this.handleEquityHover(e));
            this.on(this.dom['equityCanvas'], 'mouseleave', () => this.hideEquityTooltip());
        }

        // Drag & drop for preview
        this.setupDragDrop();

        // Window resize for charts
        let resizeTimer;
        this.on(window, 'resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.dom['analytics-panel']?.style.display === 'block') {
                    this.refreshAnalytics();
                    if (this.dom['calendar-view'].style.display !== 'none') {
                        this.renderProfitCalendar();
                    }
                }
                if (this.dom['add-panel']?.style.display === 'block') {
                    this.drawMiniEquityChart();
                }
            }, 200);
        });
    }

    on(element, event, handler) {
        const el = typeof element === 'string' ? this.dom[element] : element;
        if (el) el.addEventListener(event, handler.bind(this));
    }

    // Analytics mode initialization
    initializeAnalyticsMode() {
        const mode = this.getAnalyticsMode();
        if (this.dom['analytics-display-mode']) {
            this.dom['analytics-display-mode'].value = mode;
        }
    }

    // NEW: Load background animation setting
    loadBackgroundAnimationSetting() {
        const backgroundAnimation = this.getBackgroundAnimation();
        if (this.dom['background-animation']) {
            this.dom['background-animation'].checked = backgroundAnimation === 'true';
            this.toggleBackgroundAnimation(backgroundAnimation === 'true');
        }
    }

    // NEW: Toggle background animation
    toggleBackgroundAnimation(enabled) {
        if (enabled) {
            document.body.classList.remove('no-background-animation');
        } else {
            document.body.classList.add('no-background-animation');
        }
        this.setBackgroundAnimation(enabled);
        this.toast(`Background animations ${enabled ? 'enabled' : 'disabled'}`, 2000);
    }

    // Settings modals
    openCsvModal() {
        this.populateAccountSelect('csv-account-select');
        this.dom['csv-modal'].classList.add('active');
        this.dom['csv-modal'].setAttribute('aria-hidden', 'false');
    }

    closeCsvModal() {
        this.dom['csv-modal'].classList.remove('active');
        this.dom['csv-modal'].setAttribute('aria-hidden', 'true');
    }

    openBackupModal() {
        this.populateAccountSelect('backup-account-select');
        this.dom['backup-modal'].classList.add('active');
        this.dom['backup-modal'].setAttribute('aria-hidden', 'false');
    }

    closeBackupModal() {
        this.dom['backup-modal'].classList.remove('active');
        this.dom['backup-modal'].setAttribute('aria-hidden', 'true');
    }

    // Background and frosted glass settings
    loadBackgroundSettings() {
        const backgroundImage = localStorage.getItem(this.STORAGE_KEYS.BACKGROUND_IMAGE);
        const frostedGlass = localStorage.getItem(this.STORAGE_KEYS.FROSTED_GLASS) !== 'false'; // Default to true if background exists
        
        if (backgroundImage) {
            this.applyBackgroundImage(backgroundImage);
            this.dom['background-picture-info'].textContent = 'Custom background loaded';
            this.dom['remove-background'].style.display = 'block';
            
            // Enable frosted glass by default when background is set
            if (frostedGlass) {
                this.dom['frosted-glass-effect'].checked = true;
                this.applyFrostedGlass(true);
            }
        } else {
            this.dom['frosted-glass-effect'].checked = false;
            this.applyFrostedGlass(false);
        }
    }

    applyBackgroundImage(imageData) {
        document.body.classList.add('custom-background');
        document.body.style.backgroundImage = `url(${imageData})`;
    }

    removeBackgroundImage() {
        document.body.classList.remove('custom-background');
        document.body.style.backgroundImage = '';
        localStorage.removeItem(this.STORAGE_KEYS.BACKGROUND_IMAGE);
        this.dom['background-picture-info'].textContent = 'No file selected';
        this.dom['remove-background'].style.display = 'none';
        
        // Disable frosted glass when background is removed
        this.dom['frosted-glass-effect'].checked = false;
        this.applyFrostedGlass(false);
    }

    applyFrostedGlass(enabled) {
        if (enabled) {
            document.body.classList.add('frosted-glass');
            localStorage.setItem(this.STORAGE_KEYS.FROSTED_GLASS, 'true');
        } else {
            document.body.classList.remove('frosted-glass');
            localStorage.setItem(this.STORAGE_KEYS.FROSTED_GLASS, 'false');
        }
    }

    handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.toast('Please select an image file', 2000);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = event => {
            const imageData = event.target.result;
            localStorage.setItem(this.STORAGE_KEYS.BACKGROUND_IMAGE, imageData);
            this.applyBackgroundImage(imageData);
            this.dom['background-picture-info'].textContent = file.name;
            this.dom['remove-background'].style.display = 'block';
            
            // Enable frosted glass by default when background is uploaded
            this.dom['frosted-glass-effect'].checked = true;
            this.applyFrostedGlass(true);
            
            this.toast('Background image updated', 2000);
        };
        reader.readAsDataURL(file);
    }

    // Withdrawal Modal
    openWithdrawalModal() {
        this.dom['withdrawal-modal'].classList.add('active');
        this.dom['withdrawal-modal'].setAttribute('aria-hidden', 'false');
    }

    closeWithdrawalModal() {
        this.dom['withdrawal-modal'].classList.remove('active');
        this.dom['withdrawal-modal'].setAttribute('aria-hidden', 'true');
    }

    async recordWithdrawal() {
        const amount = parseFloat(this.dom['withdrawal-amount'].value);
        const date = this.dom['withdrawal-date'].value;
        const notes = this.dom['withdrawal-notes'].value.trim();
        
        if (!amount || amount <= 0) {
            this.toast('Please enter a valid withdrawal amount', 2000);
            return;
        }
        
        if (!date) {
            this.toast('Please select a date', 2000);
            return;
        }
        
        const withdrawal = {
            id: Date.now(),
            amount: -Math.abs(amount), // Ensure negative value
            date: date,
            notes: notes,
            accountId: this.getActiveAccount(),
            type: 'withdrawal',
            timestamp: Date.now()
        };
        
        // Add as a trade with negative PnL
        const trade = {
            id: Date.now(),
            photo: '',
            type: 'withdrawal',
            symbol: 'WITHDRAWAL',
            timeframe: 'N/A',
            date: date,
            pnl: -Math.abs(amount),
            entry: 'Withdrawal',
            exit: 'Completed',
            comment: notes || 'Funds withdrawal',
            accountId: this.getActiveAccount(),
            timestamp: Date.now()
        };
        
        const trades = this.getTrades();
        trades.push(trade);
        this.setTrades(trades);
        
        // Also store in withdrawals for tracking
        const withdrawals = this.getWithdrawals();
        withdrawals.push(withdrawal);
        this.setWithdrawals(withdrawals);
        
        this.closeWithdrawalModal();
        this.renderTrades();
        this.refreshAnalytics();
        this.drawMiniEquityChart();
        
        this.toast(`Withdrawal of $${this.formatNumber(amount)} recorded`, 2000);
        
        // Reset form
        this.dom['withdrawal-amount'].value = '';
        this.dom['withdrawal-date'].value = new Date().toISOString().split('T')[0];
        this.dom['withdrawal-notes'].value = '';
    }

    populateAccountSelect(selectId) {
        const select = this.dom[selectId];
        if (!select) return;
        
        const accounts = this.getAccounts();
        let options = '<option value="all">All Accounts</option>';
        
        accounts.forEach(account => {
            options += `<option value="${account.id}">${this.escapeHtml(account.name)}</option>`;
        });
        
        select.innerHTML = options;
    }

    // Edit Account Modal
    closeEditAccountModal() {
        this.dom['edit-account-modal'].classList.remove('active');
        this.dom['edit-account-modal'].setAttribute('aria-hidden', 'true');
        this.state.editingAccountId = null;
    }

    saveAccountChanges() {
        const accountId = this.state.editingAccountId;
        const newName = this.dom['edit-account-name'].value.trim();
        const newSize = parseFloat(this.dom['edit-account-size'].value);
        
        if (!newName) {
            this.toast('Please enter an account name', 2000);
            return;
        }
        
        if (isNaN(newSize) || newSize <= 0) {
            this.toast('Invalid account size', 2000);
            return;
        }
        
        const accounts = this.getAccounts();
        const account = accounts.find(acc => acc.id === accountId);
        
        if (account) {
            account.name = newName;
            account.size = newSize;
            
            this.setAccounts(accounts);
            this.renderAccounts();
            this.updateAccountDisplay();
            this.refreshAnalytics();
            this.drawMiniEquityChart();
            
            this.closeEditAccountModal();
            this.toast('Account updated', 2000);
        }
    }

    // CSV Import/Export
    exportCsv() {
        const accountId = this.dom['csv-account-select'].value;
        let trades = this.getTrades();
        
        if (accountId !== 'all') {
            trades = trades.filter(t => t.accountId === accountId);
        }
        
        if (!trades.length) {
            this.toast('No trades to export', 2000);
            return;
        }
        
        const headers = ['Type', 'Symbol', 'Timeframe', 'Date', 'PnL', 'Entry Strategy', 'Exit Strategy', 'Comment'];
        const csvContent = [
            headers.join(','),
            ...trades.map(trade => [
                trade.type,
                `"${trade.symbol}"`,
                trade.timeframe,
                trade.date,
                trade.pnl,
                `"${trade.entry}"`,
                `"${trade.exit}"`,
                `"${trade.comment}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmic_journal_trades_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast('CSV exported successfully', 2000);
        this.closeCsvModal();
    }

    importCsv(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const accountId = this.dom['csv-account-select'].value;
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const csvText = event.target.result;
                const lines = csvText.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    this.toast('CSV file is empty or invalid', 2000);
                    return;
                }
                
                const headers = lines[0].split(',').map(h => h.trim());
                const trades = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = this.parseCsvLine(lines[i]);
                    
                    if (values.length < 5) {
                        console.warn(`Skipping line ${i+1}: insufficient columns`);
                        continue;
                    }
                    
                    // Parse FTMO CSV format
                    const type = values[2]?.toLowerCase().includes('buy') ? 'buy' : 'sell';
                    const symbol = values[4] || '';
                    const date = values[1] ? values[1].split(' ')[0] : '';
                    const pnl = parseFloat(values[12]) || 0;
                    
                    // Determine timeframe from trade duration
                    let timeframe = '1H'; // Default
                    if (values[13]) {
                        const duration = parseInt(values[13]);
                        if (duration <= 300) timeframe = '5min';
                        else if (duration <= 1800) timeframe = '30min';
                        else if (duration <= 3600) timeframe = '1H';
                        else if (duration <= 14400) timeframe = '4H';
                        else timeframe = '1D';
                    }
                    
                    const trade = {
                        id: Date.now() + i,
                        photo: '',
                        type: type,
                        symbol: symbol,
                        timeframe: timeframe,
                        date: date,
                        pnl: pnl,
                        entry: '',
                        exit: '',
                        comment: '',
                        accountId: accountId !== 'all' ? accountId : null
                    };
                    
                    trades.push(trade);
                }
                
                if (trades.length === 0) {
                    this.toast('No valid trades found in CSV', 2000);
                    return;
                }
                
                const existingTrades = this.getTrades();
                this.setTrades([...existingTrades, ...trades]);
                
                this.renderTrades();
                this.refreshAnalytics();
                this.drawMiniEquityChart();
                
                e.target.value = '';
                this.closeCsvModal();
                this.toast(`Imported ${trades.length} trades successfully`, 2000);
            } catch (err) {
                console.error('CSV import error:', err);
                this.toast('Failed to import CSV file', 2000);
            }
        };
        
        reader.readAsText(file);
    }

    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // Image handling
    setupDragDrop() {
        if (!this.dom['preview-wrap']) return;
        
        const events = {
            dragover: e => { 
                e.preventDefault(); 
                this.dom['preview-wrap'].style.borderColor = 'var(--accent)';
                this.dom['preview-wrap'].style.background = 'rgba(0, 255, 179, 0.1)';
            },
            dragleave: () => {
                this.dom['preview-wrap'].style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.dom['preview-wrap'].style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent)';
            },
            drop: e => {
                e.preventDefault();
                this.dom['preview-wrap'].style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.dom['preview-wrap'].style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent)';
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith('image/')) {
                    this.dom['trade-photo'].files = e.dataTransfer.files;
                    this.previewImage({ target: this.dom['trade-photo'] });
                }
            }
        };

        Object.entries(events).forEach(([event, handler]) => {
            this.dom['preview-wrap'].addEventListener(event, handler);
        });
    }

    previewImage(e) {
        const file = e.target.files[0];
        if (!file) return this.clearPreview();
        
        const reader = new FileReader();
        reader.onload = e => {
            this.dom['file-preview'].src = e.target.result;
            this.dom['file-preview'].style.display = 'block';
            this.dom['preview-placeholder'].style.display = 'none';
            this.dom['remove-photo'].style.display = 'inline-block';
            this.dom['no-preview'].style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    clearPreview() {
        this.dom['file-preview'].src = '';
        this.dom['file-preview'].style.display = 'none';
        this.dom['preview-placeholder'].style.display = 'flex';
        this.dom['remove-photo'].style.display = 'none';
        this.dom['trade-photo'].value = '';
        this.dom['no-preview'].style.display = 'flex';
    }

    // Trade management
    async saveTrade(e) {
        e.preventDefault();
        
        // Validate symbol format (should contain a slash)
        const symbol = this.dom['trade-symbol'].value.trim();
        if (!symbol.includes('/')) {
            this.toast('Symbol should be in format like EUR/USD', 3000);
            return;
        }
        
        // Validate timeframe format (should end with "min" or be one of the special cases)
        const timeframe = this.dom['trade-timeframe'].value.trim();
        if (!timeframe.endsWith('min') && !['1H', '4H', '1D', '1W', '1M'].includes(timeframe)) {
            this.toast('Timeframe should end with "min" (e.g., 15min) or be 1H, 4H, 1D, etc.', 3000);
            return;
        }
        
        let imgData = this.dom['file-preview'].src || '';
        if (this.dom['trade-photo'].files[0]) {
            try {
                imgData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(this.dom['trade-photo'].files[0]);
                });
            } catch(err) { console.warn('Image read error:', err); }
        }

        const trade = {
            id: this.state.editingId || Date.now(),
            photo: imgData || '',
            type: this.dom['trade-type'].value,
            symbol: symbol,
            timeframe: timeframe,
            date: this.dom['trade-date'].value || '',
            pnl: parseFloat(this.dom['trade-pnl'].value) || 0,
            entry: this.dom['entry-strategy'].value,
            exit: this.dom['exit-strategy'].value,
            comment: this.dom['trade-comment'].value || '',
            accountId: this.getActiveAccount() || null,
            // Add timestamp for proper ordering of same-day trades
            timestamp: this.state.editingId ? this.getTrades().find(t => t.id === this.state.editingId)?.timestamp || Date.now() : Date.now()
        };

        const trades = this.getTrades();
        const isEdit = !!this.state.editingId;
        
        if (isEdit) {
            const idx = trades.findIndex(t => t.id === this.state.editingId);
            if (idx !== -1) {
                trades[idx] = trade;
                this.toast('Trade updated ✅', 2200);
            }
        } else {
            trades.push(trade);
            this.toast('Trade saved ✅', 1800);
        }

        this.setTrades(trades);

        const customOrder = this.getCustomOrder();
        if (customOrder.length && !isEdit) {
            customOrder.push(String(trade.id));
            this.setCustomOrder(customOrder);
        }

        this.resetForm();
        await this.showPanel('view');
    }

    resetForm() {
        this.dom['trade-form'].reset();
        this.clearPreview();
        this.state.editingId = null;
        this.dom['save-btn'].textContent = 'Save Trade';
        this.dom['trade-date'].value = new Date().toISOString().split('T')[0];
    }

    clearForm() {
        if (!confirm('Clear form?')) return;
        this.resetForm();
    }

    loadTradeIntoForm(trade) {
        this.state.editingId = trade.id;
        this.dom['save-btn'].textContent = 'Update Trade';
        
        if (trade.photo) {
            this.dom['file-preview'].src = trade.photo;
            this.dom['file-preview'].style.display = 'block';
            this.dom['preview-placeholder'].style.display = 'none';
            this.dom['remove-photo'].style.display = 'inline-block';
            this.dom['no-preview'].style.display = 'none';
        } else {
            this.clearPreview();
        }
        
        this.dom['trade-type'].value = trade.type || 'buy';
        this.dom['trade-symbol'].value = trade.symbol || '';
        this.dom['trade-timeframe'].value = trade.timeframe || '';
        this.dom['trade-date'].value = trade.date || '';
        this.dom['trade-pnl'].value = trade.pnl || '';
        this.dom['entry-strategy'].value = trade.entry || '';
        this.dom['exit-strategy'].value = trade.exit || 'TP';
        this.dom['trade-comment'].value = trade.comment || '';
    }

    // Panel management
    async showPanel(name) {
        // Allow access to accounts panel and settings panel without account
        if (name !== 'accounts' && name !== 'settings' && !this.canChangeTabs()) {
            this.toast('Please create and select an account first', 3000);
            this.showPanel('accounts');
            return;
        }

        const target = this.dom[`${name}-panel`];
        if (!target) return;

        // Update tabs
        ['add-tab','view-tab','analytics-tab','accounts-tab','settings-tab'].forEach(tab => {
            this.dom[tab]?.classList.toggle('active', tab === `${name}-tab`);
        });

        // Fade out visible panels
        const visible = ['add-panel','view-panel','analytics-panel','accounts-panel','settings-panel']
            .map(id => this.dom[id])
            .filter(p => p?.style.display === 'block');

        visible.forEach(p => {
            p.style.transition = 'opacity 300ms ease';
            p.style.opacity = '0';
        });

        await new Promise(r => setTimeout(r, 300));
        visible.forEach(p => p.style.display = 'none');

        // Show target
        target.style.display = 'block';
        target.style.opacity = '0';
        requestAnimationFrame(() => {
            target.style.transition = 'opacity 300ms ease';
            target.style.opacity = '1';
        });

        // Refresh content
        if (name === 'view') this.renderTrades();
        if (name === 'analytics') this.refreshAnalytics();
        if (name === 'add') this.drawMiniEquityChart();
        if (name === 'accounts') this.renderAccounts();
    }

    // Trade rendering and filtering
    renderTrades() {
        const trades = this.getTrades();
        const root = this.dom['trades-root'];
        if (!root) return;

        root.innerHTML = '';

        if (!trades.length) {
            this.dom['empty-msg'].style.display = 'block';
            this.dom['stats-bar'].style.display = 'none';
            this.populateFilters([]);
            return;
        }

        this.dom['empty-msg'].style.display = 'none';
        this.updateStats(trades);
        this.populateFilters(trades);

        let filteredTrades = this.filterTrades(trades);
        filteredTrades = this.sortTrades(filteredTrades);
        
        filteredTrades.forEach(trade => root.appendChild(this.createTradeElement(trade)));
    }

    filterTrades(trades) {
        const fs = this.dom['filter-symbol']?.value || 'all';
        const ft = this.dom['filter-type']?.value || 'all';
        const ftime = this.dom['filter-timeframe']?.value || 'all';
        const activeAccount = this.getActiveAccount();

        return trades.filter(t => 
            (fs === 'all' || t.symbol === fs) &&
            (ft === 'all' || t.type === ft) &&
            (ftime === 'all' || t.timeframe === ftime) &&
            (!activeAccount || t.accountId === activeAccount)
        );
    }

    sortTrades(trades) {
        const sortBy = this.getSortPref();
        const sorted = [...trades];

        switch(sortBy) {
            case 'date-desc': 
                return sorted.sort((a,b) => {
                    // First by date (newest first), then by timestamp (newest first) for same dates
                    const dateCompare = new Date(b.date||0) - new Date(a.date||0);
                    return dateCompare !== 0 ? dateCompare : (b.timestamp || 0) - (a.timestamp || 0);
                });
            case 'date-asc': 
                return sorted.sort((a,b) => {
                    // First by date (oldest first), then by timestamp (oldest first) for same dates
                    const dateCompare = new Date(a.date||0) - new Date(b.date||0);
                    return dateCompare !== 0 ? dateCompare : (a.timestamp || 0) - (b.timestamp || 0);
                });
            case 'pnl-asc': return sorted.sort((a,b) => (a.pnl||0) - (b.pnl||0));
            case 'pnl-desc': return sorted.sort((a,b) => (b.pnl||0) - (a.pnl||0));
            case 'tp': return this.sortByExit(sorted, 'TP');
            case 'sl': return this.sortByExit(sorted, 'SL');
            case 'be': return this.sortByExit(sorted, 'BE');
            case 'custom': return this.applyCustomOrder(sorted);
            default: 
                return sorted.sort((a,b) => {
                    const dateCompare = new Date(b.date||0) - new Date(a.date||0);
                    return dateCompare !== 0 ? dateCompare : (b.timestamp || 0) - (a.timestamp || 0);
                });
        }
    }

    sortByExit(trades, strategy) {
        return trades.filter(t => (t.exit||'').toUpperCase() === strategy)
            .concat(trades.filter(t => (t.exit||'').toUpperCase() !== strategy));
    }

    applyCustomOrder(trades) {
        const order = this.getCustomOrder();
        if (!order.length) return trades.sort((a,b) => {
            const dateCompare = new Date(b.date||0) - new Date(a.date||0);
            return dateCompare !== 0 ? dateCompare : (b.timestamp || 0) - (a.timestamp || 0);
        });

        const map = new Map(trades.map(t => [String(t.id), t]));
        const ordered = order.map(id => map.get(id)).filter(Boolean);
        ordered.push(...trades.filter(t => !order.includes(String(t.id))));
        return ordered;
    }

    createTradeElement(trade) {
        const card = document.createElement('div');
        card.className = 'trade';
        card.dataset.id = trade.id;

        // Drag handle
        if (this.getSortPref() === 'custom') {
            const handle = document.createElement('div');
            handle.className = 'drag-handle';
            handle.title = 'Drag to reorder';
            handle.innerHTML = '⋮⋮';
            handle.draggable = true;
            
            handle.addEventListener('dragstart', (e) => {
                this.dragStart(e, trade.id);
            });
            
            handle.addEventListener('dragend', (e) => {
                this.dragEnd(e);
            });
            
            card.appendChild(handle);
            
            card.addEventListener('dragover', (e) => {
                this.dragOver(e);
            });
            
            card.addEventListener('drop', (e) => {
                this.dragDrop(e, trade.id);
            });
            
            card.addEventListener('dragenter', (e) => {
                this.dragEnter(e);
            });
            
            card.addEventListener('dragleave', (e) => {
                this.dragLeave(e);
            });
        }

        // Delete checkbox with custom design
        if (this.state.deleteMode) {
            const cbCol = document.createElement('div');
            cbCol.className = 'delete-checkbox';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = `delete-${trade.id}`;
            cb.checked = this.state.selectedForDelete.has(String(trade.id));
            cb.addEventListener('change', e => {
                e.target.checked ? this.state.selectedForDelete.add(String(trade.id)) 
                                : this.state.selectedForDelete.delete(String(trade.id));
                this.toggleBulkActions();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `delete-${trade.id}`;
            
            cbCol.appendChild(cb);
            cbCol.appendChild(label);
            card.appendChild(cbCol);
        }

        // Thumbnail
        const img = document.createElement('img');
        img.className = 'thumb';
        img.src = trade.photo && trade.photo.length > 8 ? trade.photo : this.placeholderDataURI();
        img.alt = 'Trade screenshot';

        // Info
        const info = document.createElement('div');
        info.className = 'info';
        
        const meta = document.createElement('div');
        meta.className = 'meta';
        const typeTag = document.createElement('div');
        typeTag.className = trade.type === 'buy' ? 'tag-buy' : 'tag-sell';
        typeTag.textContent = (trade.type || '').toUpperCase();
        
        meta.append(typeTag, ' · ', trade.symbol, ' · ', trade.timeframe || '', ' · ', trade.date || '');

        const pnl = document.createElement('div');
        pnl.className = `pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`;
        
        // Format PnL based on display mode
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
        const accountSize = activeAccount ? activeAccount.size : 0;
        pnl.textContent = this.formatPnL(trade.pnl || 0, accountSize);

        const strategy = document.createElement('div');
        strategy.className = 'small';
        strategy.style.color = 'var(--muted)';
        strategy.innerHTML = `Entry: ${this.escapeHtml(trade.entry||'')} &nbsp;&nbsp;|&nbsp;&nbsp; Exit: ${this.escapeHtml(trade.exit||'')}`;

        info.append(meta, pnl, strategy);
        card.append(img, info);

        // Event handlers
        if (!this.state.deleteMode) {
            card.addEventListener('click', () => this.openModal(trade));
            img.addEventListener('click', e => {
                e.stopPropagation();
                this.openPhotoViewer(img.src);
            });
        } else {
            card.style.cursor = 'default';
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-checkbox')) {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                }
            });
        }

        return card;
    }

    // Drag & drop implementation
    dragStart(e, tradeId) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tradeId);
        this.state.dragSourceId = tradeId;
        
        const card = e.target.closest('.trade');
        card.classList.add('dragging');
        
        setTimeout(() => {
            card.style.opacity = '0.4';
        }, 0);
    }

    dragEnd(e) {
        const card = e.target.closest('.trade');
        card.classList.remove('dragging');
        card.style.opacity = '1';
        
        document.querySelectorAll('.trade.drag-over').forEach(t => {
            t.classList.remove('drag-over');
        });
        
        this.state.dragSourceId = null;
    }

    dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    dragEnter(e) {
        e.preventDefault();
        const card = e.target.closest('.trade');
        if (card && card.dataset.id !== this.state.dragSourceId) {
            card.classList.add('drag-over');
        }
    }

    dragLeave(e) {
        const card = e.target.closest('.trade');
        if (card && !card.contains(e.relatedTarget)) {
            card.classList.remove('drag-over');
        }
    }

    dragDrop(e, targetId) {
        e.preventDefault();
        e.stopPropagation();
        
        const sourceId = this.state.dragSourceId;
        if (!sourceId || !targetId || sourceId === targetId) return;

        let customOrder = this.getCustomOrder();
        const trades = this.getTrades();
        
        if (!customOrder.length) {
            customOrder = trades.map(t => String(t.id));
        }

        const sourceIndex = customOrder.indexOf(String(sourceId));
        const targetIndex = customOrder.indexOf(String(targetId));
        
        if (sourceIndex === -1 || targetIndex === -1) {
            const currentOrder = Array.from(document.querySelectorAll('.trade')).map(card => card.dataset.id);
            this.setCustomOrder(currentOrder);
            return;
        }

        customOrder.splice(sourceIndex, 1);
        customOrder.splice(targetIndex, 0, String(sourceId));
        
        this.setCustomOrder(customOrder);
        this.setSortPref('custom');
        this.dom['sort-select'].value = 'custom';
        
        const card = e.target.closest('.trade');
        if (card) {
            card.classList.remove('drag-over');
        }
        
        this.renderTrades();
        this.toast('Trade order updated', 2000);
    }

    // Delete mode
    toggleDeleteMode() {
        this.state.deleteMode = !this.state.deleteMode;
        this.state.selectedForDelete.clear();
        this.updateDeleteUI();
        this.renderTrades();
    }

    updateDeleteUI() {
        const btn = this.dom['toggle-delete-mode'];
        const actions = this.dom['bulk-actions'];
        if (!btn || !actions) return;

        if (this.state.deleteMode) {
            btn.textContent = 'Delete Mode: Select';
            btn.classList.add('active');
            actions.style.display = 'flex';
        } else {
            btn.textContent = 'Delete Trades';
            btn.classList.remove('active');
            actions.style.display = 'none';
        }
    }

    toggleBulkActions() {
        this.dom['bulk-actions'].style.display = 'flex';
    }

    confirmBulkDelete() {
        if (this.state.selectedForDelete.size === 0) return;
        
        const trades = this.getTrades();
        this.state.lastDeletedBackup = trades.filter(t => this.state.selectedForDelete.has(String(t.id)));

        if (!confirm(`Delete ${this.state.selectedForDelete.size} trade(s)? You can undo briefly.`)) {
            this.state.lastDeletedBackup = null;
            return;
        }

        const remaining = trades.filter(t => !this.state.selectedForDelete.has(String(t.id)));
        this.setTrades(remaining);
        this.state.selectedForDelete.clear();
        this.state.deleteMode = false;
        this.updateDeleteUI();
        this.renderTrades();
        
        this.toast(`${this.state.lastDeletedBackup.length} trade(s) deleted`, {
            timeout: 6000, undo: true, onUndo: () => this.undoDelete()
        });

        if (this.state.undoTimer) clearTimeout(this.state.undoTimer);
        this.state.undoTimer = setTimeout(() => {
            this.state.lastDeletedBackup = null;
            this.state.undoTimer = null;
        }, 6000);
    }

    cancelDeleteMode() {
        this.state.deleteMode = false;
        this.state.selectedForDelete.clear();
        this.updateDeleteUI();
        this.renderTrades();
    }

    undoDelete() {
        if (!this.state.lastDeletedBackup?.length) return;
        const existing = this.getTrades();
        this.setTrades(existing.concat(this.state.lastDeletedBackup));
        this.state.lastDeletedBackup = null;
        if (this.state.undoTimer) {
            clearTimeout(this.state.undoTimer);
            this.state.undoTimer = null;
        }
        this.renderTrades();
        this.toast('Delete undone', 2000);
    }

    // Modal system - UPDATED with image on left and details on right
    openModal(trade) {
        const imageHtml = `
            <div class="modal-image-container">
                <img id="modal-image" src="${trade.photo || this.placeholderDataURI()}" alt="Trade screenshot" class="modal-trade-image">
                <div class="image-click-hint">Click image to zoom</div>
            </div>
        `;
        
        // Format PnL for display
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
        const accountSize = activeAccount ? activeAccount.size : 0;
        const displayPnL = this.formatPnL(trade.pnl || 0, accountSize);
        
        const infoHtml = `
            <div class="modal-info-container">
                <h3 style="margin:0 0 12px">${this.escapeHtml(trade.symbol)} — <span style="color:${trade.type === 'buy' ? 'var(--accent)' : 'var(--danger)'}">${this.escapeHtml((trade.type||'').toUpperCase())}</span></h3>
                <div class="modal-detail-row">
                    <div class="modal-detail-item">
                        <label>Timeframe:</label>
                        <span>${this.escapeHtml(trade.timeframe||'')}</span>
                    </div>
                    <div class="modal-detail-item">
                        <label>Date:</label>
                        <span>${this.escapeHtml(trade.date||'(none)')}</span>
                    </div>
                </div>
                <div class="modal-detail-row">
                    <div class="modal-detail-item">
                        <label>PnL:</label>
                        <span style="color:${trade.pnl>=0?'var(--accent)':'var(--danger)'}">${displayPnL}</span>
                    </div>
                </div>
                <div class="modal-detail-section">
                    <label>Entry Strategy:</label>
                    <div class="modal-detail-value">${this.escapeHtml(trade.entry)}</div>
                </div>
                <div class="modal-detail-section">
                    <label>Exit Strategy:</label>
                    <div class="modal-detail-value">${this.escapeHtml(trade.exit)}</div>
                </div>
                <div class="modal-detail-section">
                    <label>Comment:</label>
                    <div class="modal-detail-comment">${this.escapeHtml(trade.comment)}</div>
                </div>
                <div class="modal-actions">
                    <button class="edit-btn" id="modal-edit">Edit Trade</button>
                    <button class="delete-btn" id="modal-close">Close</button>
                </div>
            </div>
        `;

        this.dom['modal-content'].innerHTML = `
            <div class="modal-grid">
                ${imageHtml}
                ${infoHtml}
            </div>
        `;
        
        this.dom['modal-bg'].classList.add('active');
        this.dom['modal-bg'].setAttribute('aria-hidden', 'false');

        const modalImage = document.getElementById('modal-image');
        if (modalImage) {
            modalImage.addEventListener('click', e => {
                e.stopPropagation();
                this.openPhotoViewer(modalImage.src);
            });
        }

        document.getElementById('modal-edit').addEventListener('click', e => {
            e.stopPropagation();
            this.loadTradeIntoForm(trade);
            this.closeModal();
            this.showPanel('add');
        });

        document.getElementById('modal-close').addEventListener('click', e => {
            e.stopPropagation();
            this.closeModal();
        });
    }

    closeModal() {
        this.dom['modal-bg'].classList.remove('active');
        this.dom['modal-bg'].setAttribute('aria-hidden', 'true');
    }

    openPhotoViewer(src) {
        this.dom['photo-only-img'].src = src;
        this.dom['photo-only'].classList.add('active');
        this.dom['photo-only'].setAttribute('aria-hidden', 'false');
    }

    closePhotoViewer() {
        this.dom['photo-only'].classList.remove('active');
        this.dom['photo-only'].setAttribute('aria-hidden', 'true');
    }

    // Data management
    backupData() {
        const accountId = this.dom['backup-account-select'].value;
        let trades = this.getTrades();
        
        if (accountId !== 'all') {
            trades = trades.filter(t => t.accountId === accountId);
        }
        
        const payload = {
            trades: trades,
            notes: this.getNotes(),
            customOrder: this.getCustomOrder(),
            sortBy: this.getSortPref(),
            accounts: this.getAccounts(),
            activeAccount: this.getActiveAccount(),
            analyticsMode: this.getAnalyticsMode(),
            withdrawals: this.getWithdrawals(),
            backgroundAnimation: this.getBackgroundAnimation(), // NEW: Save background animation setting
            backupDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmic_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast('Backup downloaded', 1800);
        this.closeBackupModal();
    }

    restoreData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data.trades)) this.setTrades(data.trades);
                if (typeof data.notes === 'string') this.setNotes(data.notes);
                if (Array.isArray(data.customOrder)) this.setCustomOrder(data.customOrder);
                if (typeof data.sortBy === 'string') this.setSortPref(data.sortBy);
                if (Array.isArray(data.accounts)) this.setAccounts(data.accounts);
                if (typeof data.activeAccount === 'string') this.setActiveAccount(data.activeAccount);
                if (typeof data.analyticsMode === 'string') this.setAnalyticsMode(data.analyticsMode);
                if (Array.isArray(data.withdrawals)) this.setWithdrawals(data.withdrawals);
                if (typeof data.backgroundAnimation === 'string') this.setBackgroundAnimation(data.backgroundAnimation); // NEW: Restore background animation

                this.renderTrades();
                this.renderAccounts();
                this.initializeAnalyticsMode();
                this.loadBackgroundAnimationSetting(); // NEW: Apply restored background animation setting
                e.target.value = '';
                this.closeBackupModal();
                this.toast('Restore complete', 2000);
            } catch(err) {
                console.error('Restore error:', err);
                this.toast('Restore failed', 2200);
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (!confirm('Clear ALL trades, notes, and settings? This cannot be undone.')) return;
        localStorage.clear();
        this.renderTrades();
        this.renderAccounts();
        this.toast('Cleared all data', 1800);
        // Remove background settings when clearing all data
        this.removeBackgroundImage();
        localStorage.removeItem(this.STORAGE_KEYS.FROSTED_GLASS);
        // Reset background animation to default (enabled)
        this.setBackgroundAnimation('true');
        if (this.dom['background-animation']) {
            this.dom['background-animation'].checked = true;
            this.toggleBackgroundAnimation(true);
        }
    }

    // Analytics
    refreshAnalytics() {
        const data = this.computeAnalytics();
        if (!data) return;

        this.dom['a-total'].textContent = data.total;
        
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
        const accountSize = activeAccount ? activeAccount.size : 0;
        
        this.dom['a-total-pnl'].textContent = this.formatPnL(data.totalPnL, accountSize);
        this.dom['a-total-pnl'].style.color = data.totalPnL >= 0 ? 'var(--accent)' : 'var(--danger)';
        
        this.dom['a-win'].textContent = data.winRate.toFixed(1) + '%';
        
        this.dom['a-avg'].textContent = this.formatPnL(data.avg, accountSize);
        this.dom['a-avg'].style.color = data.avg >= 0 ? 'var(--accent)' : 'var(--danger)';

        this.drawEquityChart(data.equityPoints);
        this.drawBarChart(this.dom['monthlyCanvas'], data.months.map(m => m.replace('-','/')), data.monthValues, 'Monthly Performance', accountSize);
        this.drawBarChart(this.dom['strategyCanvas'], data.strategyStats.map(s => s.strategy), data.strategyStats.map(s => s.pnl), 'Entry Strategy Performance', accountSize);
        
        this.drawBarChart(this.dom['symbolCanvas'], data.symbolStats.map(s => s.symbol), data.symbolStats.map(s => s.pnl), 'Symbol Performance', accountSize);
        this.drawBarChart(this.dom['timeframeCanvas'], data.timeframeStats.map(t => t.timeframe), data.timeframeStats.map(t => t.pnl), 'Timeframe Performance', accountSize);
        this.drawBarChart(this.dom['typeCanvas'], data.typeStats.map(t => t.type), data.typeStats.map(t => t.pnl), 'Trade Type Performance', accountSize);
        
        if (this.dom['calendar-view'].style.display !== 'none') {
            this.renderProfitCalendar();
        }
    }

    computeAnalytics() {
        let trades = this.getTrades();
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        if (!trades.length) return null;

        const total = trades.length;
        // FIXED: Include BE trades in PnL calculations
        const totalPnL = trades.reduce((s,t) => s + (t.pnl||0), 0);
        // For win rate, still exclude BE trades
        const nonBE = trades.filter(t => (t.exit||'') !== 'BE');
        const wins = nonBE.filter(t => t.pnl > 0).length;
        const winRate = nonBE.length ? (wins / nonBE.length) * 100 : 0;
        // For average PnL, include all trades (including BE)
        const avg = trades.length ? trades.reduce((s,t) => s + (t.pnl||0), 0) / trades.length : 0;

        let cum = 0;
        const equityPoints = trades.map(t => {
            cum += t.pnl||0;
            return { x: t.date||'', y: cum };
        });

        const monthMap = new Map();
        trades.forEach(t => {
            const k = this.monthKey(t.date);
            monthMap.set(k, (monthMap.get(k)||0) + (t.pnl||0));
        });
        const months = Array.from(monthMap.keys()).sort();
        const monthValues = months.map(m => monthMap.get(m));

        const strategies = ['Candle close','Flip','Candle break'];
        const strategyStats = strategies.map(s => {
            const arr = trades.filter(t => (t.entry||'') === s);
            const count = arr.length;
            const pnl = arr.reduce((s2,t) => s2 + (t.pnl||0), 0);
            const winsCount = arr.filter(t => t.pnl > 0).length;
            const winRateLocal = arr.length ? (winsCount/arr.length)*100 : 0;
            return { strategy: s, count, pnl, winRate: winRateLocal };
        });

        const symbolMap = new Map();
        trades.forEach(t => {
            const sym = t.symbol || '(none)';
            symbolMap.set(sym, (symbolMap.get(sym) || 0) + (t.pnl || 0));
        });
        const symbolStats = Array.from(symbolMap.entries()).map(([symbol, pnl]) => ({ symbol, pnl }));

        const timeframeMap = new Map();
        trades.forEach(t => {
            const tf = t.timeframe || '(none)';
            timeframeMap.set(tf, (timeframeMap.get(tf) || 0) + (t.pnl || 0));
        });
        const timeframeStats = Array.from(timeframeMap.entries()).map(([timeframe, pnl]) => ({ timeframe, pnl }));

        const typeMap = new Map();
        trades.forEach(t => {
            const type = t.type || '(none)';
            typeMap.set(type, (typeMap.get(type) || 0) + (t.pnl || 0));
        });
        const typeStats = Array.from(typeMap.entries()).map(([type, pnl]) => ({ type, pnl }));

        return {
            total, totalPnL, winRate, avg, equityPoints, months, monthValues, 
            strategyStats, symbolStats, timeframeStats, typeStats, trades
        };
    }

    drawEquityChart(points) {
        const canvas = this.dom['equityCanvas'];
        if (!canvas) return;
        
        let trades = this.getTrades();
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        if (!trades.length) {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth, h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0,0,w,h);
            
            ctx.fillStyle = 'var(--muted)';
            ctx.font = '14px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No trades yet - equity curve will appear here', w/2, h/2);
            return;
        }

        // Use the same logic as mini equity chart
        this.drawMiniEquityChartForAnalytics(canvas, points, trades);
    }

    drawMiniEquityChartForAnalytics(canvas, points, trades) {
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
        const accountSize = activeAccount ? activeAccount.size : 0;

        // FIXED: Start mini equity curve from account size
        let cum = accountSize;
        const balancePoints = [{ x: '', y: accountSize }];
        
        trades.forEach(trade => {
            cum += trade.pnl||0;
            balancePoints.push({ x: trade.date||'', y: cum });
        });

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0,0,w,h);

        const margin = { left:40, right:20, top:16, bottom:36 };
        const plotW = w - margin.left - margin.right;
        const plotH = h - margin.top - margin.bottom;

        const ys = balancePoints.map(p => p.y||0);
        const minY = Math.min(...ys, accountSize);
        const maxY = Math.max(...ys, accountSize);
        const yRange = (maxY - minY) || 1;

        const xToPx = i => margin.left + (i/(balancePoints.length-1||1)) * plotW;
        const yToPx = v => margin.top + plotH - ((v - minY)/yRange) * plotH;

        // Dotted line for account size
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const accountY = yToPx(accountSize);
        ctx.moveTo(margin.left, accountY);
        ctx.lineTo(margin.left + plotW, accountY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        let lastColor = null;
        
        balancePoints.forEach((p,i) => {
            const x = xToPx(i);
            const y = yToPx(p.y);
            const isProfit = p.y >= accountSize;
            const currentColor = isProfit ? 'rgba(0,255,179,0.9)' : 'rgba(255,77,77,0.9)';
            
            if (i === 0) {
                ctx.moveTo(x, y);
                lastColor = currentColor;
            } else {
                const prevPoint = balancePoints[i-1];
                const prevIsProfit = prevPoint.y >= accountSize;
                
                if (isProfit !== prevIsProfit) {
                    const ratio = (accountSize - prevPoint.y) / (p.y - prevPoint.y);
                    const crossX = xToPx(i-1) + (x - xToPx(i-1)) * ratio;
                    const crossY = yToPx(accountSize);
                    
                    ctx.lineTo(crossX, crossY);
                    ctx.strokeStyle = lastColor;
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(crossX, crossY);
                    ctx.lineTo(x, y);
                    lastColor = currentColor;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        });
        
        ctx.strokeStyle = lastColor;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        balancePoints.forEach((p,i) => {
            const x = xToPx(i);
            const y = yToPx(p.y);
            const isProfit = p.y >= accountSize;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = isProfit ? 'rgba(0,255,179,0.9)' : 'rgba(255,77,77,0.9)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        ctx.beginPath();
        balancePoints.forEach((p,i) => {
            const x = xToPx(i), y = yToPx(p.y);
            i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });
        ctx.lineTo(margin.left+plotW, margin.top+plotH);
        ctx.lineTo(margin.left, margin.top+plotH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top+plotH);
        const finalBalance = balancePoints[balancePoints.length-1]?.y || accountSize;
        if (finalBalance >= accountSize) {
            grad.addColorStop(0, 'rgba(0,255,179,0.12)');
            grad.addColorStop(1, 'rgba(0,255,179,0.02)');
        } else {
            grad.addColorStop(0, 'rgba(255,77,77,0.12)');
            grad.addColorStop(1, 'rgba(255,77,77,0.02)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '600 13px Poppins, sans-serif';
        const lastVal = finalBalance;
        const label = `$${this.formatNumber(lastVal.toFixed(2))}`;
        ctx.fillText(label, margin.left + plotW - ctx.measureText(label).width, margin.top - 2);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`Account: $${this.formatNumber(accountSize.toFixed(2))}`, margin.left, accountY - 4);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '12px Poppins, sans-serif';
        const firstDate = points[0]?.x ? points[0].x.slice(0,10) : '';
        const lastDate = points[points.length-1]?.x ? points[points.length-1].x.slice(0,10) : '';
        ctx.fillText(firstDate, margin.left, margin.top+plotH+20);
        ctx.fillText(lastDate, margin.left+plotW - ctx.measureText(lastDate).width, margin.top+plotH+20);

        this.state.equityData = {
            points: balancePoints,
            trades: trades,
            accountSize: accountSize,
            xToPx: xToPx,
            yToPx: yToPx,
            margin: margin,
            plotW: plotW,
            plotH: plotH
        };
    }

    // FIXED: Improved tooltip positioning and display
    // FIXED: Improved tooltip positioning - now right above cursor
    handleEquityHover(e) {
        if (!this.state.equityData) return;
        
        const rect = this.dom['equityCanvas'].getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const { points, trades, xToPx, yToPx, margin, plotW, plotH, accountSize } = this.state.equityData;
        
        let closestIndex = 0;
        let minDistance = Infinity;
        
        points.forEach((point, i) => {
            const pointX = xToPx(i);
            const pointY = yToPx(point.y);
            const distance = Math.sqrt(Math.pow(pointX - x, 2) + Math.pow(pointY - y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        });
        
        if (minDistance > 30) {
            this.hideEquityTooltip();
            return;
        }
        
        const closestPoint = points[closestIndex];
        if (!closestPoint) {
            this.hideEquityTooltip();
            return;
        }
        
        const tooltip = this.dom['equity-tooltip'];
        const date = new Date(closestPoint.x).toLocaleDateString();
        const balance = closestPoint.y;
        const pnl = balance - accountSize;
        const trade = trades[closestIndex - 1]; // -1 because points includes starting balance
        
        let tradeInfo = '';
        if (trade && closestIndex > 0) {
            tradeInfo = `
                <div style="margin-top:4px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px">
                    <div>${trade.symbol} • ${trade.type.toUpperCase()}</div>
                    <div>PnL: ${trade.pnl >= 0 ? '+' : ''}$${this.formatNumber(trade.pnl?.toFixed(2) || '0.00')}</div>
                </div>
            `;
        }
        
        tooltip.innerHTML = `
            <div><strong>${date}</strong></div>
            <div>Balance: $${this.formatNumber(balance.toFixed(2))}</div>
            <div>PnL: ${pnl >= 0 ? '+' : ''}$${this.formatNumber(pnl.toFixed(2))}</div>
            ${tradeInfo}
        `;
        
        // Show tooltip first to calculate its dimensions
        tooltip.style.display = 'block';
        tooltip.classList.add('active');
        
        const tooltipRect = tooltip.getBoundingClientRect();
        const cursorX = e.clientX;
        const cursorY = e.clientY;
        
        // Position tooltip right above the cursor (5px above)
        let left = cursorX;
        let top = cursorY - tooltipRect.height - 5; // 5px above cursor
        
        // Adjust if tooltip goes off the screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Check right edge
        if (left + tooltipRect.width > windowWidth - 10) {
            left = cursorX - tooltipRect.width;
        }
        
        // Check left edge
        if (left < 10) {
            left = 10;
        }
        
        // Check top edge - if there's not enough space above, show below cursor
        if (top < 10) {
            top = cursorY + 15; // 15px below cursor
        }
        
        // Check bottom edge
        if (top + tooltipRect.height > windowHeight - 10) {
            top = cursorY - tooltipRect.height - 15;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    hideEquityTooltip() {
        if (this.dom['equity-tooltip']) {
            this.dom['equity-tooltip'].classList.remove('active');
            setTimeout(() => {
                this.dom['equity-tooltip'].style.display = 'none';
            }, 150);
        }
    }

    // Mini equity chart for Add Trade tab
    drawMiniEquityChart() {
        const canvas = this.dom['miniEquityCanvas'];
        if (!canvas) return;
        
        let trades = this.getTrades();
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        if (!trades.length) {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth, h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0,0,w,h);
            
            ctx.fillStyle = 'var(--muted)';
            ctx.font = '12px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No trades yet', w/2, h/2);
            return;
        }

        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        const accountSize = activeAccount ? activeAccount.size : 0;

        // FIXED: Start mini equity curve from account size
        let cum = accountSize;
        const balancePoints = [{ x: '', y: accountSize }];
        
        trades.forEach(trade => {
            cum += trade.pnl||0;
            balancePoints.push({ x: trade.date||'', y: cum });
        });

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0,0,w,h);

        const margin = { left:10, right:10, top:10, bottom:20 };
        const plotW = w - margin.left - margin.right;
        const plotH = h - margin.top - margin.bottom;

        const ys = balancePoints.map(p => p.y||0);
        const minY = Math.min(...ys, accountSize);
        const maxY = Math.max(...ys, accountSize);
        const yRange = (maxY - minY) || 1;

        const xToPx = i => margin.left + (i/(balancePoints.length-1||1)) * plotW;
        const yToPx = v => margin.top + plotH - ((v - minY)/yRange) * plotH;

        // Dotted line for account size
        ctx.setLineDash([3, 2]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const accountY = yToPx(accountSize);
        ctx.moveTo(margin.left, accountY);
        ctx.lineTo(margin.left + plotW, accountY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        let lastColor = null;
        
        balancePoints.forEach((p,i) => {
            const x = xToPx(i);
            const y = yToPx(p.y);
            const isProfit = p.y >= accountSize;
            const currentColor = isProfit ? 'rgba(0,255,179,0.9)' : 'rgba(255,77,77,0.9)';
            
            if (i === 0) {
                ctx.moveTo(x, y);
                lastColor = currentColor;
            } else {
                const prevPoint = balancePoints[i-1];
                const prevIsProfit = prevPoint.y >= accountSize;
                
                if (isProfit !== prevIsProfit) {
                    const ratio = (accountSize - prevPoint.y) / (p.y - prevPoint.y);
                    const crossX = xToPx(i-1) + (x - xToPx(i-1)) * ratio;
                    const crossY = yToPx(accountSize);
                    
                    ctx.lineTo(crossX, crossY);
                    ctx.strokeStyle = lastColor;
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(crossX, crossY);
                    ctx.lineTo(x, y);
                    lastColor = currentColor;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        });
        
        ctx.strokeStyle = lastColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        balancePoints.forEach((p,i) => {
            const x = xToPx(i), y = yToPx(p.y);
            i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });
        ctx.lineTo(margin.left+plotW, margin.top+plotH);
        ctx.lineTo(margin.left, margin.top+plotH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top+plotH);
        const finalBalance = balancePoints[balancePoints.length-1]?.y || accountSize;
        if (finalBalance >= accountSize) {
            grad.addColorStop(0, 'rgba(0,255,179,0.12)');
            grad.addColorStop(1, 'rgba(0,255,179,0.02)');
        } else {
            grad.addColorStop(0, 'rgba(255,77,77,0.12)');
            grad.addColorStop(1, 'rgba(255,77,77,0.02)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '600 10px Poppins, sans-serif';
        const lastVal = finalBalance;
        const label = `$${this.formatNumber(lastVal.toFixed(2))}`;
        ctx.fillText(label, margin.left + plotW - ctx.measureText(label).width, margin.top - 2);
    }

    drawBarChart(canvas, labels, values, title = '', accountSize = null) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0,0,w,h);

        if (!labels.length) {
            ctx.fillStyle = 'var(--muted)';
            ctx.font = '12px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', w/2, h/2);
            return;
        }

        // Increased bottom margin to accommodate labels
        const margin = { left:40, right:14, top:16, bottom:50 };
        const plotW = w - margin.left - margin.right;
        const plotH = h - margin.top - margin.bottom;

        const ys = values.map(v => Number(v)||0);
        const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 0);
        const yRange = (maxY - minY) || 1;

        const barW = plotW / ys.length * 0.7;
        ys.forEach((v,i) => {
            const x = margin.left + (i)*(plotW/ys.length) + (plotW/ys.length - barW)/2;
            const hbar = ((v-minY)/yRange)*plotH;
            const y = margin.top + plotH - hbar;
            ctx.fillStyle = v >= 0 ? 'rgba(0,255,179,0.9)' : 'rgba(255,77,77,0.9)';
            ctx.fillRect(x, y, barW, hbar);
        });

        // Improved label positioning
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = '10px Poppins, sans-serif';
        ctx.textAlign = 'center';
        
        labels.forEach((text,i) => {
            const x = margin.left + (i)*(plotW/labels.length) + (plotW/labels.length)/2;
            const y = margin.top + plotH + 20;
            
            // For longer labels, use a smaller font or wrap text
            let displayText = text;
            if (text.length > 10) {
                // Truncate very long labels
                displayText = text.substring(0, 10) + '...';
                ctx.font = '9px Poppins, sans-serif';
            } else if (text.length > 6) {
                ctx.font = '9px Poppins, sans-serif';
            } else {
                ctx.font = '10px Poppins, sans-serif';
            }
            
            // Draw the label horizontally instead of at an angle
            ctx.fillText(displayText, x, y);
            
            // Reset font for next iteration
            ctx.font = '10px Poppins, sans-serif';
        });
    }

    // Calendar View Functions - Weekdays Only
    showEquityView() {
        this.dom['equity-view'].style.display = 'flex';
        this.dom['calendar-view'].style.display = 'none';
        this.dom['calendar-controls'].style.display = 'none';
        this.dom['show-equity'].classList.add('active');
        this.dom['show-calendar'].classList.remove('active');
        // FIXED: Re-render equity chart when switching back from calendar
        this.refreshAnalytics();
    }

    showCalendarView() {
        this.dom['equity-view'].style.display = 'none';
        this.dom['calendar-view'].style.display = 'block';
        this.dom['calendar-controls'].style.display = 'flex';
        this.dom['show-equity'].classList.remove('active');
        this.dom['show-calendar'].classList.add('active');
        this.renderProfitCalendar();
    }

    populateCalendarControls() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Set initial month display
        this.updateMonthDisplay();
        
        const currentYear = new Date().getFullYear();
        let yearOptions = '';
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            const selected = year === this.state.selectedYear ? ' selected' : '';
            yearOptions += `<option value="${year}"${selected}>${year}</option>`;
        }
        this.dom['calendar-year'].innerHTML = yearOptions;
    }

    updateMonthDisplay() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.dom['month-display'].textContent = `${months[this.state.selectedMonth]} ${this.state.selectedYear}`;
    }

    navigateMonth(direction) {
        this.state.selectedMonth += direction;
        
        if (this.state.selectedMonth > 11) {
            this.state.selectedMonth = 0;
            this.state.selectedYear++;
        } else if (this.state.selectedMonth < 0) {
            this.state.selectedMonth = 11;
            this.state.selectedYear--;
        }
        
        this.updateMonthDisplay();
        this.renderProfitCalendar();
    }

    handleCalendarYearChange() {
        this.state.selectedYear = parseInt(this.dom['calendar-year'].value);
        this.updateMonthDisplay();
        this.renderProfitCalendar();
    }

    renderProfitCalendar() {
        const container = this.dom['calendar-container'];
        if (!container) return;

        let trades = this.getTrades();
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        if (!trades.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--muted)">No trades to display</p>';
            return;
        }

        const dailyPnL = {};
        trades.forEach(trade => {
            const date = trade.date;
            if (!date) return;
            
            if (!dailyPnL[date]) {
                dailyPnL[date] = 0;
            }
            dailyPnL[date] += trade.pnl || 0;
        });

        const selectedMonth = this.state.selectedMonth;
        const selectedYear = this.state.selectedYear;

        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Only weekdays
        let calendarHTML = '<div class="calendar-header">';
        dayNames.forEach(day => {
            calendarHTML += `<div>${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar">';

        // Calculate starting offset for weekdays only (Monday = 0, Tuesday = 1, ..., Friday = 4)
        let startingOffset = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        if (startingOffset > 4) startingOffset = 0; // Skip weekends at the beginning
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingOffset; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month (only weekdays)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth, day);
            const dayOfWeek = date.getDay();
            
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const profit = dailyPnL[dateStr] || 0;
            
            let dayClass = 'calendar-day';
            if (profit > 0) {
                dayClass += ' profit';
            } else if (profit < 0) {
                dayClass += ' loss';
            } else {
                dayClass += ' neutral';
            }

            let profitDisplay = '';
            if (profit !== 0) {
                profitDisplay = `<div class="profit-amount">${profit > 0 ? '+' : ''}${this.formatNumber(profit.toFixed(0))}</div>`;
            }

            calendarHTML += `<div class="${dayClass}" data-date="${dateStr}">${day}${profitDisplay}</div>`;
        }

        calendarHTML += '</div>';

        calendarHTML += `
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color legend-profit"></div>
                    <span>Profit Day</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-loss"></div>
                    <span>Loss Day</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-neutral"></div>
                    <span>No Trades</span>
                </div>
            </div>
        `;

        container.innerHTML = calendarHTML;
        
        container.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const date = dayEl.dataset.date;
                this.showDayTrades(date);
            });
        });
    }

    showDayTrades(date) {
        let trades = this.getTrades();
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        const dayTrades = trades.filter(t => t.date === date);
        
        if (dayTrades.length === 0) {
            this.toast('No trades for this day', 2000);
            return;
        }
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        this.dom['day-trades-title'].textContent = `Trades for ${formattedDate}`;
        
        let tradesHTML = '';
        dayTrades.forEach(trade => {
            // Format PnL for display
            const accounts = this.getAccounts();
            const activeAccount = accounts.find(acc => acc.id === this.getActiveAccount());
            const accountSize = activeAccount ? activeAccount.size : 0;
            const displayPnL = this.formatPnL(trade.pnl || 0, accountSize);
            
            tradesHTML += `
                <div class="trade day-trade" data-id="${trade.id}" style="margin-bottom:12px;cursor:pointer">
                    <img class="thumb" src="${trade.photo && trade.photo.length > 8 ? trade.photo : this.placeholderDataURI()}" alt="Trade screenshot">
                    <div class="info">
                        <div class="meta">
                            <div class="${trade.type === 'buy' ? 'tag-buy' : 'tag-sell'}">${(trade.type||'').toUpperCase()}</div>
                            · ${trade.symbol} · ${trade.timeframe} · ${trade.date}
                        </div>
                        <div class="pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}">${displayPnL}</div>
                        <div style="color:var(--muted);font-size:13px">
                            Entry: ${this.escapeHtml(trade.entry||'')} &nbsp;&nbsp;|&nbsp;&nbsp; Exit: ${this.escapeHtml(trade.exit||'')}
                        </div>
                        ${trade.comment ? `<div style="margin-top:6px;color:var(--muted);font-size:13px">${this.escapeHtml(trade.comment)}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        this.dom['day-trades-content'].innerHTML = tradesHTML;
        this.dom['day-trades-modal'].classList.add('active');
        this.dom['day-trades-modal'].setAttribute('aria-hidden', 'false');
        
        // Add click event to each trade in the day trades modal - now opens the same modal as View Trades
        this.dom['day-trades-content'].querySelectorAll('.day-trade').forEach(tradeEl => {
            tradeEl.addEventListener('click', () => {
                const tradeId = tradeEl.dataset.id;
                const trade = dayTrades.find(t => t.id == tradeId);
                if (trade) {
                    this.closeDayTradesModal(); // Close day trades modal first
                    this.openModal(trade);
                }
            });
        });
    }

    closeDayTradesModal() {
        this.dom['day-trades-modal'].classList.remove('active');
        this.dom['day-trades-modal'].setAttribute('aria-hidden', 'true');
    }

    // Accounts Management
    createAccount() {
        const name = this.dom['account-name-input'].value.trim();
        const size = parseFloat(this.dom['account-size-input'].value);
        
        if (!name) {
            this.toast('Please enter an account name', 2000);
            return;
        }
        
        if (!size || size <= 0) {
            this.toast('Please enter a valid account size', 2000);
            return;
        }
        
        const accounts = this.getAccounts();
        const newAccount = {
            id: Date.now().toString(),
            name: name,
            size: size,
            created: new Date().toISOString()
        };
        
        accounts.push(newAccount);
        this.setAccounts(accounts);
        
        this.dom['account-name-input'].value = '';
        this.dom['account-size-input'].value = '';
        
        this.renderAccounts();
        
        if (accounts.length === 1) {
            this.setActiveAccount(newAccount.id);
            this.updateAccountDisplay();
        }
        
        this.toast('Account created successfully', 2000);
    }

    renderAccounts() {
        const accountsList = this.dom['accounts-list'];
        const accounts = this.getAccounts();
        const activeAccountId = this.getActiveAccount();
        
        if (accounts.length === 0) {
            accountsList.innerHTML = '<div class="no-accounts">No accounts created yet</div>';
            return;
        }
        
        let accountsHTML = '';
        accounts.forEach(account => {
            const isActive = account.id === activeAccountId;
            const accountTrades = this.getTrades().filter(t => t.accountId === account.id);
            const accountPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
            const accountReturn = account.size > 0 ? (accountPnL / account.size * 100).toFixed(2) : 0;
            
            accountsHTML += `
                <div class="account-item ${isActive ? 'active' : ''}">
                    <div class="account-info">
                        <div class="account-name">${this.escapeHtml(account.name)}</div>
                        <div class="account-size">Size: $${this.formatNumber(account.size)} | PnL: $${this.formatNumber(accountPnL.toFixed(2))} (${accountReturn}%)</div>
                    </div>
                    <div class="account-actions">
                        <button class="account-btn ${isActive ? 'active' : ''}" data-action="select" data-id="${account.id}">
                            ${isActive ? 'Selected' : 'Select'}
                        </button>
                        <button class="account-btn" data-action="edit" data-id="${account.id}">Edit</button>
                        <button class="account-btn delete" data-action="delete" data-id="${account.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        
        accountsList.innerHTML = accountsHTML;
        
        accountsList.querySelectorAll('.account-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const accountId = btn.dataset.id;
                
                if (action === 'select') {
                    this.setActiveAccount(accountId);
                    this.updateAccountDisplay();
                    this.renderAccounts();
                    this.renderTrades();
                    this.refreshAnalytics(); // FIXED: Refresh analytics when account changes
                    this.drawMiniEquityChart();
                    this.toast('Account selected', 1500);
                } else if (action === 'edit') {
                    this.editAccount(accountId);
                } else if (action === 'delete') {
                    this.deleteAccount(accountId);
                }
            });
        });
        
        this.updateAccountStatistics();
    }

    editAccount(accountId) {
        const accounts = this.getAccounts();
        const account = accounts.find(acc => acc.id === accountId);
        
        if (!account) return;
        
        // Populate the edit modal
        this.dom['edit-account-name'].value = account.name;
        this.dom['edit-account-size'].value = account.size;
        
        // Store the account ID being edited
        this.state.editingAccountId = accountId;
        
        // Show the modal
        this.dom['edit-account-modal'].classList.add('active');
        this.dom['edit-account-modal'].setAttribute('aria-hidden', 'false');
    }

    deleteAccount(accountId) {
        if (!confirm('Are you sure you want to delete this account? This will also remove all trades associated with it.')) {
            return;
        }
        
        const accounts = this.getAccounts();
        const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
        this.setAccounts(updatedAccounts);
        
        const trades = this.getTrades();
        const updatedTrades = trades.filter(trade => trade.accountId !== accountId);
        this.setTrades(updatedTrades);
        
        if (this.getActiveAccount() === accountId) {
            if (updatedAccounts.length > 0) {
                this.setActiveAccount(updatedAccounts[0].id);
            } else {
                this.setActiveAccount(null);
            }
            this.updateAccountDisplay();
        }
        
        this.renderAccounts();
        this.renderTrades();
        this.refreshAnalytics(); // FIXED: Refresh analytics when account changes
        this.drawMiniEquityChart();
        this.toast('Account deleted', 2000);
    }

    updateAccountDisplay() {
        const activeAccountId = this.getActiveAccount();
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        
        if (activeAccount) {
            this.dom['account-display'].style.display = 'block';
            this.dom['account-name'].textContent = activeAccount.name;
            this.dom['account-size'].textContent = this.formatNumber(activeAccount.size);
        } else {
            this.dom['account-display'].style.display = 'none';
        }
    }

    updateAccountStatistics() {
        const activeAccountId = this.getActiveAccount();
        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        
        if (!activeAccount) {
            this.dom['current-balance'].textContent = '$0';
            this.dom['account-total-pnl'].textContent = '$0';
            this.dom['account-return'].textContent = '0%';
            this.dom['account-win-rate'].textContent = '0%';
            return;
        }
        
        const accountTrades = this.getTrades().filter(t => t.accountId === activeAccountId);
        const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const currentBalance = activeAccount.size + totalPnL;
        const returnPercentage = activeAccount.size > 0 ? (totalPnL / activeAccount.size * 100).toFixed(2) : 0;
        
        const nonBETrades = accountTrades.filter(t => (t.exit||'') !== 'BE');
        const wins = nonBETrades.filter(t => t.pnl > 0).length;
        const winRate = nonBETrades.length > 0 ? (wins / nonBETrades.length * 100).toFixed(1) : 0;
        
        this.dom['current-balance'].textContent = `$${this.formatNumber(currentBalance.toFixed(2))}`;
        this.dom['account-total-pnl'].textContent = `$${this.formatNumber(totalPnL.toFixed(2))}`;
        this.dom['account-total-pnl'].style.color = totalPnL >= 0 ? 'var(--accent)' : 'var(--danger)';
        this.dom['account-return'].textContent = `${returnPercentage}%`;
        this.dom['account-return'].style.color = returnPercentage >= 0 ? 'var(--accent)' : 'var(--danger)';
        this.dom['account-win-rate'].textContent = `${winRate}%`;
    }

    // Stats and filters
    updateStats(trades) {
        const activeAccountId = this.getActiveAccount();
        
        if (activeAccountId) {
            trades = trades.filter(t => t.accountId === activeAccountId);
        }
        
        if (!trades.length) {
            this.dom['stats-bar'].style.display = 'none';
            return;
        }

        this.dom['stats-bar'].style.display = 'flex';
        const total = trades.length;
        // FIXED: Include BE trades in PnL calculations
        const totalPnL = trades.reduce((s,t) => s + (t.pnl||0), 0);
        // For win rate, still exclude BE trades
        const nonBE = trades.filter(t => (t.exit||'') !== 'BE');
        const wins = nonBE.filter(t => t.pnl > 0).length;
        const winRate = nonBE.length ? (wins/nonBE.length)*100 : 0;
        // For average PnL, include all trades (including BE)
        const avg = trades.length ? trades.reduce((s,t) => s + (t.pnl||0), 0) / trades.length : 0;

        const accounts = this.getAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        const accountSize = activeAccount ? activeAccount.size : 0;

        this.dom['stat-total'].textContent = total;
        this.dom['stat-total-pnl'].textContent = this.formatPnL(totalPnL, accountSize);
        this.dom['stat-total-pnl'].style.color = totalPnL >= 0 ? 'var(--accent)' : 'var(--danger)';
        this.dom['stat-win'].textContent = winRate.toFixed(1) + '%';
        this.dom['stat-avg'].textContent = this.formatPnL(avg, accountSize);
        this.dom['stat-avg'].style.color = avg >= 0 ? 'var(--accent)' : 'var(--danger)';
    }

    populateFilters(trades) {
        const symbols = [...new Set(trades.map(t => t.symbol).filter(Boolean))];
        const prev = this.dom['filter-symbol']?.value || 'all';
        
        this.dom['filter-symbol'].innerHTML = '<option value="all">All Symbols</option>' + 
            symbols.map(s => `<option value="${s}">${s}</option>`).join('');
        
        if ([...this.dom['filter-symbol'].options].some(o => o.value === prev)) {
            this.dom['filter-symbol'].value = prev;
        } else {
            this.dom['filter-symbol'].value = 'all';
        }
    }

    updateSortSelect() {
        const saved = this.getSortPref();
        this.dom['sort-select'].value = saved === 'reset' ? 'date-desc' : saved;
    }

    handleSortChange(e) {
        const val = e.target.value;
        if (val === 'reset') {
            this.clearCustomOrder();
            this.setSortPref('date-desc');
            this.dom['sort-select'].value = 'date-desc';
            this.toast('Custom order reset', 2000);
        } else {
            this.setSortPref(val);
            if (val === 'custom') {
                const order = this.getCustomOrder();
                if (!order.length) {
                    const trades = this.getTrades();
                    const newOrder = trades.map(t => String(t.id));
                    this.setCustomOrder(newOrder);
                }
                this.toast('Drag trades to reorder', 3000);
            }
        }
        this.renderTrades();
    }

    // Utilities
    placeholderDataURI() {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#081015'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#21343b' font-family='Poppins, sans-serif' font-size='24'>No image</text></svg>`;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    escapeHtml(s) { 
        if (!s) return '';
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    formatNumber(num) {
        if (typeof num === 'string') {
            num = parseFloat(num.replace(/,/g, ''));
        }
        return new Intl.NumberFormat('en-US').format(num);
    }

    formatPnL(pnl, accountSize = null) {
        const mode = this.getAnalyticsMode();
        
        if (mode === 'percentage' && accountSize && accountSize > 0) {
            const percentage = (pnl / accountSize) * 100;
            return (percentage >= 0 ? '+' : '') + percentage.toFixed(2) + '%';
        }
        
        return (pnl >= 0 ? '+' : '') + '$' + (Number.isFinite(pnl) ? this.formatNumber(pnl.toFixed(2)) : '0.00');
    }

    monthKey(dateStr) {
        if (!dateStr) return '(no-date)';
        const d = new Date(dateStr);
        return isNaN(d) ? '(no-date)' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }

    toast(text, opts = {}) {
        if (typeof opts === 'number') opts = { timeout: opts };
        const timeout = opts.timeout || 3500;
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const span = document.createElement('span');
        span.textContent = text;
        toast.appendChild(span);

        if (opts.undo) {
            const btn = document.createElement('button');
            btn.textContent = 'Undo';
            btn.onclick = () => {
                opts.onUndo?.();
                toast.remove();
                if (this.state.undoTimer) {
                    clearTimeout(this.state.undoTimer);
                    this.state.undoTimer = null;
                    this.state.lastDeletedBackup = null;
                }
            };
            toast.appendChild(btn);
        }

        this.dom['toast-wrap'].appendChild(toast);
        setTimeout(() => toast.remove(), timeout);
    }

    loadData() {
        this.updateSortSelect();
        this.renderAccounts();
        this.updateAccountDisplay();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    createStaticStars();
    createShootingStars();
    new CosmicJournal();
});
