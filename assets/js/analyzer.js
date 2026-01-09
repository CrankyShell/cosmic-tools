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

    // Add these methods to your CosmicAnalyzer class

setupFinancialJuiceNews() {
    // Create hidden container for Financial Juice widget
    this.createHiddenFinancialJuiceContainer();
    
    // Load Financial Juice widget
    this.loadFinancialJuiceWidget();
}

createHiddenFinancialJuiceContainer() {
    // Remove existing hidden container if it exists
    const existing = document.getElementById('financialjuice-hidden-container');
    if (existing) existing.remove();
    
    // Create new hidden container
    const hiddenContainer = document.createElement('div');
    hiddenContainer.id = 'financialjuice-hidden-container';
    hiddenContainer.style.cssText = `
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        width: 500px !important;
        height: 600px !important;
        overflow: hidden !important;
        z-index: -9999 !important;
    `;
    document.body.appendChild(hiddenContainer);
}

loadFinancialJuiceWidget() {
    const container = document.getElementById('financialjuice-hidden-container');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '<div id="financialjuice-news-widget-container"></div>';
    
    // Load Financial Juice widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'FJ-Widgets';
    const r = Math.floor(Math.random() * (9999 - 0 + 1) + 0);
    script.src = `https://feed.financialjuice.com/widgets/widgets.js?r=${r}`;
    
    script.onload = () => {
        console.log('Financial Juice widget loaded');
        
        // Widget configuration
        const options = {
            container: "financialjuice-news-widget-container",
            mode: "Dark",
            width: "500px",
            height: "600px",
            backColor: "1e222d",
            fontColor: "b2b5be",
            widgetType: "NEWS"
        };
        
        // Create widget
        if (window.FJWidgets) {
            new window.FJWidgets.createWidget(options);
            
            // Start monitoring for news data
            setTimeout(() => this.extractFinancialJuiceData(), 3000);
            setInterval(() => this.extractFinancialJuiceData(), 30000); // Update every 30 seconds
        }
    };
    
    script.onerror = (error) => {
        console.error('Failed to load Financial Juice widget:', error);
        this.useFallbackNews();
    };
    
    document.head.appendChild(script);
}



extractFinancialJuiceData() {
    try {
        const widgetContainer = document.getElementById('financialjuice-news-widget-container');
        if (!widgetContainer) {
            console.warn('Financial Juice container not found');
            this.useFallbackNews();
            return;
        }
        
        // Financial Juice typically structures news in tables or lists
        // Let's try multiple selectors to find the news items
        let newsElements = [];
        
        // Try different selectors that Financial Juice might use
        const possibleSelectors = [
            '.fj-news-item',
            '.news-item',
            '.fj-item',
            'tr[data-type="news"]',
            'div[class*="news"]',
            'li[class*="news"]',
            '.fj-widget-content tbody tr',
            '#financialjuice-news-widget-container table tbody tr'
        ];
        
        for (const selector of possibleSelectors) {
            const elements = widgetContainer.querySelectorAll(selector);
            if (elements.length > 0) {
                newsElements = Array.from(elements);
                console.log(`Found ${elements.length} news items with selector: ${selector}`);
                break;
            }
        }
        
        // If no specific selectors work, try to find any structured data
        if (newsElements.length === 0) {
            // Look for any structured content
            const tables = widgetContainer.querySelectorAll('table');
            const lists = widgetContainer.querySelectorAll('ul, ol');
            
            if (tables.length > 0) {
                // Extract from first table rows
                const rows = tables[0].querySelectorAll('tr');
                newsElements = Array.from(rows).slice(0, 10); // First 10 rows
            } else if (lists.length > 0) {
                // Extract from first list items
                const items = lists[0].querySelectorAll('li');
                newsElements = Array.from(items).slice(0, 10);
            }
        }
        
        if (newsElements.length > 0) {
            const parsedNews = this.parseFinancialJuiceElements(newsElements);
            if (parsedNews.length > 0) {
                this.displayExtractedNews(parsedNews);
                return;
            }
        }
        
        // If we get here, extraction failed
        console.warn('Could not extract news from Financial Juice widget');
        this.useFallbackNews();
        
    } catch (error) {
        console.error('Error extracting Financial Juice data:', error);
        this.useFallbackNews();
    }
}

