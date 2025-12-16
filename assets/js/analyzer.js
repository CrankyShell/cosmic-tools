// Cosmic Analyzer - Enhanced with New Features (Simplified)
class CosmicAnalyzer {
    constructor() {
        this.currentPair = {
            base: 'EUR',
            quote: 'USD',
            symbol: 'EUR/USD',
            tradingViewSymbol: 'FX:EURUSD',
            marketType: 'forex'
        };
        
        // Session times in UTC (for calculation)
        this.sessionsUTC = {
            tokyo: { start: 0, end: 9, name: 'Tokyo', color: '#3498db' },
            london: { start: 8, end: 17, name: 'London', color: '#2ecc71' },
            newyork: { start: 13, end: 22, name: 'New York', color: '#e74c3c' }
        };
        
        // Timezone handling
        this.selectedTimezone = 'browser';
        this.timezoneOffsets = {
            'browser': 0,
            'UTC': 0,
            'EST': -5,
            'CST': -6,
            'PST': -8,
            'GMT': 0,
            'CET': 1,
            'JST': 9,
            'AEST': 10
        };
        
        // Market types
        this.marketTypes = {
            'forex': {
                label: 'Forex',
                pairs: [
                    { symbol: 'EUR/USD', tvSymbol: 'FX:EURUSD' },
                    { symbol: 'GBP/USD', tvSymbol: 'FX:GBPUSD' },
                    { symbol: 'USD/JPY', tvSymbol: 'FX:USDJPY' },
                    { symbol: 'USD/CHF', tvSymbol: 'FX:USDCHF' },
                    { symbol: 'AUD/USD', tvSymbol: 'FX:AUDUSD' },
                    { symbol: 'USD/CAD', tvSymbol: 'FX:USDCAD' },
                    { symbol: 'NZD/USD', tvSymbol: 'FX:NZDUSD' },
                    { symbol: 'EUR/GBP', tvSymbol: 'FX:EURGBP' },
                    { symbol: 'EUR/JPY', tvSymbol: 'FX:EURJPY' },
                    { symbol: 'GBP/JPY', tvSymbol: 'FX:GBPJPY' }
                ]
            },
            'stocks': {
                label: 'Stocks',
                pairs: [
                    { symbol: 'AAPL/USD', tvSymbol: 'NASDAQ:AAPL' },
                    { symbol: 'TSLA/USD', tvSymbol: 'NASDAQ:TSLA' },
                    { symbol: 'MSFT/USD', tvSymbol: 'NASDAQ:MSFT' },
                    { symbol: 'GOOGL/USD', tvSymbol: 'NASDAQ:GOOGL' },
                    { symbol: 'AMZN/USD', tvSymbol: 'NASDAQ:AMZN' },
                    { symbol: 'NVDA/USD', tvSymbol: 'NASDAQ:NVDA' },
                    { symbol: 'META/USD', tvSymbol: 'NASDAQ:META' },
                    { symbol: 'NFLX/USD', tvSymbol: 'NASDAQ:NFLX' }
                ]
            },
            'indices': {
                label: 'Indices',
                pairs: [
                    { symbol: 'SPX/USD', tvSymbol: 'SP:SPX' },
                    { symbol: 'NDX/USD', tvSymbol: 'NASDAQ:NDX' },
                    { symbol: 'DJI/USD', tvSymbol: 'DJ:DJI' },
                    { symbol: 'FTSE/GBP', tvSymbol: 'FTSE:UKX' },
                    { symbol: 'DAX/EUR', tvSymbol: 'XETR:DAX' },
                    { symbol: 'N225/JPY', tvSymbol: 'TVC:NIKKEI' }
                ]
            },
            'crypto': {
                label: 'Crypto',
                pairs: [
                    { symbol: 'BTC/USD', tvSymbol: 'BITSTAMP:BTCUSD' },
                    { symbol: 'ETH/USD', tvSymbol: 'BITSTAMP:ETHUSD' },
                    { symbol: 'BNB/USD', tvSymbol: 'BINANCE:BNBUSDT' },
                    { symbol: 'XRP/USD', tvSymbol: 'BITSTAMP:XRPUSD' },
                    { symbol: 'SOL/USD', tvSymbol: 'COINBASE:SOLUSD' },
                    { symbol: 'ADA/USD', tvSymbol: 'BINANCE:ADAUSDT' },
                    { symbol: 'DOGE/USD', tvSymbol: 'BINANCE:DOGEUSDT' }
                ]
            }
        };
        
        this.isLoading = false;
        this.advancedChartWidget = null;
        this.chartHeight = 650; // Default chart height
        this.pairSpecificCalendar = true; // Default to pair-specific calendar
        
        this.initialize();
    }
    
