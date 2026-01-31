import React, { useEffect, useRef, useState } from 'react';

// --- DATA CONSTANTS ---

const MARKET_CATEGORIES = {
  Forex: [
    { symbol: 'FX:EURUSD', display: 'EUR/USD', base: 'EUR', quote: 'USD' },
    { symbol: 'FX:GBPUSD', display: 'GBP/USD', base: 'GBP', quote: 'USD' },
    { symbol: 'FX:USDJPY', display: 'USD/JPY', base: 'USD', quote: 'JPY' },
    { symbol: 'FX:AUDUSD', display: 'AUD/USD', base: 'AUD', quote: 'USD' },
    { symbol: 'FX:USDCAD', display: 'USD/CAD', base: 'USD', quote: 'CAD' },
    { symbol: 'FX:USDCHF', display: 'USD/CHF', base: 'USD', quote: 'CHF' },
    { symbol: 'FX:NZDUSD', display: 'NZD/USD', base: 'NZD', quote: 'USD' },
    { symbol: 'FX:EURGBP', display: 'EUR/GBP', base: 'EUR', quote: 'GBP' },
    { symbol: 'FX:EURJPY', display: 'EUR/JPY', base: 'EUR', quote: 'JPY' },
    { symbol: 'FX:GBPJPY', display: 'GBP/JPY', base: 'GBP', quote: 'JPY' },
    { symbol: 'FX:CADJPY', display: 'CAD/JPY', base: 'CAD', quote: 'JPY' },
  ],
  Metals: [
    { symbol: 'OANDA:XAUUSD', display: 'Gold (XAU/USD)', base: 'XAU', quote: 'USD', country: 'us' },
    { symbol: 'OANDA:XAGUSD', display: 'Silver (XAG/USD)', base: 'XAG', quote: 'USD', country: 'us' },
    { symbol: 'TVC:PLATINUM', display: 'Platinum', base: 'XPT', quote: 'USD', country: 'us' },
    { symbol: 'TVC:PALLADIUM', display: 'Palladium', base: 'XPD', quote: 'USD', country: 'us' },
    { symbol: 'COMEX:HG1!', display: 'Copper Futures', base: 'USD', country: 'us' },
  ],
  Indices: [
    { symbol: 'FOREXCOM:SPXUSD', display: 'S&P 500', base: 'USD', country: 'us' },
    { symbol: 'FOREXCOM:NSXUSD', display: 'Nasdaq 100', base: 'USD', country: 'us' },
    { symbol: 'FOREXCOM:DJI', display: 'Dow Jones 30', base: 'USD', country: 'us' },
    { symbol: 'INDEX:DEU40', display: 'DAX 40 (Germany)', base: 'EUR', country: 'eu' },
    { symbol: 'INDEX:UK100', display: 'FTSE 100 (UK)', base: 'GBP', country: 'gb' },
    { symbol: 'INDEX:JPN225', display: 'Nikkei 225 (Japan)', base: 'JPY', country: 'jp' },
  ],
  Crypto: [
    { symbol: 'BINANCE:BTCUSDT', display: 'Bitcoin (BTC/USDT)', base: 'BTC', quote: 'USD' },
    { symbol: 'BINANCE:ETHUSDT', display: 'Ethereum (ETH/USDT)', base: 'ETH', quote: 'USD' },
    { symbol: 'BINANCE:SOLUSDT', display: 'Solana (SOL/USDT)', base: 'SOL', quote: 'USD' },
    { symbol: 'BINANCE:XRPUSDT', display: 'Ripple (XRP/USDT)', base: 'XRP', quote: 'USD' },
    { symbol: 'BINANCE:BNBUSDT', display: 'BNB (BNB/USDT)', base: 'BNB', quote: 'USD' },
  ],
  Stocks: [
    { symbol: 'NASDAQ:AAPL', display: 'Apple Inc.', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:MSFT', display: 'Microsoft Corp.', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:NVDA', display: 'NVIDIA Corp.', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:TSLA', display: 'Tesla Inc.', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:AMZN', display: 'Amazon.com', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:GOOGL', display: 'Alphabet (Google)', base: 'USD', country: 'us' },
    { symbol: 'NASDAQ:META', display: 'Meta Platforms', base: 'USD', country: 'us' },
  ],
};

const CURRENCY_COUNTRY_MAP = {
  USD: 'us', EUR: 'eu', GBP: 'gb', JPY: 'jp',
  AUD: 'au', CAD: 'ca', CHF: 'ch', NZD: 'nz', XAU: 'us', XAG: 'us',
};

// --- WIDGET COMPONENTS ---

const MiniChartWidget = ({ symbol }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "12M",
      colorTheme: "dark",
      isTransparent: false,
      autosize: true,
      largeChartUrl: "",
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="bg-[#131722] backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-lg h-[350px] flex flex-col">
      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
         <span className="w-1 h-4 bg-cosmic-accent rounded-full shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.6)]"></span>
         <h3 className="font-bold text-gray-200">Mini Chart</h3>
      </div>
      <div className="flex-1 w-full overflow-hidden rounded-lg">
        <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
          <div className="tradingview-widget-container__widget h-full w-full"></div>
        </div>
      </div>
    </div>
  );
};

