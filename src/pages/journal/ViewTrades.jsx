import React, { useState, useMemo } from 'react';
import { useTradeContext } from '../../components/context/TradeContext';
import { Filter, X, Trash, ZoomIn, PencilSquare } from 'react-bootstrap-icons';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import EditTradeModal from '../../components/EditTradeModal';

const ViewTrades = () => {
  const { activeAccount, deleteTrade } = useTradeContext();
  
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  
  const [filters, setFilters] = useState({
    symbol: 'All', type: 'All', timeframe: 'All', dateSort: 'Newest', profitSort: 'None', exitFilter: 'All'
  });

  const filteredTrades = useMemo(() => {
    let result = [...activeAccount.trades];
    if (filters.symbol !== 'All') result = result.filter(t => t.pair === filters.symbol);
    if (filters.type !== 'All') result = result.filter(t => t.direction === filters.type);
    if (filters.timeframe !== 'All') result = result.filter(t => t.timeframe === filters.timeframe);
    if (filters.exitFilter !== 'All') result = result.filter(t => t.exit === filters.exitFilter);
    result.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return filters.dateSort === 'Newest' ? dateB - dateA : dateA - dateB;
    });
    if (filters.profitSort === 'High-Low') result.sort((a, b) => b.result - a.result);
    else if (filters.profitSort === 'Low-High') result.sort((a, b) => a.result - b.result);
    return result;
  }, [activeAccount.trades, filters]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    if (totalTrades === 0) return { count: 0, pnl: 0, wr: 0, avg: 0 };
    const totalPnL = filteredTrades.reduce((acc, t) => acc + t.result, 0);
    const wins = filteredTrades.filter(t => t.result > 0).length;
    return { count: totalTrades, pnl: totalPnL, wr: (wins / totalTrades) * 100, avg: totalPnL / totalTrades };
  }, [filteredTrades]);

  const getEquityCurve = (trade) => {
      const allTrades = [...activeAccount.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
      const cutoffIndex = allTrades.findIndex(t => t.id === trade.id);
      let runningPnL = 0;
      return allTrades.slice(0, cutoffIndex + 1).map((t, i) => {
          runningPnL += t.result;
          return { i, pnl: runningPnL };
      });
  };

  return (
    <div className="flex gap-6 h-full relative items-start overflow-hidden pb-4">
        
      {/* LEFT COLUMN: List */}
      <div className={`flex-grow space-y-6 h-full flex flex-col ${selectedTrade ? 'w-2/3' : 'w-full'}`}>
          <div className="bg-cosmic-card border border-white/10 p-4 rounded-xl flex flex-wrap gap-4 items-center shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mr-2"><Filter /> Filters</div>
              <FilterSelect value={filters.symbol} onChange={e => setFilters({...filters, symbol: e.target.value})} options={['All', ...activeAccount.savedSymbols]} />
              <FilterSelect value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} options={['All', 'Long', 'Short']} labels={['All Sides', 'Long', 'Short']} />
              <button onClick={() => setFilters({symbol:'All', type:'All', timeframe:'All', dateSort:'Newest', profitSort:'None', exitFilter:'All'})} className="text-xs text-red-400 hover:text-white ml-auto">Reset</button>
          </div>

          <div className="grid grid-cols-4 gap-4 shrink-0">
              <StatBox label="Trades" value={stats.count} />
              <StatBox label="Total PnL" value={`$${stats.pnl.toFixed(2)}`} color={stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
              <StatBox label="Win Rate" value={`${stats.wr.toFixed(1)}%`} />
              <StatBox label="Avg PnL" value={`$${stats.avg.toFixed(2)}`} />
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
            <AnimatePresence mode='popLayout'>
              {filteredTrades.map(trade => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className={`bg-cosmic-card border border-white/5 p-4 rounded-xl cursor-pointer hover:border-blue-500 transition grid grid-cols-12 items-center gap-4
                        ${selectedTrade?.id === trade.id ? 'border-blue-500 bg-blue-500/10' : ''}`}
                  >
                      <div className="col-span-2 h-12 bg-black/50 rounded overflow-hidden relative">
                          {trade.screenshot ? <img src={trade.screenshot} alt="Trade" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700 text-[10px]">No Img</div>}
                      </div>
                      <div className="col-span-3">
                          <div className="font-bold text-white text-sm">{trade.pair}</div>
                          <div className="text-xs text-gray-500">{trade.timeframe} • {trade.setup}</div>
                      </div>
                      <div className="col-span-2">
                          <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${trade.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{trade.direction}</span>
                      </div>
                      <div className="col-span-2 text-xs text-gray-400">{trade.date}</div>
                      <div className={`col-span-3 text-right font-mono font-bold text-sm ${trade.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.result > 0 ? '+' : ''}{trade.result}
                      </div>
                  </motion.div>
              ))}
            </AnimatePresence>
            {filteredTrades.length === 0 && <div className="text-center py-20 text-gray-500">No trades match your filters.</div>}
          </div>
      </div>

      {/* RIGHT COLUMN: Details */}
      <AnimatePresence mode="wait">
      {selectedTrade && (
          <motion.div 
            initial={{ opacity: 0, x: 100, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "33.333333%" }} 
            exit={{ opacity: 0, x: 100, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-cosmic-card border border-white/10 rounded-xl p-6 h-full overflow-y-auto flex flex-col shrink-0"
          >
              <div className="flex justify-between items-start mb-6 shrink-0">
                  <h2 className="text-xl font-bold text-white">Details</h2>
                  <div className="flex gap-2">
                      <button onClick={() => setEditingTrade(selectedTrade)} className="p-2 text-gray-500 hover:text-blue-400 transition"><PencilSquare size={16} /></button>
                      <button onClick={() => { if(confirm("Delete?")) { deleteTrade(selectedTrade.id); setSelectedTrade(null); }}} className="p-2 text-gray-500 hover:text-red-500 transition"><Trash size={16} /></button>
                      <button onClick={() => setSelectedTrade(null)} className="p-2 text-gray-500 hover:text-white transition"><X size={24}/></button>
                  </div>
              </div>

              {/* Large Image */}
              <div className="w-full h-48 bg-black/50 rounded-lg overflow-hidden mb-6 border border-white/10 group relative shrink-0">
                  {selectedTrade.screenshot ? (
                      <>
                        <img src={selectedTrade.screenshot} className="w-full h-full object-cover" />
                        <div onClick={() => setFullImage(selectedTrade.screenshot)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition"><ZoomIn className="text-white" size={30} /></div>
                      </>
                  ) : <div className="flex items-center justify-center h-full text-gray-600">No Screenshot</div>}
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                  <DetailItem label="Pair" value={selectedTrade.pair} />
                  <DetailItem label="Setup" value={selectedTrade.setup} />
                  <DetailItem label="Entry" value={selectedTrade.direction} />
                  <DetailItem label="Exit" value={selectedTrade.exit} />
                  <DetailItem label="Date" value={selectedTrade.date} />
                  <DetailItem label="Result" value={selectedTrade.result} color={selectedTrade.result >= 0 ? 'text-green-400' : 'text-red-400'} />
              </div>

              {/* Comment */}
              <div className="mb-6 shrink-0">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Comment</h4>
                  <div className="bg-black/40 p-3 rounded text-sm text-gray-300 italic min-h-[60px]">"{selectedTrade.comment || 'No comments.'}"</div>
              </div>

              {/* Mini Equity Curve */}
              <div className="flex-grow min-h-[150px] flex flex-col">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">History Context</h4>
                  <div className="flex-grow w-full bg-black/20 rounded-lg p-2 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getEquityCurve(selectedTrade)}>
                            <defs><linearGradient id="gradCtx" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <RechartsTooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                            <Area type="monotone" dataKey="pnl" stroke="#3b82f6" fill="url(#gradCtx)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* FULL IMAGE MODAL */}
      <AnimatePresence>
        {fullImage && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-10" onClick={() => setFullImage(null)}>
                <motion.img initial={{scale:0.8}} animate={{scale:1}} src={fullImage} className="max-w-full max-h-full rounded shadow-2xl border border-white/20" />
                <button className="absolute top-5 right-5 text-white"><X size={40}/></button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      {editingTrade && <EditTradeModal trade={editingTrade} onClose={() => setEditingTrade(null)} />}
    </div>
  );
};

const FilterSelect = ({value, onChange, options, labels}) => (
    <select className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none cursor-pointer hover:border-blue-500/50 transition" value={value} onChange={onChange}>
        {options.map((opt, i) => <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>)}
    </select>
);
const StatBox = ({ label, value, color = "text-white" }) => (
    <div className="bg-cosmic-card border border-white/5 p-3 rounded-xl">
        <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
);
const DetailItem = ({ label, value, color="text-white" }) => (
    <div><div className="text-[10px] text-gray-500 uppercase">{label}</div><div className={`font-bold ${color}`}>{value}</div></div>
);

export default ViewTrades;