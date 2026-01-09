// News filtering for Cosmic Analyzer
(function() {
    'use strict';
    
    const NewsFilter = {
        init: function() {
            this.loadFilteredNews();
            this.setupEventListeners();
        },
        
        setupEventListeners: function() {
            // Listen for pair changes
            const pairSelect = document.getElementById('currency-pair');
            if (pairSelect) {
                pairSelect.addEventListener('change', () => this.loadFilteredNews());
            }
            
            // Listen for calendar toggle
            const calendarToggle = document.getElementById('calendar-toggle');
            if (calendarToggle) {
                calendarToggle.addEventListener('change', () => this.loadFilteredNews());
            }
        },
        
        loadFilteredNews: function() {
            const container = document.getElementById('news-container');
            if (!container) return;
            
            const loadingHTML = `
                <div class="loading-news">
                    <div class="loading-spinner"></div>
                    <p>Loading filtered news...</p>
                </div>
            `;
            container.innerHTML = loadingHTML;
            
            // Get current pair
            const pairSelect = document.getElementById('currency-pair');
            const selectedPair = pairSelect ? pairSelect.value : 'EUR/USD';
            
            // Get filter setting
            const calendarToggle = document.getElementById('calendar-toggle');
            const filterByPair = calendarToggle ? calendarToggle.checked : true;
            
            // Simulate API call delay
            setTimeout(() => {
                this.displayFilteredNews(selectedPair, filterByPair);
            }, 1000);
        },
        
        displayFilteredNews: function(pair, filterByPair) {
            const container = document.getElementById('news-container');
            if (!container) return;
            
            // Extract currencies from pair
            const currencies = pair.split('/');
            const baseCurrency = currencies[0];
            const quoteCurrency = currencies[1] || '';
            
            // Sample news data (in real app, this would come from an API)
            const allNews = this.getSampleNews();
            
            // Filter news if needed
            const filteredNews = filterByPair 
                ? this.filterNewsByCurrencies(allNews, [baseCurrency, quoteCurrency])
                : allNews;
            
            if (filteredNews.length === 0) {
                container.innerHTML = this.getNoNewsHTML(pair, filterByPair);
                return;
            }
            
            // Display filtered news
            let newsHTML = `
                <div class="news-stats">
                    <div class="news-stat">
                        <div class="stat-label">Total News</div>
                        <div class="stat-value">${filteredNews.length}</div>
                    </div>
                    <div class="news-stat">
                        <div class="stat-label">Filtered for</div>
                        <div class="stat-value">${pair}</div>
                    </div>
                </div>
            `;
            
            filteredNews.forEach(news => {
                newsHTML += this.getNewsItemHTML(news);
            });
            
            container.innerHTML = newsHTML;
        },
        
        filterNewsByCurrencies: function(newsItems, currencies) {
            return newsItems.filter(news => {
                // Check if news title or description contains any of the currencies
                const searchText = (news.title + ' ' + news.description).toUpperCase();
                return currencies.some(currency => {
                    if (!currency) return false;
                    return searchText.includes(currency.toUpperCase());
                });
            });
        },
        
        getSampleNews: function() {
            return [
                {
                    id: 1,
                    time: '14:30',
                    title: 'EUR Strengthens Ahead of ECB Decision',
                    description: 'The Euro gained against major currencies as investors await the European Central Bank policy meeting.',
                    source: 'Reuters',
                    sentiment: 'bullish',
                    category: 'Forex',
                    age: '2 hours ago',
                    currencies: ['EUR']
                },
                {
                    id: 2,
                    time: '13:15',
                    title: 'USD Inflation Data Below Expectations',
                    description: 'US inflation data came in lower than expected, putting pressure on the dollar.',
                    source: 'Bloomberg',
                    sentiment: 'bearish',
                    category: 'Forex',
                    age: '3 hours ago',
                    currencies: ['USD']
                },
                {
                    id: 3,
                    time: '12:45',
                    title: 'GBP Volatility Ahead of Brexit Talks',
                    description: 'The British Pound shows increased volatility as new Brexit negotiations begin.',
                    source: 'Financial Times',
                    sentiment: 'neutral',
                    category: 'Forex',
                    age: '4 hours ago',
                    currencies: ['GBP']
                },
                {
                    id: 4,
                    time: '11:30',
                    title: 'JPY Safe Haven Demand Increases',
                    description: 'Japanese Yen strengthens as global market uncertainty drives safe haven demand.',
                    source: 'Nikkei',
                    sentiment: 'bullish',
                    category: 'Forex',
                    age: '5 hours ago',
                    currencies: ['JPY']
                },
                {
                    id: 5,
                    time: '10:15',
                    title: 'AUD Impacted by China Trade Data',
                    description: 'Australian Dollar reacts to mixed trade data from China, its largest trading partner.',
                    source: 'WSJ',
                    sentiment: 'neutral',
                    category: 'Forex',
                    age: '6 hours ago',
                    currencies: ['AUD']
                },
                {
                    id: 6,
                    time: '09:45',
                    title: 'CAD Strengthens on Oil Price Rally',
                    description: 'Canadian Dollar gains as crude oil prices hit three-month highs.',
                    source: 'Reuters',
                    sentiment: 'bullish',
                    category: 'Forex',
                    age: '7 hours ago',
                    currencies: ['CAD']
                }
            ];
        },
        
        getNewsItemHTML: function(news) {
            return `
                <div class="api-news-item sentiment-${news.sentiment}">
                    <div class="news-time-badge">
                        <div class="news-time">${news.time}</div>
                        <div class="sentiment-badge ${news.sentiment}">${news.sentiment}</div>
                    </div>
                    <div class="news-content">
                        <h5 class="news-title">
                            <a href="#" onclick="return false;">${news.title}</a>
                        </h5>
                        <p class="news-excerpt">${news.description}</p>
                        <div class="news-meta">
                            <span class="news-source">${news.source}</span>
                            <span class="news-category">${news.category}</span>
                            <span class="news-age">${news.age}</span>
                        </div>
                    </div>
                    <div class="news-actions">
                        <button class="news-save-btn" title="Save"><i class="fas fa-bookmark"></i></button>
                        <button class="news-share-btn" title="Share"><i class="fas fa-share"></i></button>
                    </div>
                </div>
            `;
        },
        
        getNoNewsHTML: function(pair, filterByPair) {
            return `
                <div class="news-fallback">
                    <div class="fallback-icon">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <h4>No News Found</h4>
                    <p>
                        ${filterByPair 
                            ? `No news articles found specifically for ${pair}.` 
                            : 'No news articles available at the moment.'}
                    </p>
                    <button class="retry-btn" onclick="NewsFilter.loadFilteredNews()">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                    ${filterByPair ? `
                        <div class="fallback-tips">
                            <p>Try:</p>
                            <ul>
                                <li>Disabling "Pair-Specific News" to see all market news</li>
                                <li>Selecting a different currency pair</li>
                                <li>Checking back in a few minutes</li>
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    };
    
    // Make it globally available
    window.NewsFilter = NewsFilter;
    window.loadFilteredNews = NewsFilter.loadFilteredNews.bind(NewsFilter);
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NewsFilter.init());
    } else {
        NewsFilter.init();
    }
})();
