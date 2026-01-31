import React, { useEffect, useRef } from 'react';
import LiveSessionTimeline from './LiveSessionTimeline';

const FinancialJuiceNewsWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingScript = document.getElementById('FJ-Widgets-News');
    if (existingScript) {
      existingScript.remove();
    }

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'FJ-Widgets-News';
    const r = Math.floor(Math.random() * 10000);
    script.src = `https://feed.financialjuice.com/widgets/widgets.js?r=${r}`;
    script.onload = () => {
      if (window.FJWidgets && containerRef.current) {
        const options = {
          container: 'financialjuice-news-widget-container',
          mode: 'Dark',
          width: '100%',
          height: '100%',
          backColor: '0b0d17',
          fontColor: 'e0e1dd',
          widgetType: 'NEWS',
        };
        new window.FJWidgets.createWidget(options);
      }
    };
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('FJ-Widgets-News');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <div className="cosmic-widget-card h-[600px]">
      <div className="cosmic-widget-header">
        <h3 className="cosmic-widget-title">Latest News</h3>
      </div>
      <div
        id="financialjuice-news-widget-container"
        ref={containerRef}
        className="cosmic-widget-body"
      />
    </div>
  );
};

const TradingViewTopStoriesWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/news/top-providers/tradingview/" rel="noopener nofollow" target="_blank"><span class="text-cosmic-accent">Top stories</span></a><span class="text-gray-500 text-xs"> by TradingView</span>';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: 'regular',
      feedMode: 'all_symbols',
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'en',
      width: '100%',
      height: '100%',
    });

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="cosmic-widget-card h-[600px]">
      <div className="cosmic-widget-header">
        <h3 className="cosmic-widget-title">Top Stories</h3>
      </div>
      <div ref={containerRef} className="cosmic-widget-body" />
    </div>
  );
};

const NewsTab = () => {
  return (
    <div>
      <LiveSessionTimeline />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialJuiceNewsWidget />
        <TradingViewTopStoriesWidget />
      </div>
    </div>
  );
};

export default NewsTab;