const AdvancedChartWidget = ({ symbol }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      interval: 'D',
      locale: 'en',
      save_image: true,
      style: '1',
      symbol: symbol,
      theme: 'dark',
      timezone: 'Etc/UTC',
      backgroundColor: "rgba(17, 19, 31, 1)", 
      gridColor: "rgba(255, 255, 255, 0.05)",
      autosize: true,
      support_host: "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="bg-[#11131f] backdrop-blur-md border border-white/5 rounded-xl p-1 shadow-xl h-[600px] flex flex-col">
      <div className="tradingview-widget-container h-full w-full rounded-lg overflow-hidden" ref={containerRef}>
        <div className="tradingview-widget-container__widget h-full w-full"></div>
      </div>
    </div>
  );
};

const EconomicCalendarWidget = ({ countries }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'en',
      countryFilter: countries.join(','),
      importanceFilter: '-1,0,1',
      width: '100%',
      height: '100%',
    });

    containerRef.current.appendChild(script);
  }, [countries.join(',')]);

  return (
    <div className="bg-[#131722] backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-lg h-[500px] flex flex-col">
       <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
         <span className="w-1 h-4 bg-cosmic-accent rounded-full shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.6)]"></span>
         <h3 className="font-bold text-gray-200">Related Events</h3>
      </div>
      <div className="flex-1 w-full overflow-hidden rounded-lg">
         <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
           <div className="tradingview-widget-container__widget h-full w-full"></div>
         </div>
      </div>
    </div>
  );
};

