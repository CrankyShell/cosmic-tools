// API Configuration - Replace with your actual keys
window.CosmicConfig = {
    apiKeys: {
        alphaVantage: localStorage.getItem('alphaVantageKey') || '13JM0Y1Y9HF75Z5M',
        newsAPI: localStorage.getItem('newsAPIKey') || '6e99f26281434af4a8141a41518ee0d3',
        fred: localStorage.getItem('fredKey') || '27e50a8b813c19f511d7e926d9113ce8'
    },
    
    // Feature flags
    features: {
        realTimeNews: true,
        realTimeEvents: true,
        cacheEnabled: true
    }
};
