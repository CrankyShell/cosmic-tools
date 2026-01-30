import React, { useState, useMemo } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { Search, Filter, Calendar, X, Trash, ArrowUp, ArrowDown, ZoomIn } from 'react-bootstrap-icons';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const ViewTrades = () => {
  const { activeAccount, deleteTrade } = useTradeContext();
  
  // --- STATE ---
  const [selectedTrade, setSelectedTrade] = useState(null); // For Side Panel
  const [fullImage, setFullImage] = useState(null); // For Image Modal
  
  // Filters State
  const [filters, setFilters] = useState({
    symbol: 'All',
    type: 'All',
    timeframe: 'All',
    dateSort: 'Newest', // Newest, Oldest
    profitSort: 'None', // None, High-Low, Low-High
    exitFilter: 'All'
  });

  // --- FILTERING LOGIC ---
  const filteredTrades = useMemo(() => {
    let result = [...activeAccount.trades];

    // 1. Symbol Filter
    if (filters.symbol !== 'All') {
        result = result.filter(t => t.pair === filters.symbol);
    }
    // 2. Type Filter (Long/Short)
    if (filters.type !== 'All') {
        result = result.filter(t => t.direction === filters.type); // Note: Our data uses 'direction'
    }
    // 3. Timeframe
    if (filters.timeframe !== 'All') {
        result = result.filter(t => t.timeframe === filters.timeframe);
    }
    // 4. Exit Strategy
    if (filters.exitFilter !== 'All') {
        result = result.filter(t => t.exit === filters.exitFilter);
    }

    // 5. Sorting
    // Date Sort
    result.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return filters.dateSort === 'Newest' ? dateB - dateA : dateA - dateB;
    });

    // Profit Sort (Overrides Date if selected)
    if (filters.profitSort === 'High-Low') {
        result.sort((a, b) => b.result - a.result);
    } else if (filters.profitSort === 'Low-High') {
        result.sort((a, b) => a.result - b.result);
    }

    return result;
  }, [activeAccount.trades, filters]);

  // --- STATISTICS CALCULATION ---
  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    if (totalTrades === 0) return { count: 0, pnl: 0, wr: 0, avg: 0 };

    const totalPnL = filteredTrades.reduce((acc, t) => acc + t.result, 0);
    const wins = filteredTrades.filter(t => t.result > 0).length;
    const wr = (wins / totalTrades) * 100;
    const avg = totalPnL / totalTrades;

    return { count: totalTrades, pnl: totalPnL, wr, avg };
  }, [filteredTrades]);

  // --- EQUITY CURVE GENERATOR (For Side Panel) ---
  // Generates equity curve up to the selected trade
  const getEquityCurve = (trade) => {
      // Get all trades up to this trade's date (or ID if same date)
      // We use the original unsorted list to calculate historical equity properly
      const allTrades = [...activeAccount.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
      const cutoffIndex = allTrades.findIndex(t => t.id === trade.id);
      
      const history = allTrades.slice(0, cutoffIndex + 1);
      
      let balance = activeAccount.size - activeAccount.trades.reduce((acc, t) => acc + t.result, 0); // Roughly estimate start balance
      // Better approach: Start from 0 PnL
      let runningPnL = 0;
      return history.map((t, i) => {
          runningPnL += t.result;
          return { i, pnl: runningPnL };
      });
  };

  return (
    <div className="flex gap-6 h-full relative items-start">
        
      {/* ---------------- LEFT COLUMN: List & Filters ---------------- */}
      <div className="flex-grow space-y-6 w-2/3">
          
          {/* 1. FILTER BAR */}
          <div className="bg-cosmic-card border border-white/10 p-4 rounded-xl flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-purple-400 font-bold mr-2">
                  <Filter /> Filters
              </div>
              
              {/* Symbol */}
              <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                value={filters.symbol} onChange={e => setFilters({...filters, symbol: e.target.value})}>
                  <option value="All">All Pairs</option>
                  {activeAccount.savedSymbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Timeframe */}
              <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                value={filters.timeframe} onChange={e => setFilters({...filters, timeframe: e.target.value})}>
                  <option value="All">All TFs</option>
                  {activeAccount.savedTimeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
              </select>

              {/* Type */}
              <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                 value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                  <option value="All">All Sides</option>
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
              </select>

              {/* Date Sort */}
              <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                 value={filters.dateSort} onChange={e => setFilters({...filters, dateSort: e.target.value})}>
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
              </select>
              
               {/* Profit Sort */}
               <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                 value={filters.profitSort} onChange={e => setFilters({...filters, profitSort: e.target.value})}>
                  <option value="None">Sort PnL...</option>
                  <option value="High-Low">High to Low</option>
                  <option value="Low-High">Low to High</option>
              </select>

               {/* Exit Filter */}
               <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none"
                 value={filters.exitFilter} onChange={e => setFilters({...filters, exitFilter: e.target.value})}>
                  <option value="All">All Exits</option>
                  {['TP', 'SL', 'BE', 'Decision'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>

              {/* Reset */}
              <button onClick={() => setFilters({symbol:'All', type:'All', timeframe:'All', dateSort:'Newest', profitSort:'None', exitFilter:'All'})} 
                className="text-xs text-red-400 hover:text-white ml-auto">
                  Reset
              </button>
          </div>

          {/* 2. STATS ROW */}
          <div className="grid grid-cols-4 gap-4">
              <StatBox label="Trades" value={stats.count} />
              <StatBox label="Total PnL" value={`$${stats.pnl.toFixed(2)}`} color={stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
              <StatBox label="Win Rate" value={`${stats.wr.toFixed(1)}%`} />
              <StatBox label="Avg PnL" value={`$${stats.avg.toFixed(2)}`} />
          </div>

          {/* 3. TRADE LIST */}
          <div className="space-y-3">
              {filteredTrades.map(trade => (
                  <motion.div 
                    layout
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className={`bg-cosmic-card border border-white/5 p-4 rounded-xl cursor-pointer hover:border-purple-500 transition grid grid-cols-12 items-center gap-4
                        ${selectedTrade?.id === trade.id ? 'border-purple-500 bg-purple-500/10' : ''}`}
                  >
                      {/* Image Thumbnail */}
                      <div className="col-span-2 h-16 bg-black/50 rounded overflow-hidden relative">
                          {trade.screenshot ? (
                              <img src={trade.screenshot} alt="Trade" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Img</div>
                          )}
                      </div>

                      {/* Info */}
                      <div className="col-span-2">
                          <div className="font-bold text-white">{trade.pair}</div>
                          <div className="text-xs text-gray-500">{trade.timeframe}</div>
                      </div>

                      <div className="col-span-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                              trade.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                              {trade.direction}
                          </span>
                      </div>

                      <div className="col-span-2 text-sm text-gray-400">{trade.date}</div>

                      <div className="col-span-2">
                          <span className={`text-xs border px-2 py-1 rounded ${
                              trade.exit === 'TP' ? 'border-green-500 text-green-400' : 
                              trade.exit === 'SL' ? 'border-red-500 text-red-400' : 'border-gray-500 text-gray-400'
                          }`}>{trade.exit}</span>
                      </div>

                      <div className={`col-span-2 text-right font-mono font-bold ${
                          trade.result >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                          {trade.result > 0 ? '+' : ''}{trade.result}
                      </div>

                  </motion.div>
              ))}
              {filteredTrades.length === 0 && (
                  <div className="text-center py-20 text-gray-500">No trades match your filters.</div>
              )}
          </div>
      </div>


      {/* ---------------- RIGHT COLUMN: Detailed View (Side Panel) ---------------- */}
      <AnimatePresence>
      {selectedTrade && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="w-1/3 bg-cosmic-card border border-white/10 rounded-xl p-6 sticky top-6 h-[85vh] overflow-y-auto flex flex-col"
          >
              <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-white">Trade Details</h2>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => {
                            if(confirm("Delete this trade?")) {
                                deleteTrade(selectedTrade.id);
                                setSelectedTrade(null);
                            }
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 transition"
                      >
                          <Trash />
                      </button>
                      <button onClick={() => setSelectedTrade(null)} className="p-2 text-gray-500 hover:text-white transition"><X size={24}/></button>
                  </div>
              </div>

              {/* 1. Large Image */}
              <div className="w-full h-48 bg-black/50 rounded-lg overflow-hidden mb-6 border border-white/10 group relative">
                  {selectedTrade.screenshot ? (
                      <>
                        <img src={selectedTrade.screenshot} className="w-full h-full object-cover" />
                        <div 
                            onClick={() => setFullImage(selectedTrade.screenshot)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition"
                        >
                            <ZoomIn className="text-white" size={30} />
                        </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-center h-full text-gray-600">No Screenshot</div>
                  )}
              </div>

              {/* 2. Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <DetailItem label="Pair" value={selectedTrade.pair} />
                  <DetailItem label="Setup" value={selectedTrade.setup} />
                  <DetailItem label="Entry" value={selectedTrade.direction} />
                  <DetailItem label="Exit" value={selectedTrade.exit} />
                  <DetailItem label="Date" value={selectedTrade.date} />
                  <DetailItem label="Result" value={selectedTrade.result} color={selectedTrade.result >= 0 ? 'text-green-400' : 'text-red-400'} />
              </div>

              {/* 3. Comment */}
              <div className="mb-6">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Comment</h4>
                  <div className="bg-black/40 p-3 rounded text-sm text-gray-300 italic min-h-[60px]">
                      "{selectedTrade.comment || 'No comments.'}"
                  </div>
              </div>

              {/* 4. Mini Equity Curve (Up to this point) */}
              <div className="flex-grow min-h-[150px]">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Performance Context</h4>
                  <div className="w-full h-full min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getEquityCurve(selectedTrade)}>
                            <defs>
                                <linearGradient id="gradCtx" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <RechartsTooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                            <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" fill="url(#gradCtx)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

          </motion.div>
      )}
      </AnimatePresence>

      {/* FULL IMAGE MODAL */}
      {fullImage && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-10" onClick={() => setFullImage(null)}>
              <img src={fullImage} className="max-w-full max-h-full rounded shadow-2xl border border-white/20" />
              <button className="absolute top-5 right-5 text-white"><X size={40}/></button>
          </div>
      )}

    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatBox = ({ label, value, color = "text-white" }) => (
    <div className="bg-cosmic-card border border-white/5 p-4 rounded-xl">
        <div className="text-xs text-gray-500 uppercase mb-1">{label}</div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
);

const DetailItem = ({ label, value, color="text-white" }) => (
    <div>
        <div className="text-[10px] text-gray-500 uppercase">{label}</div>
        <div className={`font-bold ${color}`}>{value}</div>
    </div>
);

export default ViewTrades;