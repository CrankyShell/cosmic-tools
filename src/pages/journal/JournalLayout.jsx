import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PlusSquare, ListUl, BarChartLine, Wallet } from 'react-bootstrap-icons'; // New Icons
import { useTradeContext } from '../../components/context/TradeContext';

const JournalLayout = () => {
  const { activeAccount } = useTradeContext();

  const tabStyle = ({ isActive }) => `
    flex items-center gap-2 px-6 py-3 border-b-2 transition-colors duration-300 font-medium
    ${isActive 
      ? 'border-cyan-400 text-cyan-400 bg-white/5' 
      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}
  `;

  return (
    <div className="max-w-[1400px] mx-auto min-h-[90vh] p-4"> {/* Wider container */}
      
      {/* Header */}
      <header className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Journal</h1>
          <p className="text-gray-500 text-sm">Portfolio: <span className="text-cyan-400 font-bold">{activeAccount.name}</span></p>
        </div>
        <div className="text-right">
             <div className="text-xs text-gray-400 uppercase">Balance</div>
             <div className="text-2xl font-mono text-green-400 font-bold">${activeAccount.size.toFixed(2)}</div>
        </div>
      </header>

      {/* 4 TABS NAVIGATION */}
      <nav className="flex mb-6 overflow-x-auto">
        <NavLink to="/journal/add" className={tabStyle}>
          <PlusSquare /> Add Trade
        </NavLink>
        <NavLink to="/journal/view" className={tabStyle}>
          <ListUl /> View Trades
        </NavLink>
        <NavLink to="/journal/analytics" className={tabStyle}>
          <BarChartLine /> Analytics
        </NavLink>
        <NavLink to="/journal/accounts" className={tabStyle}>
          <Wallet /> Accounts
        </NavLink>
      </nav>

      {/* The Sub-Pages render here */}
      <Outlet />
    </div>
  );
};

export default JournalLayout;