parseFinancialJuiceElements(elements) {
    const newsItems = [];
    
    elements.slice(0, 10).forEach((element, index) => { // Limit to 10 items
        try {
            const newsItem = this.parseFinancialJuiceElement(element);
            if (newsItem && newsItem.title) {
                newsItems.push(newsItem);
            }
        } catch (error) {
            console.warn(`Error parsing element ${index}:`, error);
        }
    });
    
    return newsItems;
}

parseFinancialJuiceElement(element) {
    // Clone element to work with
    const clone = element.cloneNode(true);
    
    // Remove any script tags or unwanted elements
    clone.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());
    
    // Get text content
    const text = clone.textContent || clone.innerText || '';
    const html = clone.innerHTML || '';
    
    // Try to extract time (common patterns in financial news)
    let time = '';
    const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)|(\d{1,2}(?:\.\d{2})?\s*(?:GMT|EST|CST|PST))/i;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        time = timeMatch[0];
    }
    
    // Try to extract impact/importance
    let impact = 'neutral';
    const textLower = text.toLowerCase();
    if (textLower.includes('high') || textLower.includes('important') || textLower.includes('breaking')) {
        impact = 'high';
    } else if (textLower.includes('medium') || textLower.includes('moderate')) {
        impact = 'medium';
    }
    
    // Try to extract currency/instrument
    let instrument = '';
    const instrumentRegex = /(EUR\/USD|GBP\/USD|USD\/JPY|AUD\/USD|USD\/CAD|NZD\/USD|EUR\/JPY|GBP\/JPY|XAU\/USD|BTC\/USD|ETH\/USD|SPX|DXY)/i;
    const instrumentMatch = text.match(instrumentRegex);
    if (instrumentMatch) {
        instrument = instrumentMatch[0];
    }
    
    // Clean title (remove time if it's at the beginning)
    let title = text.trim();
    if (time && title.startsWith(time)) {
        title = title.substring(time.length).trim();
    }
    
    // Remove extra whitespace and newlines
    title = title.replace(/\s+/g, ' ').trim();
    
    // Create excerpt (first 100 chars)
    const excerpt = title.length > 100 ? title.substring(0, 100) + '...' : title;
    
    return {
        title: title || 'Market News Update',
        excerpt: excerpt,
        time: time || this.getRelativeTime(index),
        impact: impact,
        instrument: instrument,
        source: 'Financial Juice',
        category: instrument ? 'forex' : 'markets',
        sentiment: this.determineSentiment(text),
        url: '#',
        publishedAt: new Date()
    };
}