    initialize() {
        this.setupMarketTypeButtons();
        this.setupPairSelector();
        this.setupTimezoneSelector();
        this.setupQuickActions();
        this.setupChartControls();
        this.setupEventListeners();
        
        // Initialize TradingView widgets
        this.initializeTradingViewWidgets();
        
        // Start live updates
        this.startLiveUpdates();
    }
    
    // Setup Market Type Buttons
    setupMarketTypeButtons() {
        const container = document.getElementById('market-type-buttons');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(this.marketTypes).forEach(([value, data]) => {
            const button = document.createElement('button');
            button.className = 'market-type-btn';
            button.textContent = data.label;
            button.dataset.marketType = value;
            
            if (value === 'forex') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                // Update active button
                document.querySelectorAll('.market-type-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Update market type
                this.currentPair.marketType = value;
                this.populatePairSelector(value);
                
                // Update preview immediately
                const pairSelect = document.getElementById('currency-pair');
                if (pairSelect && pairSelect.value) {
                    this.updateCurrentPairFromSelection(pairSelect.value);
                }
            });
            
            container.appendChild(button);
        });
    }
    
    // Pair Selector
    setupPairSelector() {
        const pairSelect = document.getElementById('currency-pair');
        const analyzeBtn = document.getElementById('analyze-pair');
        
        if (pairSelect) {
            pairSelect.addEventListener('change', (e) => {
                const selectedPair = e.target.value;
                if (!selectedPair) return;
                
                this.updateCurrentPairFromSelection(selectedPair);
            });
            
            // Initialize with forex pairs
            this.populatePairSelector('forex');
        }
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                const pairSelect = document.getElementById('currency-pair');
                const selectedPair = pairSelect ? pairSelect.value : null;
                
                if (!selectedPair) {
                    this.showNotification('Please select an instrument', 'warning');
                    return;
                }
                
                this.showNotification(`Analyzing ${this.currentPair.symbol}...`);
                
                // Update advanced chart
                this.updateAdvancedChart();
                
                // Update economic calendar based on toggle
                this.updateEconomicCalendar();
                
                // Fetch market data
                this.fetchMarketData();
                
                // Auto-scroll to analysis sections
                this.scrollToAnalysis();
            });
        }
    }
    
    updateCurrentPairFromSelection(selectedPair) {
        const marketData = this.marketTypes[this.currentPair.marketType];
        const selectedPairData = marketData.pairs.find(p => p.symbol === selectedPair);
        
        if (selectedPairData) {
            this.currentPair = {
                base: selectedPair.split('/')[0],
                quote: selectedPair.split('/')[1],
                symbol: selectedPair,
                tradingViewSymbol: selectedPairData.tvSymbol,
                marketType: this.currentPair.marketType
            };
            
            // Update display
            document.getElementById('current-symbol-display').textContent = this.currentPair.symbol;
            
            // Update mini chart immediately
            this.updateMiniChart();
            
            this.showNotification(`Previewing ${this.currentPair.symbol}`, 'info');
        }
    }
    
    populatePairSelector(marketType) {
        const pairSelect = document.getElementById('currency-pair');
        if (!pairSelect) return;
        
        pairSelect.innerHTML = '';
        
        const marketData = this.marketTypes[marketType];
        if (!marketData) return;
        
        marketData.pairs.forEach(pairData => {
            const option = document.createElement('option');
            option.value = pairData.symbol;
            option.textContent = pairData.symbol;
            pairSelect.appendChild(option);
        });
        
        if (marketData.pairs.length > 0) {
            pairSelect.value = marketData.pairs[0].symbol;
            
            const selectedPairData = marketData.pairs[0];
            this.currentPair = {
                base: marketData.pairs[0].symbol.split('/')[0],
                quote: marketData.pairs[0].symbol.split('/')[1],
                symbol: marketData.pairs[0].symbol,
                tradingViewSymbol: selectedPairData.tvSymbol,
                marketType: marketType
            };
            
            // Update display
            document.getElementById('current-symbol-display').textContent = this.currentPair.symbol;
            
            // Update mini chart immediately
            setTimeout(() => this.updateMiniChart(), 100);
        }
    }
    
    // Initialize TradingView Widgets
    initializeTradingViewWidgets() {
        this.initializeMiniChart();
        this.initializeAdvancedChart();
        this.initializeEconomicCalendar();
        this.initializeNewsWidget();
    }
    
    initializeMiniChart() {
        const container = document.getElementById('mini-tradingview-widget');
        if (!container) return;
        
        container.innerHTML = '';
        
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container';
        
        const widgetContent = document.createElement('div');
        widgetContent.className = 'tradingview-widget-container__widget';
        
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        const exchange = this.currentPair.tradingViewSymbol.split(':')[0];
        const symbol = this.currentPair.tradingViewSymbol.split(':')[1];
        const link = document.createElement('a');
        link.href = `https://www.tradingview.com/symbols/${exchange}-${symbol}/?exchange=${exchange}`;
        link.rel = 'noopener nofollow';
        link.target = '_blank';
        link.innerHTML = `<span class="blue-text">${this.currentPair.symbol} rate</span>`;
        copyrightDiv.appendChild(link);
        const trademark = document.createElement('span');
        trademark.className = 'trademark';
        trademark.textContent = ' by TradingView';
        copyrightDiv.appendChild(trademark);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.async = true;
        
        const config = {
            "symbol": this.currentPair.tradingViewSymbol,
            "chartOnly": false,
            "dateRange": "12M",
            "noTimeScale": false,
            "colorTheme": "dark",
            "isTransparent": true,
            "locale": "en",
            "width": "100%",
            "autosize": false,
            "height": "100%"
        };
        
        script.textContent = JSON.stringify(config);
        
        widgetDiv.appendChild(widgetContent);
        widgetDiv.appendChild(copyrightDiv);
        widgetDiv.appendChild(script);
        
        container.appendChild(widgetDiv);
    }
    
    initializeAdvancedChart() {
        const container = document.getElementById('tradingview-chart');
        if (!container) return;
        
        container.innerHTML = '';
        
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container';
        
        const widgetContent = document.createElement('div');
        widgetContent.className = 'tradingview-widget-container__widget';
        
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        const exchange = this.currentPair.tradingViewSymbol.split(':')[0];
        const symbol = this.currentPair.tradingViewSymbol.split(':')[1];
        const link = document.createElement('a');
        link.href = `https://www.tradingview.com/symbols/${exchange}-${symbol}/?exchange=${exchange}`;
        link.rel = 'noopener nofollow';
        link.target = '_blank';
        link.innerHTML = `<span class="blue-text">${this.currentPair.symbol} chart</span>`;
        copyrightDiv.appendChild(link);
        const trademark = document.createElement('span');
        trademark.className = 'trademark';
        trademark.textContent = ' by TradingView';
        copyrightDiv.appendChild(trademark);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        
        const config = {
            "allow_symbol_change": false,
            "calendar": false,
            "details": false,
            "hide_side_toolbar": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "hide_volume": true,
            "hotlist": false,
            "interval": "5",
            "locale": "en",
            "save_image": true,
            "style": "1",
            "symbol": this.currentPair.tradingViewSymbol,
            "theme": "dark",
            "timezone": "Etc/UTC",
            "backgroundColor": "rgba(26, 31, 37, 1)", // CHANGED: Matches your dark panel color
            "gridColor": "rgba(26, 31, 37, 1)", // CHANGED: Softer grid lines
            // Toolbar styling
            "toolbar_bg": "rgba(26, 31, 37, 1)", // Toolbar background
            "enable_publishing": false,
            // Chart colors for better visibility
    "upColor": "#00FFB3", // Your accent-primary color
    "downColor": "#FF4D4D", // Your accent-danger color
    "borderUpColor": "#00FFB3",
    "borderDownColor": "#FF4D4D",
    "wickUpColor": "#00FFB3",
    "wickDownColor": "#FF4D4D",
      // Text colors for toolbar
    "fontColor": "#DBDBDB", // Light text (your --text-primary)
    "fontFamily": "Poppins, sans-serif",
            
            "watchlist": [],
            "withdateranges": false,
            "compareSymbols": [],
            "studies": [],
            "width": "100%",
            "height": this.chartHeight.toString(),
            "autosize": this.chartHeight === 'auto',
            "container_id": "tradingview-chart"
        };
        
        script.textContent = JSON.stringify(config);
        
        widgetDiv.appendChild(widgetContent);
        widgetDiv.appendChild(copyrightDiv);
        widgetDiv.appendChild(script);
        
        container.appendChild(widgetDiv);
    }
    
    initializeEconomicCalendar() {
        const container = document.getElementById('economic-calendar-widget');
        if (!container) return;
        
        container.innerHTML = '';
        
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container';
        
        const widgetContent = document.createElement('div');
        widgetContent.className = 'tradingview-widget-container__widget';
        
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        const link = document.createElement('a');
        link.href = 'https://www.tradingview.com/economic-calendar/';
        link.rel = 'noopener nofollow';
        link.target = '_blank';
        link.innerHTML = '<span class="blue-text">Economic Calendar</span>';
        copyrightDiv.appendChild(link);
        const trademark = document.createElement('span');
        trademark.className = 'trademark';
        trademark.textContent = ' by TradingView';
        copyrightDiv.appendChild(trademark);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.async = true;
        
        const config = this.pairSpecificCalendar ? 
            this.getPairSpecificCalendarConfig() : 
            this.getGeneralCalendarConfig();
        
        script.textContent = JSON.stringify(config);
        
        widgetDiv.appendChild(widgetContent);
        widgetDiv.appendChild(copyrightDiv);
        widgetDiv.appendChild(script);
        
        container.appendChild(widgetDiv);
    }
    
    getPairSpecificCalendarConfig() {
        // Get relevant countries for the current pair
        const countries = this.getRelevantCountriesForPair();
        
        return {
            "colorTheme": "dark",
            "isTransparent": true,
            "locale": "en",
            "countryFilter": countries.join(','),
            "importanceFilter": "-1,0,1",
            "width": "100%",
            "height": "100%"
        };
    }
    
    getGeneralCalendarConfig() {
        return {
            "colorTheme": "dark",
            "isTransparent": true,
            "locale": "en",
            "countryFilter": "us,ca,be,lu,nl,eu,fr,de,gb,it,es,pt,au,nz,jp",
            "importanceFilter": "-1,0,1",
            "width": "100%",
            "height": "100%"
        };
    }
    
    getRelevantCountriesForPair() {
        const countryMap = {
            'EUR': 'eu',
            'USD': 'us',
            'GBP': 'gb',
            'JPY': 'jp',
            'CHF': 'ch',
            'AUD': 'au',
            'CAD': 'ca',
            'NZD': 'nz'
        };
        
        const countries = new Set(['us', 'eu', 'gb', 'jp']); // Default important countries
        
        if (countryMap[this.currentPair.base]) {
            countries.add(countryMap[this.currentPair.base]);
        }
        if (countryMap[this.currentPair.quote]) {
            countries.add(countryMap[this.currentPair.quote]);
        }
        
        return Array.from(countries);
    }
    
    initializeNewsWidget() {
        const container = document.getElementById('news-widget');
        if (!container) return;
        
        container.innerHTML = '';
        
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container';
        
        const widgetContent = document.createElement('div');
        widgetContent.className = 'tradingview-widget-container__widget';
        
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        const link = document.createElement('a');
        link.href = 'https://www.tradingview.com/news/top-providers/tradingview/';
        link.rel = 'noopener nofollow';
        link.target = '_blank';
        link.innerHTML = '<span class="blue-text">Top stories</span>';
        copyrightDiv.appendChild(link);
        const trademark = document.createElement('span');
        trademark.className = 'trademark';
        trademark.textContent = ' by TradingView';
        copyrightDiv.appendChild(trademark);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.async = true;
        
        const config = {
            "displayMode": "adaptive",
            "feedMode": "all_symbols",
            "colorTheme": "dark",
            "isTransparent": true,
            "locale": "en",
            "width": "100%",
            "height": "550"
        };
        
        script.textContent = JSON.stringify(config);
        
        widgetDiv.appendChild(widgetContent);
        widgetDiv.appendChild(copyrightDiv);
        widgetDiv.appendChild(script);
        
        container.appendChild(widgetDiv);
    }
    
    // Setup Chart Controls - FIXED VERSION
    setupChartControls() {
        const sizeBtn = document.getElementById('chart-size-btn');
        const sizeOptions = document.getElementById('chart-size-options');
        const calendarToggle = document.getElementById('calendar-toggle');
        const refreshNewsBtn = document.getElementById('refresh-news');
        
        // Initialize chart size dropdown
        if (sizeBtn && sizeOptions) {
            // Show/hide dropdown when button is clicked
            sizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sizeOptions.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (sizeOptions && sizeBtn && !sizeOptions.contains(e.target) && e.target !== sizeBtn) {
                    sizeOptions.classList.remove('show');
                }
            });
            
            // Handle size selection
            const sizeOptionsList = sizeOptions.querySelectorAll('.size-option');
            if (sizeOptionsList.length > 0) {
                sizeOptionsList.forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Update active state
                        sizeOptionsList.forEach(opt => {
                            opt.classList.remove('active');
                        });
                        option.classList.add('active');
                        
                        // Update chart height
                        const size = option.dataset.size;
                        this.setChartHeight(size);
                        
                        // Close dropdown
                        sizeOptions.classList.remove('show');
                        
                        // Show notification
                        const sizeName = option.textContent.split(' ')[0];
                        this.showNotification(`Chart size set to ${sizeName}`, 'info');
                    });
                });
            }
        }
        
        // Initialize calendar toggle
        if (calendarToggle) {
            calendarToggle.addEventListener('change', (e) => {
                this.pairSpecificCalendar = e.target.checked;
                this.updateEconomicCalendar();
                this.showNotification(
                    this.pairSpecificCalendar ? 
                    'Showing pair-specific calendar' : 
                    'Showing general calendar',
                    'info'
                );
            });
        }
        
        // Initialize news refresh button
        if (refreshNewsBtn) {
            refreshNewsBtn.addEventListener('click', () => {
                this.refreshNewsWidget();
            });
        }
    }
    
    setChartHeight(size) {
        const container = document.getElementById('tradingview-chart-container');
        if (!container) return;
        
        if (size === 'auto') {
            container.style.height = 'auto';
            container.style.minHeight = '550px';
            this.chartHeight = 'auto';
        } else {
            const height = parseInt(size);
            container.style.height = height + 'px';
            container.style.minHeight = height + 'px';
            this.chartHeight = height;
        }
        
        // Reinitialize chart with new height
        this.updateAdvancedChart();
    }
    
    updateMiniChart() {
        this.initializeMiniChart();
    }
    
    updateAdvancedChart() {
        this.initializeAdvancedChart();
    }
    
    updateEconomicCalendar() {
        this.initializeEconomicCalendar();
    }
    
    refreshNewsWidget() {
        const refreshBtn = document.getElementById('refresh-news');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('.refresh-icon');
            icon.style.animation = 'spin 0.6s linear infinite';
            
            setTimeout(() => {
                this.initializeNewsWidget();
                icon.style.animation = '';
                this.showNotification('News refreshed', 'success');
            }, 600);
        }
    }
    
    // AUTO-SCROLL TO ANALYSIS SECTIONS
    scrollToAnalysis() {
        setTimeout(() => {
            const analysisGrid = document.getElementById('analysis-grid');
            if (analysisGrid) {
                analysisGrid.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 500);
    }
    
    // Back to Top function
    scrollToTop() {
        setTimeout(() => {
            const marketSelection = document.getElementById('market-selection');
            if (marketSelection) {
                marketSelection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
    
    setupTimezoneSelector() {
        const timezoneSelect = document.getElementById('timezone-select');
        if (!timezoneSelect) return;
        
        timezoneSelect.innerHTML = '';
        
        const timezones = [
            { value: 'browser', label: 'Browser Default (Local Time)' },
            { value: 'UTC', label: 'UTC (GMT)' },
            { value: 'EST', label: 'EST (GMT-5)' },
            { value: 'CST', label: 'CST (GMT-6)' },
            { value: 'PST', label: 'PST (GMT-8)' },
            { value: 'GMT', label: 'GMT (London)' },
            { value: 'CET', label: 'CET (Paris/Berlin)' },
            { value: 'JST', label: 'JST (Tokyo)' },
            { value: 'AEST', label: 'AEST (Sydney)' }
        ];
        
        timezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz.value;
            option.textContent = tz.label;
            timezoneSelect.appendChild(option);
        });
        
        timezoneSelect.value = 'browser';
        this.selectedTimezone = 'browser';
        
        timezoneSelect.addEventListener('change', (e) => {
            this.selectedTimezone = e.target.value;
            this.showNotification(`Timezone set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
            this.updateSessionDisplay();
        });
    }
    
    getCurrentTimeInTimezone() {
        const now = new Date();
        
        if (this.selectedTimezone === 'browser') {
            return now;
        }
        
        const offset = this.timezoneOffsets[this.selectedTimezone] || 0;
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const targetTime = new Date(utcTime + (offset * 3600000));
        
        return targetTime;
    }
    
    convertUTCtoLocal(utcHour) {
        const now = new Date();
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHour, 0, 0));
        
        if (this.selectedTimezone === 'browser') {
            return date.getHours();
        }
        
        const offset = this.timezoneOffsets[this.selectedTimezone] || 0;
        const localHour = (utcHour + offset) % 24;
        return localHour < 0 ? localHour + 24 : localHour;
    }
    
    formatTime(hour) {
        const formattedHour = hour % 24;
        return formattedHour.toString().padStart(2, '0') + ':00';
    }
    
    updateSessionDisplay() {
        const currentTime = this.getCurrentTimeInTimezone();
        const currentUTCHour = currentTime.getUTCHours() + (currentTime.getUTCMinutes() / 60);
        
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const timezoneAbbr = this.selectedTimezone === 'browser' ? 
            this.getTimeZoneAbbreviation(Intl.DateTimeFormat().resolvedOptions().timeZone) : 
            this.selectedTimezone;
        
        document.getElementById('current-time-display').textContent = `${hours}:${minutes}`;
        document.getElementById('current-timezone').textContent = timezoneAbbr;
        
        Object.entries(this.sessionsUTC).forEach(([sessionKey, session]) => {
            const localStart = this.convertUTCtoLocal(session.start);
            const localEnd = this.convertUTCtoLocal(session.end);
            
            document.getElementById(`${sessionKey}-local-start`).textContent = this.formatTime(localStart);
            document.getElementById(`${sessionKey}-local-end`).textContent = this.formatTime(localEnd);
            
            let status = 'closed';
            let progress = 0;
            
            if (currentUTCHour >= session.start && currentUTCHour < session.end) {
                status = 'open';
                progress = ((currentUTCHour - session.start) / (session.end - session.start)) * 100;
            } else if (currentUTCHour < session.start) {
                const hoursUntil = session.start - currentUTCHour;
                if (hoursUntil < 3) {
                    status = 'opening soon';
                }
            } else if (currentUTCHour >= session.end && currentUTCHour < session.end + 1) {
                status = 'just closed';
            }
            
            const statusElement = document.getElementById(`${sessionKey}-status`);
            statusElement.textContent = status.toUpperCase();
            statusElement.className = 'session-status ' + 
                (status === 'open' ? 'open' : 
                 status === 'opening soon' ? 'overlap' : 'closed');
            
            document.getElementById(`${sessionKey}-progress-text`).textContent = 
                status === 'open' ? `${Math.round(progress)}%` : '--';
            document.getElementById(`${sessionKey}-progress-bar`).style.width = 
                status === 'open' ? `${progress}%` : '0%';
            
            const card = document.getElementById(`${sessionKey}-session`);
            if (status === 'open') {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        this.updateMarketStats(currentUTCHour);
    }
    
    updateMarketStats(currentUTCHour) {
        const activeSessions = Object.values(this.sessionsUTC).filter(session => 
            currentUTCHour >= session.start && currentUTCHour < session.end
        ).length;
        
        let nextSession = null;
        let nextSessionTime = 24;
        
        Object.entries(this.sessionsUTC).forEach(([key, session]) => {
            if (currentUTCHour < session.start && session.start < nextSessionTime) {
                nextSession = key;
                nextSessionTime = session.start;
            }
        });
        
        document.getElementById('active-sessions').textContent = activeSessions;
        document.getElementById('next-session').textContent = nextSession ? 
            `Next: ${nextSession.charAt(0).toUpperCase() + nextSession.slice(1)}` : '--';
        
        const overlaps = this.checkSessionOverlaps(currentUTCHour);
        document.getElementById('overlap-status').textContent = overlaps.length > 0 ? 'Active' : 'None';
        document.getElementById('overlap-hours').textContent = overlaps.length > 0 ? 
            `${overlaps.length} overlap${overlaps.length > 1 ? 's' : ''}` : '--';
    }
    
    checkSessionOverlaps(currentUTCHour) {
        const activeSessions = Object.entries(this.sessionsUTC).filter(([key, session]) => 
            currentUTCHour >= session.start && currentUTCHour < session.end
        ).map(([key]) => key);
        
        const overlaps = [];
        
        if (currentUTCHour >= 8 && currentUTCHour < 9) {
            if (activeSessions.includes('london') && activeSessions.includes('tokyo')) {
                overlaps.push('London/Tokyo');
            }
        }
        
        if (currentUTCHour >= 13 && currentUTCHour < 17) {
            if (activeSessions.includes('london') && activeSessions.includes('newyork')) {
                overlaps.push('London/New York');
            }
        }
        
        return overlaps;
    }
    
    getTimeZoneAbbreviation(timeZone) {
        const abbreviations = {
            'America/New_York': 'EST',
            'America/Chicago': 'CST',
            'America/Denver': 'MST',
            'America/Los_Angeles': 'PST',
            'Europe/London': 'GMT',
            'Europe/Paris': 'CET',
            'Europe/Berlin': 'CET',
            'Asia/Tokyo': 'JST',
            'Australia/Sydney': 'AEST'
        };
        
        return abbreviations[timeZone] || timeZone.split('/').pop().substring(0, 3).toUpperCase();
    }
    
    async fetchMarketData() {
        try {
            const mockData = this.generateMockMarketData();
            
            document.getElementById('volume-stat').textContent = mockData.volume;
            document.getElementById('volume-change').textContent = mockData.volumeChange;
            
            document.getElementById('spread-stat').textContent = mockData.spread;
            document.getElementById('spread-change').textContent = mockData.spreadChange;
            
        } catch (error) {
            console.error('Error fetching market data:', error);
            
            document.getElementById('volume-stat').textContent = '--';
            document.getElementById('volume-change').textContent = '--';
            
            document.getElementById('spread-stat').textContent = '--';
            document.getElementById('spread-change').textContent = '--';
        }
    }
    
    generateMockMarketData() {
        const volumes = {
            'EUR/USD': { volume: '1.2B', change: '+2.5%' },
            'GBP/USD': { volume: '850M', change: '+1.8%' },
            'USD/JPY': { volume: '950M', change: '-0.5%' },
            'BTC/USD': { volume: '25B', change: '+5.2%' },
            'AAPL/USD': { volume: '120M', change: '+3.1%' }
        };
        
        const spreads = {
            'EUR/USD': { spread: '0.8 pips', change: '-0.1' },
            'GBP/USD': { spread: '1.2 pips', change: '+0.2' },
            'USD/JPY': { spread: '0.9 pips', change: '0.0' },
            'BTC/USD': { spread: '$15', change: '-$2' },
            'AAPL/USD': { spread: '$0.02', change: '+$0.01' }
        };
        
        const pairData = volumes[this.currentPair.symbol] || { volume: '--', change: '--' };
        const spreadData = spreads[this.currentPair.symbol] || { spread: '--', change: '--' };
        
        return {
            volume: pairData.volume,
            volumeChange: pairData.change,
            spread: spreadData.spread,
            spreadChange: spreadData.change
        };
    }
    
    startLiveUpdates() {
        this.updateSessionDisplay();
        this.fetchMarketData();
        
        setInterval(() => {
            this.updateSessionDisplay();
        }, 60000);
        
        setInterval(() => {
            this.fetchMarketData();
        }, 300000);
    }
    
    setupQuickActions() {
        const actions = {
            'open-journal': () => this.openInJournal(),
            'reset-analysis': () => this.resetAnalysis(),
            'back-to-top': () => this.scrollToTop(),
            'export-snapshot': () => this.takeSnapshot()
        };
        
        Object.entries(actions).forEach(([id, action]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', action);
        });
    }
    
    // Take Snapshot function
    takeSnapshot() {
        this.showNotification('Taking snapshot of current analysis...', 'info');
        
        // In a real app, this would capture the current state
        // For now, just show a notification
        setTimeout(() => {
            this.showNotification('Snapshot saved!', 'success');
        }, 1000);
    }
    
    openInJournal() {
        window.location.href = '../cosmic-journal/index.html?pair=' + encodeURIComponent(this.currentPair.symbol);
    }
    
    resetAnalysis() {
        if (confirm('Reset all analysis data?')) {
            this.currentPair = { 
                base: 'EUR', 
                quote: 'USD', 
                symbol: 'EUR/USD',
                tradingViewSymbol: 'FX:EURUSD',
                marketType: 'forex'
            };
            
            // Reset market type buttons
            document.querySelectorAll('.market-type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.marketType === 'forex') {
                    btn.classList.add('active');
                }
            });
            
            const pairSelect = document.getElementById('currency-pair');
            if (pairSelect) {
                this.populatePairSelector('forex');
                pairSelect.value = 'EUR/USD';
            }
            
            this.updateMiniChart();
            this.updateAdvancedChart();
            this.updateEconomicCalendar();
            this.fetchMarketData();
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            // Handle resize if needed
        });
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const existingNotification = document.querySelector('.cosmic-notification');
        if (existingNotification) existingNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = `cosmic-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div class="notification-content">
                <div class="notification-title">${type.toUpperCase()}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fading');
            setTimeout(() => notification.remove(), 300);
        }, duration);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.CosmicAnalyzer = new CosmicAnalyzer();
});
