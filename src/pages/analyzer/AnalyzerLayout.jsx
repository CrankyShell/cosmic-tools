import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Newspaper, CalendarEvent, GraphUp } from 'react-bootstrap-icons';

const AnalyzerLayout = () => {
  const tabStyle = ({ isActive }) => `
    flex items-center gap-2 px-6 py-3 border-b-2 transition-colors duration-300 font-medium
    ${isActive
      ? 'border-cosmic-accent text-cosmic-accent bg-white/5'
      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}
  `;

  return (
    <div className="max-w-[1400px] mx-auto min-h-[90vh] p-4">

      {/* Header */}
      <header className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Analyzer</h1>
          <p className="text-gray-500 text-sm">Real-time market data, news, and economic events</p>
        </div>
      </header>

      {/* 3 TABS NAVIGATION */}
      <nav className="flex mb-6 overflow-x-auto">
        <NavLink to="/analyzer/news" className={tabStyle}>
          <Newspaper /> News
        </NavLink>
        <NavLink to="/analyzer/calendar" className={tabStyle}>
          <CalendarEvent /> Calendar
        </NavLink>
        <NavLink to="/analyzer/market" className={tabStyle}>
          <GraphUp /> Market
        </NavLink>
      </nav>

      {/* The Sub-Pages render here */}
      <Outlet />
    </div>
  );
};

export default AnalyzerLayout;
