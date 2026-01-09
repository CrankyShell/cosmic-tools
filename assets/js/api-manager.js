// API Manager - Enhanced with Real Free APIs
class APIManager {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = {
            news: 5 * 60 * 1000, // 5 minutes
            events: 30 * 60 * 1000 // 30 minutes
        };

        
        
        // API Keys (Store securely in production)
        this.apiKeys = {
            alphaVantage: '13JM0Y1Y9HF75Z5M', // Get free from https://www.alphavantage.co/support/#api-key
            newsAPI: '6e99f26281434af4a8141a41518ee0d3', // Get free from https://newsapi.org/register
            fred: '27e50a8b813c19f511d7e926d9113ce8' // Get free from https://fred.stlouisfed.org/docs/api/api_key.html
        };
        
        this.baseURLs = {
            alphaVantage: 'https://www.alphavantage.co/query',
            newsAPI: 'https://newsapi.org/v2',
            fred: 'https://api.stlouisfed.org/fred',
            fxMarketAPI: 'https://fxmarketapi.com'
        };
        
        this.loadFromLocalStorage();
    }

    // Economic Events API - Using free tier from FXMarketAPI
    async getEconomicEvents(country = 'US', date = null) {
        const cacheKey = `events_${country}_${date || 'today'}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            // Option 1: FXMarketAPI (free tier - 100 req/month)
            // Note: This requires signup for API key
            /*
            const response = await fetch(
                `${this.baseURLs.fxMarketAPI}/apicalendar?currency=${country}&date=${date || 'today'}&api_key=${this.apiKeys.fxMarketAPI}`
            );
            const data = await response.json();
            */
            
            // Option 2: FRED API for US economic indicators (free)
            if (country === 'US') {
                const events = await this.getFredEconomicEvents(date);
                
                this.cache.set(cacheKey, {
                    data: events,
                    timestamp: Date.now()
                });
                
                return events;
            }
            
            // Fallback to mock data if API fails
            const mockEvents = this.generateMockEconomicEvents(country, date);
            
            this.cache.set(cacheKey, {
                data: mockEvents,
                timestamp: Date.now()
            });
            
            return mockEvents;
            
        } catch (error) {
            console.warn('Failed to fetch economic events, using mock data:', error.message);
            const mockEvents = this.generateMockEconomicEvents(country, date);
            
            // Still cache mock data to avoid repeated API failures
            this.cache.set(cacheKey, {
                data: mockEvents,
                timestamp: Date.now()
            });
            
            return mockEvents;
        }
    }

    // FRED API for US economic data
    async getFredEconomicEvents(date = null) {
        try {
            // Get recent economic releases
            const response = await fetch(
                `${this.baseURLs.fred}/releases?api_key=${this.apiKeys.fred}&file_type=json&limit=10`
            );
            
            if (!response.ok) {
                throw new Error(`FRED API error: ${response.status}`);
            }
            
            const data = await response.json();
            const events = [];
            
            // Convert FRED data to our format
            if (data.releases && data.releases.length > 0) {
                data.releases.forEach(release => {
                    events.push({
                        time: new Date(release.realtime_start),
                        country: 'US',
                        name: release.name,
                        impact: this.determineImpact(release.name),
                        actual: null,
                        forecast: null,
                        previous: null,
                        description: release.notes || 'US Economic Indicator'
                    });
                });
            }
            
            return events.length > 0 ? events : this.generateMockEconomicEvents('US', date);
            
        } catch (error) {
            console.error('FRED API error:', error);
            return this.generateMockEconomicEvents('US', date);
        }
    }

    // Market News API - Using Alpha Vantage (free tier)
    async getMarketNews(category = 'forex', limit = 10) {
        const cacheKey = `news_${category}_${limit}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            // Alpha Vantage News Feed
            const response = await fetch(
                `${this.baseURLs.alphaVantage}?function=NEWS_SENTIMENT` +
                `&tickers=${this.getTickersForCategory(category)}` +
                `&apikey=${this.apiKeys.alphaVantage}` +
                `&limit=${limit}&sort=LATEST`
            );
            
            if (!response.ok) {
                throw new Error(`Alpha Vantage error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.feed && data.feed.length > 0) {
                const formattedNews = data.feed.map(item => ({
                    title: item.title,
                    excerpt: item.summary || item.title.substring(0, 150) + '...',
                    content: item.summary || '',
                    publishedAt: new Date(item.time_published),
                    source: item.source,
                    url: item.url,
                    category: category,
                    sentiment: item.overall_sentiment_label || 'neutral',
                    tickers: item.ticker_sentiment?.map(t => t.ticker) || []
                }));
                
                this.cache.set(cacheKey, {
                    data: formattedNews,
                    timestamp: Date.now()
                });
                
                return formattedNews;
            }
            
            // Fallback to NewsAPI if Alpha Vantage fails
            return await this.getNewsAPIFallback(category, limit);
            
        } catch (error) {
            console.warn('Failed to fetch market news, trying fallback:', error.message);
            
            // Try fallback API
            try {
                const fallbackNews = await this.getNewsAPIFallback(category, limit);
                if (fallbackNews.length > 0) {
                    this.cache.set(cacheKey, {
                        data: fallbackNews,
                        timestamp: Date.now()
                    });
                    return fallbackNews;
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
            
            // Final fallback to mock data
            const mockNews = this.generateMockMarketNews(category, limit);
            this.cache.set(cacheKey, {
                data: mockNews,
                timestamp: Date.now()
            });
            
            return mockNews;
        }
    }

    // NewsAPI.org fallback
    async getNewsAPIFallback(category, limit) {
        const query = this.getQueryForCategory(category);
        
        const response = await fetch(
            `${this.baseURLs.newsAPI}/everything` +
            `?q=${encodeURIComponent(query)}` +
            `&language=en` +
            `&sortBy=publishedAt` +
            `&pageSize=${limit}` +
            `&apiKey=${this.apiKeys.newsAPI}`
        );
        
        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            return data.articles.map(article => ({
                title: article.title,
                excerpt: article.description || article.title.substring(0, 150) + '...',
                content: article.content || '',
                publishedAt: new Date(article.publishedAt),
                source: article.source.name,
                url: article.url,
                category: category
            }));
        }
        
        return [];
    }

    // Helper methods
    getTickersForCategory(category) {
        const tickerMap = {
            'forex': 'EURUSD,GBPUSD,USDJPY',
            'stocks': 'AAPL,MSFT,GOOGL,TSLA',
            'crypto': 'BTC,ETH',
            'indices': 'SPY,DIA,QQQ'
        };
        return tickerMap[category] || 'forex';
    }

    getQueryForCategory(category) {
        const queryMap = {
            'forex': 'forex trading currency',
            'stocks': 'stock market investing',
            'crypto': 'cryptocurrency bitcoin',
            'indices': 'stock index S&P 500'
        };
        return queryMap[category] || 'financial markets';
    }

    determineImpact(eventName) {
        const highImpact = ['cpi', 'inflation', 'interest rate', 'fed', 'ecb', 'boe', 'non-farm', 'gdp'];
        const mediumImpact = ['retail sales', 'manufacturing', 'unemployment', 'housing'];
        
        const lowerName = eventName.toLowerCase();
        
        if (highImpact.some(term => lowerName.includes(term))) return 'high';
        if (mediumImpact.some(term => lowerName.includes(term))) return 'medium';
        return 'low';
    }

    // Cache management (unchanged)
    getFromCache(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
            const cacheType = cacheKey.split('_')[0];
            const duration = this.cacheDuration[cacheType] || this.cacheDuration.news;
            
            if (Date.now() - cached.timestamp < duration) {
                return cached.data;
            } else {
                this.cache.delete(cacheKey);
            }
        }
        return null;
    }

    // Mock data generators (keep as fallback)
    generateMockEconomicEvents(country, date) {
        // ... (keep your existing mock data generator) ...
        const now = new Date();
        const events = [];
        
        const countryEvents = {
            'US': [
                { name: 'CPI Data', impact: 'high', time: new Date(now.getTime() + 2 * 60 * 60 * 1000) },
                { name: 'Fed Interest Rate Decision', impact: 'high', time: new Date(now.getTime() + 4 * 60 * 60 * 1000) },
                { name: 'Non-Farm Payrolls', impact: 'high', time: new Date(now.getTime() + 6 * 60 * 60 * 1000) }
            ],
            'EU': [
                { name: 'ECB Press Conference', impact: 'high', time: new Date(now.getTime() + 3 * 60 * 60 * 1000) },
                { name: 'German ZEW Economic Sentiment', impact: 'medium', time: new Date(now.getTime() + 5 * 60 * 60 * 1000) },
                { name: 'Eurozone CPI', impact: 'high', time: new Date(now.getTime() + 7 * 60 * 60 * 1000) }
            ],
            'UK': [
                { name: 'BOE Interest Rate Decision', impact: 'high', time: new Date(now.getTime() + 1 * 60 * 60 * 1000) },
                { name: 'UK Inflation Data', impact: 'high', time: new Date(now.getTime() + 3 * 60 * 60 * 1000) }
            ]
        };
        
        const countryData = countryEvents[country] || countryEvents['US'];
        
        countryData.forEach((event, index) => {
            events.push({
                time: event.time,
                country: country,
                name: event.name,
                impact: event.impact,
                actual: index === 0 ? '+3.2%' : null,
                forecast: '+0.3%',
                previous: '+0.2%',
                description: this.getEventDescription(event.name)
            });
        });
        
        return events.sort((a, b) => a.time - b.time);
    }

    generateMockMarketNews(category, limit) {
        // ... (keep your existing mock data generator) ...
        const now = new Date();
        const news = [];
        
        const categoryTitles = {
            'forex': [
                'Major Currency Pairs Show Volatility',
                'Central Bank Decisions Impact Forex Markets',
                'Technical Analysis: Key Levels to Watch'
            ],
            'stocks': [
                'Tech Stocks Rally on Earnings Reports',
                'Market Indices Reach New Highs',
                'Sector Rotation Trends Emerging'
            ],
            'crypto': [
                'Bitcoin Tests Resistance Level',
                'Altcoin Market Shows Strength',
                'Regulatory Developments Impact Crypto'
            ]
        };
        
        const titles = categoryTitles[category] || categoryTitles['forex'];
        
        for (let i = 0; i < Math.min(limit, titles.length); i++) {
            news.push({
                title: titles[i],
                excerpt: `Latest developments in ${category} markets affecting trading decisions and market sentiment.`,
                content: `This is a detailed analysis of current ${category} market conditions. Traders should consider multiple factors when making investment decisions.`,
                publishedAt: new Date(now.getTime() - i * 60 * 60 * 1000),
                source: 'Market Analysis',
                url: `https://www.example.com/news/${category}/${i}`,
                category: category
            });
        }
        
        return news;
    }

    getEventDescription(eventName) {
        // ... (keep your existing descriptions) ...
        const descriptions = {
            'CPI Data': 'Consumer Price Index measures changes in the price level of consumer goods and services.',
            'Fed Interest Rate Decision': 'The Federal Reserve sets the target range for the federal funds rate.',
            'Non-Farm Payrolls': 'Measures the number of jobs added or lost in the U.S. economy.',
            'ECB Press Conference': 'European Central Bank press conference following monetary policy decisions.'
        };
        
        return descriptions[eventName] || 'Important economic indicator that can impact financial markets.';
    }

    // Local Storage for cache persistence (unchanged)
    saveToLocalStorage() {
        const data = {
            cache: Array.from(this.cache.entries()),
            lastReset: new Date().toDateString()
        };
        localStorage.setItem('cosmic-api-cache', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('cosmic-api-cache');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Reset cache if new day
                if (data.lastReset !== new Date().toDateString()) {
                    this.cache.clear();
                } else if (data.cache) {
                    // Restore cache
                    this.cache = new Map(data.cache.map(([key, value]) => {
                        // Check if cache is still valid
                        const cacheType = key.split('_')[0];
                        const duration = this.cacheDuration[cacheType] || this.cacheDuration.news;
                        
                        if (Date.now() - value.timestamp < duration) {
                            return [key, value];
                        }
                        return null;
                    }).filter(item => item !== null));
                }
            }
        } catch (error) {
            console.error('Error loading API cache:', error);
        }
    }

    // Clear cache method
    clearCache() {
        this.cache.clear();
        localStorage.removeItem('cosmic-api-cache');
        console.log('API cache cleared');
    }

    // Test API connectivity
    async testAPIConnectivity() {
        const results = {
            alphaVantage: false,
            newsAPI: false,
            fred: false
        };
        
        try {
            // Test Alpha Vantage
            const avTest = await fetch(
                `${this.baseURLs.alphaVantage}?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${this.apiKeys.alphaVantage}`
            );
            results.alphaVantage = avTest.ok;
        } catch (e) {
            console.warn('Alpha Vantage test failed:', e.message);
        }
        
        return results;
    }
}

// Create global instance
window.APIManager = new APIManager();
