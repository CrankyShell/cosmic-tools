import React, { useEffect, useRef, useState } from 'react';
import LiveSessionTimeline from './LiveSessionTimeline';

const FinancialJuiceCalendarWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const existingScript = document.getElementById('FJ-Widgets-EcoCal');
    if (existingScript) existingScript.remove();

    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'FJ-Widgets-EcoCal';
    const r = Math.floor(Math.random() * 10000);
    script.src = `https://feed.financialjuice.com/widgets/widgets.js?r=${r}`;
    
    script.onload = () => {
      if (window.FJWidgets && containerRef.current) {
        new window.FJWidgets.createWidget({
          container: 'financialjuice-eco-widget-container',
          mode: 'standard',
          width: '100%',
          height: '100%',
          backColor: '11131f',
          fontColor: 'e0e1dd',
          borderColor: '2d3748',
          widgetType: 'ECOCAL',
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      const scriptToRemove = document.getElementById('FJ-Widgets-EcoCal');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#11131f]">
      <div id="financialjuice-eco-widget-container" className="w-full h-full" ref={containerRef} />
    </div>
  );
};

const TradingViewCalendarWidget = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: false,
      width: '100%',
      height: '100%',
      locale: 'en',
      importanceFilter: '-1,0,1',
      currencyFilter: 'USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD',
    });
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/20 backdrop-blur-sm">
      <div className="tradingview-widget-container w-full h-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget w-full h-full"></div>
      </div>
    </div>
  );
};

const CalendarTab = () => {
  // Changed default from 'financialjuice' to 'tradingview'
  const [activeWidget, setActiveWidget] = useState('tradingview');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <LiveSessionTimeline />
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-cosmic-accent rounded-full shadow-[0_0_10px_rgba(var(--cosmic-accent-rgb),0.5)]"></span>
            Economic Calendar
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium text-gray-300 hover:text-white"
            >
              <span>{activeWidget === 'financialjuice' ? 'FinancialJuice' : 'TradingView'}</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0B0D17] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                <button onClick={() => { setActiveWidget('financialjuice'); setShowDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${activeWidget === 'financialjuice' ? 'text-cosmic-accent bg-white/5' : 'text-gray-400'}`}>FinancialJuice</button>
                <button onClick={() => { setActiveWidget('tradingview'); setShowDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${activeWidget === 'tradingview' ? 'text-cosmic-accent bg-white/5' : 'text-gray-400'}`}>TradingView</button>
              </div>
            )}
          </div>
        </div>
        <div className="h-[800px]">
          {activeWidget === 'financialjuice' ? <FinancialJuiceCalendarWidget /> : <TradingViewCalendarWidget />}
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;