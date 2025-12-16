// API Manager - Simplified for News Only
class APIManager {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = {
            news: 5 * 60 * 1000, // 5 minutes
            events: 30 * 60 * 1000 // 30 minutes
        };
        
        this.loadFromLocalStorage();
    }

    // Economic Events API (mock/placeholder - replace with real API)
    async getEconomicEvents(country = 'US', date = null) {
        const cacheKey = `events_${country}_${date || 'today'}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            // Note: Replace with real economic calendar API
            // Example: https://www.econdb.com/api/ or similar
            // For now, using mock data
            const mockEvents = this.generateMockEconomicEvents(country, date);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: mockEvents,
                timestamp: Date.now()
            });
            
            return mockEvents;
            
        } catch (error) {
            console.warn('Failed to fetch economic events, using mock data:', error.message);
            return this.generateMockEconomicEvents(country, date);
        }
    }

    // Market News API (mock/placeholder - replace with real API)
    async getMarketNews(category = 'forex', limit = 10) {
        const cacheKey = `news_${category}_${limit}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            // Note: Replace with real news API
            // Options: NewsAPI, Alpha Vantage News, etc.
            // For now, using mock data
            const mockNews = this.generateMockMarketNews(category, limit);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: mockNews,
                timestamp: Date.now()
            });
            
            return mockNews;
            
        } catch (error) {
            console.warn('Failed to fetch market news, using mock data:', error.message);
            return this.generateMockMarketNews(category, limit);
        }
    }

    // Cache management
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

    // Mock data generators
    generateMockEconomicEvents(country, date) {
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
        const descriptions = {
            'CPI Data': 'Consumer Price Index measures changes in the price level of consumer goods and services.',
            'Fed Interest Rate Decision': 'The Federal Reserve sets the target range for the federal funds rate.',
            'Non-Farm Payrolls': 'Measures the number of jobs added or lost in the U.S. economy.',
            'ECB Press Conference': 'European Central Bank press conference following monetary policy decisions.'
        };
        
        return descriptions[eventName] || 'Important economic indicator that can impact financial markets.';
    }

    // Local Storage for cache persistence
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
}

// Create global instance
window.APIManager = new APIManager();