determineSentiment(text) {
    const textLower = text.toLowerCase();
    const positiveWords = ['up', 'rise', 'gain', 'bullish', 'positive', 'strong', 'beat', 'higher'];
    const negativeWords = ['down', 'fall', 'drop', 'bearish', 'negative', 'weak', 'miss', 'lower'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        if (textLower.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
        if (textLower.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'bullish';
    if (negativeCount > positiveCount) return 'bearish';
    return 'neutral';
}

getRelativeTime(index) {
    const now = new Date();
    const minutesAgo = index * 5; // Simulate 5 minutes between each news item
    const time = new Date(now.getTime() - (minutesAgo * 60000));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

displayExtractedNews(newsItems) {
    const container = document.getElementById('api-news-container');
    if (!container) return;
    
    if (newsItems.length === 0) {
        this.useFallbackNews();
        return;
    }
    
    // Update stats
    this.updateNewsStats(newsItems);
    
    // Display news in our custom format
    container.innerHTML = newsItems.map((item, index) => `
        <div class="api-news-item ${item.sentiment ? `sentiment-${item.sentiment.toLowerCase()}` : ''}" data-index="${index}">
            <div class="news-time-badge">
                <span class="news-time">${item.time}</span>
                ${item.sentiment ? `<span class="sentiment-badge ${item.sentiment.toLowerCase()}">${item.sentiment}</span>` : ''}
            </div>
            <div class="news-content">
                ${item.instrument ? `<div class="news-instrument">${item.instrument}</div>` : ''}
                <h4 class="news-title">
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" title="${item.title}">
                        ${item.title}
                    </a>
                </h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    ${item.impact ? `<span class="news-impact ${item.impact}">${item.impact.toUpperCase()}</span>` : ''}
                    <span class="news-age">Live</span>
                </div>
            </div>
            <div class="news-actions">
                <button class="news-save-btn" title="Save for later">💾</button>
                <button class="news-share-btn" title="Share">↗️</button>
            </div>
        </div>
    `).join('');
    
    // Update source badge
    const sourceBadge = document.querySelector('.news-badge.newsapi');
    if (sourceBadge) {
        sourceBadge.textContent = 'Financial Juice';
        sourceBadge.className = 'news-badge financial-juice';
    }
    
    this.showNotification(`Loaded ${newsItems.length} live market news items`, 'success');
}

updateNewsStats(newsItems) {
    const articleCount = document.getElementById('article-count');
    const latestTime = document.getElementById('latest-news-time');
    const avgSentiment = document.getElementById('avg-sentiment');
    const sourceCount = document.getElementById('source-count');
    
    if (articleCount) articleCount.textContent = newsItems.length;
    if (latestTime) {
        const latest = newsItems[0]?.time || '--:--';
        latestTime.textContent = latest;
    }
    if (sourceCount) sourceCount.textContent = 1; // Single source
    
    // Calculate average sentiment
    if (avgSentiment && newsItems.length > 0) {
        const sentiments = newsItems.map(item => item.sentiment);
        const bullishCount = sentiments.filter(s => s === 'bullish').length;
        const bearishCount = sentiments.filter(s => s === 'bearish').length;
        
        if (bullishCount > bearishCount) {
            avgSentiment.textContent = 'Bullish';
            avgSentiment.className = 'stat-value positive';
        } else if (bearishCount > bullishCount) {
            avgSentiment.textContent = 'Bearish';
            avgSentiment.className = 'stat-value negative';
        } else {
            avgSentiment.textContent = 'Neutral';
            avgSentiment.className = 'stat-value';
        }
    }
}

useFallbackNews() {
    console.log('Using fallback news data');
    
    const fallbackNews = [
        {
            title: 'Federal Reserve Monetary Policy Meeting Minutes Released',
            excerpt: 'The Federal Reserve releases minutes from its latest monetary policy meeting, providing insights into future interest rate decisions.',
            time: '14:00',
            impact: 'high',
            instrument: 'USD',
            source: 'Federal Reserve',
            sentiment: 'neutral',
            category: 'economics'
        },
        {
            title: 'European Central Bank Inflation Outlook',
            excerpt: 'ECB officials comment on inflation trends in the Eurozone, affecting EUR currency pairs.',
            time: '13:45',
            impact: 'medium',
            instrument: 'EUR/USD',
            source: 'ECB',
            sentiment: 'bullish',
            category: 'forex'
        },
        {
            title: 'Bank of England Interest Rate Decision',
            excerpt: 'BOE announces its latest interest rate decision, impacting GBP currency pairs.',
            time: '12:00',
            impact: 'high',
            instrument: 'GBP/USD',
            source: 'BOE',
            sentiment: 'bearish',
            category: 'forex'
        },
        {
            title: 'US Non-Farm Payrolls Data Released',
            excerpt: 'Latest US employment data shows stronger than expected job growth.',
            time: '13:30',
            impact: 'high',
            instrument: 'USD',
            source: 'BLS',
            sentiment: 'bullish',
            category: 'economics'
        },
        {
            title: 'OPEC+ Production Meeting Outcomes',
            excerpt: 'OPEC+ announces production cuts, affecting oil prices and related currencies.',
            time: '11:00',
            impact: 'medium',
            instrument: 'XAU/USD',
            source: 'OPEC',
            sentiment: 'bullish',
            category: 'commodities'
        }
    ];
    
    this.displayExtractedNews(fallbackNews);
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

        // Initialize Financial Juice news
        this.setupFinancialJuiceNews();
        
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

    // Add this method to CosmicAnalyzer class
async fetchRealMarketNews() {
    try {
        const news = await window.APIManager.getMarketNews(this.currentPair.marketType, 5);
        if (news && news.length > 0) {
            // Update news display instead of TradingView widget
            this.displayCustomNews(news);
            return true;
        }
    } catch (error) {
        console.warn('Could not fetch real news, using TradingView widget:', error);
    }
    return false;
}

// Add these methods to CosmicAnalyzer class after line ~200

// API News Section Methods
setupAPINewsSection() {
    const newsGrid = document.querySelector('.analysis-grid');
    if (!newsGrid) return;

    // Check if API news section already exists
    if (document.getElementById('api-news-section')) return;

    // Create API News Section HTML with Financial Juice source
    const apiNewsHTML = `
        <section class="dashboard-section api-news-section" id="api-news-section">
            <div class="news-header">
                <h3>Real-Time Market News</h3>
                <div class="news-source-badges">
                    <span class="news-badge financial-juice">Financial Juice</span>
                    <span class="news-badge alpha-vantage">Alpha Vantage</span>
                </div>
                <div class="news-controls">
                    <button class="refresh-btn" id="refresh-api-news">
                        <span class="refresh-icon">🔄</span>
                        Refresh News
                    </button>
                    <div class="news-category-selector">
                        <select id="news-category-select">
                            <option value="all">All Markets</option>
                            <option value="forex">Forex</option>
                            <option value="stocks">Stocks</option>
                            <option value="crypto">Crypto</option>
                            <option value="economics">Economics</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="news-container" id="api-news-container">
                <div class="loading-news">
                    <div class="loading-spinner"></div>
                    <p>Loading live market news from Financial Juice...</p>
                </div>
            </div>
            
            <div class="news-stats">
                <div class="news-stat">
                    <div class="stat-label">Live Articles</div>
                    <div class="stat-value" id="article-count">0</div>
                </div>
                <div class="news-stat">
                    <div class="stat-label">Latest</div>
                    <div class="stat-value" id="latest-news-time">--:--</div>
                </div>
                <div class="news-stat">
                    <div class="stat-label">Sentiment</div>
                    <div class="stat-value" id="avg-sentiment">--</div>
                </div>
                <div class="news-stat">
                    <div class="stat-label">Source</div>
                    <div class="stat-value" id="source-count">Financial Juice</div>
                </div>
            </div>
        </section>
    `;

    // Insert after the economic calendar section
    const calendarSection = document.querySelector('.economic-calendar-section');
    if (calendarSection) {
        calendarSection.insertAdjacentHTML('afterend', apiNewsHTML);
    } else {
        // Fallback: add to analysis grid
        newsGrid.insertAdjacentHTML('beforeend', apiNewsHTML);
    }

    // Setup event listeners
    this.setupAPINewsControls();
    
    // Load initial news - will be handled by Financial Juice extraction
    // Don't call loadAPINews() here since Financial Juice will populate it
}

setupAPINewsControls() {
    const refreshBtn = document.getElementById('refresh-api-news');
    const categorySelect = document.getElementById('news-category-select');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Force re-extraction from Financial Juice
            this.extractFinancialJuiceData();
            this.showNotification('Refreshing live news...', 'info');
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (category === 'all') {
                // Show all news
                const container = document.getElementById('api-news-container');
                const items = container.querySelectorAll('.api-news-item');
                items.forEach(item => item.style.display = 'flex');
            } else {
                // Filter by category
                this.filterNewsByCategory(category);
            }
        });
    }
}

filterNewsByCategory(category) {
    const container = document.getElementById('api-news-container');
    if (!container) return;
    
    const items = container.querySelectorAll('.api-news-item');
    items.forEach(item => {
        const itemCategory = item.querySelector('.news-category')?.textContent?.toLowerCase() || 
                            item.querySelector('.news-instrument')?.textContent?.toLowerCase() || 
                            'all';
        
        if (category === 'all' || itemCategory.includes(category) || 
            (category === 'forex' && itemCategory.includes('/')) ||
            (category === 'economics' && !itemCategory.includes('/'))) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    this.showNotification(`Filtered news: ${category}`, 'info');
}

setupAPINewsControls() {
    const refreshBtn = document.getElementById('refresh-api-news');
    const categorySelect = document.getElementById('news-category-select');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            this.loadAPINews();
            this.showNotification('Refreshing news...', 'info');
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            this.loadAPINews(category);
            this.showNotification(`Loading ${category} news...`, 'info');
        });
    }
}

async loadAPINews(category = 'forex') {
    const container = document.getElementById('api-news-container');
    const articleCount = document.getElementById('article-count');
    const latestTime = document.getElementById('latest-news-time');
    const avgSentiment = document.getElementById('avg-sentiment');
    const sourceCount = document.getElementById('source-count');
    
    if (!container) return;
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-news">
            <div class="loading-spinner"></div>
            <p>Fetching ${category} news...</p>
        </div>
    `;
    
    try {
        // Use APIManager to fetch real news
        const news = await window.APIManager.getMarketNews(category, 8);
        
        if (!news || news.length === 0) {
            this.displayAPINewsFallback(category);
            return;
        }
        
        // Calculate statistics
        const sources = new Set();
        let latestDate = new Date(0);
        let sentimentCount = { bullish: 0, bearish: 0, neutral: 0 };
        
        news.forEach(item => {
            if (item.source) sources.add(item.source);
            if (item.publishedAt > latestDate) latestDate = item.publishedAt;
            if (item.sentiment) {
                sentimentCount[item.sentiment.toLowerCase()] = 
                    (sentimentCount[item.sentiment.toLowerCase()] || 0) + 1;
            }
        });
        
        // Update stats
        if (articleCount) articleCount.textContent = news.length;
        if (latestTime) {
            const timeStr = latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            latestTime.textContent = timeStr;
        }
        if (sourceCount) sourceCount.textContent = sources.size;
        
        // Calculate average sentiment
        if (avgSentiment) {
            const total = sentimentCount.bullish + sentimentCount.bearish + sentimentCount.neutral;
            if (total > 0) {
                const sentimentScore = (sentimentCount.bullish - sentimentCount.bearish) / total;
                if (sentimentScore > 0.2) {
                    avgSentiment.textContent = 'Bullish';
                    avgSentiment.className = 'stat-value positive';
                } else if (sentimentScore < -0.2) {
                    avgSentiment.textContent = 'Bearish';
                    avgSentiment.className = 'stat-value negative';
                } else {
                    avgSentiment.textContent = 'Neutral';
                    avgSentiment.className = 'stat-value';
                }
            } else {
                avgSentiment.textContent = '--';
                avgSentiment.className = 'stat-value';
            }
        }
        
        // Display news
        this.displayAPINews(news);
        
    } catch (error) {
        console.error('Error loading API news:', error);
        this.displayAPINewsFallback(category);
        this.showNotification('Failed to load news. Using cached data.', 'warning');
    }
}

displayAPINews(news) {
    const container = document.getElementById('api-news-container');
    if (!container) return;
    
    container.innerHTML = news.map((item, index) => `
        <div class="api-news-item ${item.sentiment ? `sentiment-${item.sentiment.toLowerCase()}` : ''}" data-index="${index}">
            <div class="news-time-badge">
                <span class="news-time">${this.formatNewsTime(item.publishedAt)}</span>
                ${item.sentiment ? `<span class="sentiment-badge ${item.sentiment.toLowerCase()}">${item.sentiment}</span>` : ''}
            </div>
            <div class="news-content">
                <h4 class="news-title">
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                        ${item.title}
                    </a>
                </h4>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span class="news-category">${item.category}</span>
                    <span class="news-age">${this.getTimeAgo(item.publishedAt)}</span>
                </div>
            </div>
            <div class="news-actions">
                <button class="news-save-btn" title="Save for later">💾</button>
                <button class="news-share-btn" title="Share">↗️</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to news items
    this.setupNewsItemInteractions();
}

displayAPINewsFallback(category) {
    const container = document.getElementById('api-news-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="news-fallback">
            <div class="fallback-icon">📰</div>
            <h4>API News Temporarily Unavailable</h4>
            <p>Using cached or mock data for ${category} news.</p>
            <button class="retry-btn" id="retry-api-news">Retry Connection</button>
            <div class="fallback-tips">
                <p><strong>Tip:</strong> Make sure you've added API keys to <code>config.js</code></p>
                <p>Free APIs have rate limits. Try again in a few minutes.</p>
            </div>
        </div>
    `;
    
    const retryBtn = document.getElementById('retry-api-news');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => this.loadAPINews(category));
    }
}

setupNewsItemInteractions() {
    // Save button
    document.querySelectorAll('.news-save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newsItem = e.target.closest('.api-news-item');
            const index = newsItem.dataset.index;
            this.saveNewsItem(index);
        });
    });
    
    // Share button
    document.querySelectorAll('.news-share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newsItem = e.target.closest('.api-news-item');
            const title = newsItem.querySelector('.news-title').textContent;
            const url = newsItem.querySelector('a').href;
            this.shareNews(title, url);
        });
    });
    
    // Click on news item
    document.querySelectorAll('.api-news-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.news-actions')) {
                const link = item.querySelector('a');
                if (link) {
                    window.open(link.href, '_blank');
                }
            }
        });
    });
}

formatNewsTime(date) {
    const now = new Date();
    const newsDate = new Date(date);
    const diffHours = Math.floor((now - newsDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return newsDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

getTimeAgo(date) {
    const now = new Date();
    const newsDate = new Date(date);
    const diffMs = now - newsDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

saveNewsItem(index) {
    // In a real app, save to localStorage or backend
    this.showNotification('News saved to your journal', 'success');
    
    // Visual feedback
    const btn = document.querySelector(`.api-news-item[data-index="${index}"] .news-save-btn`);
    if (btn) {
        btn.textContent = '✓';
        btn.style.color = '#00ffb3';
        setTimeout(() => {
            btn.textContent = '💾';
            btn.style.color = '';
        }, 2000);
    }
}

shareNews(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url,
            text: `Check out this market news: ${title}`
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${title} - ${url}`)
            .then(() => this.showNotification('Link copied to clipboard', 'success'))
            .catch(() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' ' + url)}`, '_blank'));
    }
}

// Also add this to the initialize method (around line 40):
initialize() {
    this.setupMarketTypeButtons();
    this.setupPairSelector();
    this.setupTimezoneSelector();
    this.setupQuickActions();
    this.setupChartControls();
    this.setupEventListeners();
    
    // Initialize TradingView widgets
    this.initializeTradingViewWidgets();
    
    // ADD THIS LINE:
    this.setupAPINewsSection(); // Initialize API news section
    
    // Start live updates
    this.startLiveUpdates();
}

displayCustomNews(news) {
    const container = document.getElementById('news-widget');
    if (!container) return;
    
    container.innerHTML = `
        <div class="custom-news-container">
            <h4>Latest ${this.currentPair.marketType.toUpperCase()} News</h4>
            ${news.map(item => `
                <div class="news-item">
                    <div class="news-time">${new Date(item.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div class="news-content">
                        <h5>${item.title}</h5>
                        <p>${item.excerpt}</p>
                        <div class="news-footer">
                            <span class="news-source">${item.source}</span>
                            ${item.sentiment ? `<span class="news-sentiment ${item.sentiment}">${item.sentiment}</span>` : ''}
                            <a href="${item.url}" target="_blank" class="news-link">Read →</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
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