const FinancialJuiceNewsWidget = ({ currencies }) => {
  const containerRef = useRef(null);
  const containerId = `fj-news-market-${currencies.join('-')}`;

  useEffect(() => {
    if (!containerRef.current) return;

    const existingScript = document.getElementById('FJ-Widgets-Market-News');
    if (existingScript) existingScript.remove();

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'FJ-Widgets-Market-News';
    const r = Math.floor(Math.random() * 10000);
    script.src = `https://feed.financialjuice.com/widgets/widgets.js?r=${r}`;
    
    script.onload = () => {
      if (window.FJWidgets && containerRef.current) {
        new window.FJWidgets.createWidget({
          container: containerId,
          mode: 'Dark',
          width: '100%',
          height: '100%',
          backColor: '11131f', 
          fontColor: 'e0e1dd',
          borderColor: '2d3748',
          widgetType: 'NEWS',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('FJ-Widgets-Market-News');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [currencies.join(','), containerId]);

  return (
    <div className="bg-[#11131f] border border-white/5 rounded-xl p-4 shadow-lg h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
         <span className="w-1 h-4 bg-cosmic-accent rounded-full shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.6)]"></span>
         <h3 className="font-bold text-gray-200">Related News</h3>
      </div>
      <div className="flex-1 w-full relative">
         <div id={containerId} ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden" />
      </div>
    </div>
  );
};

const MarketDataWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '100%',
      locale: 'en',
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: false,
      symbolsGroups: [
        {
          name: 'Major',
          symbols: [
            { name: 'FX_IDC:EURUSD', displayName: 'EUR to USD' },
            { name: 'FX_IDC:USDJPY', displayName: 'USD to JPY' },
            { name: 'FX_IDC:GBPUSD', displayName: 'GBP to USD' },
          ],
        },
        {
          name: 'Indices',
          symbols: [
            { name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500' },
            { name: 'FOREXCOM:NSXUSD', displayName: 'Nasdaq 100' },
          ],
        },
        {
          name: 'Metals',
          symbols: [
             { name: 'COMEX:GC1!', displayName: 'Gold' },
             { name: 'COMEX:SI1!', displayName: 'Silver' },
          ]
        }
      ],
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bg-[#131722] backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-lg h-[600px] flex flex-col">
       <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
         <span className="w-1 h-4 bg-cosmic-accent rounded-full shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.6)]"></span>
         <h3 className="font-bold text-gray-200">Global Markets</h3>
      </div>
      <div className="flex-1 w-full overflow-hidden rounded-lg">
         <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
            <div className="tradingview-widget-container__widget h-full w-full"></div>
         </div>
      </div>
    </div>
  );
};

const MarketTab = () => {
  // Favorites State (Persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('market_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState('Forex');
  const [selectedPair, setSelectedPair] = useState(MARKET_CATEGORIES['Forex'][0]);
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  // Save favorites when changed
  useEffect(() => {
    localStorage.setItem('market_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (pair) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.symbol === pair.symbol);
      if (exists) {
        return prev.filter(p => p.symbol !== pair.symbol);
      }
      return [...prev, pair];
    });
  };

  const isFavorite = (symbol) => favorites.some(f => f.symbol === symbol);

  // Determine which pairs to show in the dropdown
  const getAvailablePairs = () => {
    if (selectedCategory === 'Favorites') {
      return favorites;
    }
    return MARKET_CATEGORIES[selectedCategory] || [];
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    
    // Automatically select first item if switching categories
    if (category === 'Favorites') {
      if (favorites.length > 0) setSelectedPair(favorites[0]);
    } else {
      setSelectedPair(MARKET_CATEGORIES[category][0]);
    }
  };

  const getCountriesForPair = (pair) => {
    if (!pair) return ['us'];
    if (pair.country) return [pair.country];
    const countries = [];
    if (pair.base && CURRENCY_COUNTRY_MAP[pair.base]) countries.push(CURRENCY_COUNTRY_MAP[pair.base]);
    if (pair.quote && CURRENCY_COUNTRY_MAP[pair.quote]) {
      const quoteCountry = CURRENCY_COUNTRY_MAP[pair.quote];
      if (!countries.includes(quoteCountry)) countries.push(quoteCountry);
    }
    return countries.length > 0 ? countries : ['us'];
  };

  const getCurrenciesForPair = (pair) => {
    if (!pair) return ['USD'];
    const currencies = [];
    if (pair.base) currencies.push(pair.base);
    if (pair.quote) currencies.push(pair.quote);
    return currencies.length > 0 ? currencies : ['USD'];
  };

  const countries = getCountriesForPair(selectedPair);
  const currencies = getCurrenciesForPair(selectedPair);
  const availablePairs = getAvailablePairs();

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Selection Header */}
      <div className="bg-[#11131f] backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Title Area */}
          <div className="flex items-start gap-4">
             {/* Big Favorite Toggle Button (Header) */}
             <button 
               onClick={() => selectedPair && toggleFavorite(selectedPair)}
               className="mt-1 p-2 rounded-lg hover:bg-white/5 transition-colors group"
               title={isFavorite(selectedPair?.symbol) ? "Remove from Favorites" : "Add to Favorites"}
             >
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 fill={selectedPair && isFavorite(selectedPair.symbol) ? "#FFD700" : "none"} 
                 stroke={selectedPair && isFavorite(selectedPair.symbol) ? "#FFD700" : "currentColor"}
                 className="w-8 h-8 transition-all group-hover:scale-110"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.045.796.756.368 1.115l-4.183 3.513a.563.563 0 00-.175.541l1.242 5.37c.14.606-.525 1.055-1.041.74l-4.735-2.825a.562.562 0 00-.57 0l-4.735 2.825c-.516.315-1.18-.134-1.041-.74l1.242-5.37c.045-.195-.015-.402-.175-.541L2.94 9.397c-.428-.359-.195-1.07.368-1.115l5.518-.442c.193-.016.367-.145.475-.345L11.48 3.5z" />
               </svg>
             </button>

             <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-cosmic-accent to-purple-600 rounded-full shadow-[0_0_15px_rgba(var(--cosmic-accent-rgb),0.6)]"></span>
                  {selectedPair ? selectedPair.display : 'Select Asset'}
                </h2>
                <p className="text-gray-400 text-sm mt-1 pl-4">
                  Detailed market analysis for <span className="text-cosmic-accent">{selectedPair ? selectedPair.display : ''}</span>
                </p>
             </div>
          </div>

          {/* Selectors Area */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            
            {/* 1. Category Dropdown */}
            <div className="relative min-w-[160px]">
              <label className="block text-xs text-gray-500 mb-1 ml-1">Market Type</label>
              <button
                onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowAssetDropdown(false); }}
                className="w-full flex items-center justify-between bg-black/40 hover:bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 transition-all"
              >
                <span className={`font-medium ${selectedCategory === 'Favorites' ? 'text-yellow-400' : 'text-white'}`}>
                  {selectedCategory}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-2 w-full bg-[#0B0D17] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                  {/* Favorites Option */}
                  <button
                    onClick={() => handleCategoryChange('Favorites')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${
                      selectedCategory === 'Favorites' ? 'text-yellow-400 bg-white/5' : 'text-yellow-500/80'
                    }`}
                  >
                    <span>★ Favorites</span>
                  </button>
                  <div className="h-px bg-white/10 my-1"></div>
                  
                  {/* Regular Categories */}
                  {Object.keys(MARKET_CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                        selectedCategory === cat ? 'text-cosmic-accent bg-white/5' : 'text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Asset Dropdown */}
            <div className="relative min-w-[240px]">
              <label className="block text-xs text-gray-500 mb-1 ml-1">Asset</label>
              <button
                onClick={() => { setShowAssetDropdown(!showAssetDropdown); setShowCategoryDropdown(false); }}
                className="w-full flex items-center justify-between bg-black/40 hover:bg-white/5 border border-white/10 hover:border-cosmic-accent/50 rounded-xl px-4 py-2.5 transition-all group"
              >
                <span className="font-bold text-white truncate mr-2">
                  {selectedPair ? selectedPair.display : 'Select Pair...'}
                </span>
                <svg className={`w-4 h-4 text-gray-500 group-hover:text-cosmic-accent transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAssetDropdown && (
                <div className="absolute right-0 top-full mt-2 w-full max-h-[400px] overflow-y-auto bg-[#0B0D17] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-xl custom-scrollbar">
                  {availablePairs.length > 0 ? (
                    availablePairs.map((pair) => (
                      <div
                        key={pair.symbol}
                        className={`w-full px-4 py-3 text-sm flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${
                          selectedPair?.symbol === pair.symbol ? 'bg-white/5' : ''
                        }`}
                        onClick={() => {
                          setSelectedPair(pair);
                          setShowAssetDropdown(false);
                        }}
                      >
                        <span className={`font-medium truncate ${selectedPair?.symbol === pair.symbol ? 'text-cosmic-accent' : 'text-gray-300'}`}>
                          {pair.display}
                        </span>
                        
                        <div className="flex items-center gap-3">
                           {/* Active Indicator (Blue Dot) */}
                           {selectedPair?.symbol === pair.symbol && (
                             <span className="w-1.5 h-1.5 bg-cosmic-accent rounded-full shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.8)]"></span>
                           )}

                           {/* Star Button (Clickable inside dropdown) */}
                           <button 
                             onClick={(e) => {
                               e.stopPropagation(); // Prevent closing dropdown
                               toggleFavorite(pair);
                             }}
                             className="p-1 rounded-md hover:bg-white/10 transition-colors"
                           >
                             <svg 
                               xmlns="http://www.w3.org/2000/svg" 
                               viewBox="0 0 24 24" 
                               fill={isFavorite(pair.symbol) ? "#FFD700" : "none"} 
                               stroke={isFavorite(pair.symbol) ? "#FFD700" : "#6b7280"}
                               className="w-5 h-5"
                             >
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.045.796.756.368 1.115l-4.183 3.513a.563.563 0 00-.175.541l1.242 5.37c.14.606-.525 1.055-1.041.74l-4.735-2.825a.562.562 0 00-.57 0l-4.735 2.825c-.516.315-1.18-.134-1.041-.74l1.242-5.37c.045-.195-.015-.402-.175-.541L2.94 9.397c-.428-.359-.195-1.07.368-1.115l5.518-.442c.193-.016.367-.145.475-.345L11.48 3.5z" />
                             </svg>
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">
                       {selectedCategory === 'Favorites' ? 'No favorites added yet.' : 'No assets found.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Column (2/3 width on large screens) */}
         <div className="lg:col-span-2 space-y-6">
            {selectedPair && <AdvancedChartWidget symbol={selectedPair.symbol} />}
            
            {/* Split Calendar/News below chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EconomicCalendarWidget countries={countries} />
              <FinancialJuiceNewsWidget currencies={currencies} />
            </div>
         </div>

         {/* Sidebar Column (1/3 width) */}
         <div className="space-y-6">
            {selectedPair && <MiniChartWidget symbol={selectedPair.symbol} />}
            <MarketDataWidget />
         </div>
      </div>
    </div>
  );
};

export default MarketTab;