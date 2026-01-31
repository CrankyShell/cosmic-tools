import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTradeContext } from '../../components/context/TradeContext';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus, Wallet, Camera, Trash, Trophy, GraphUp, Lightning, PieChart } from 'react-bootstrap-icons';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

const AddTradeTab = () => {
  const { activeAccount, addTrade, addWithdrawal } = useTradeContext();

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    type: 'Buy',
    pair: '',
    timeframe: '',
    entryStrategy: 'Candle Close',
    customEntry: '',
    exitStrategy: 'TP',
    result: '',
    comment: '',
    image: null
  });

  // --- UI STATE ---
  // 1. PERSISTENCE: Initialize from localStorage
  const [activeStats, setActiveStats] = useState(() => {
    try {
        const saved = localStorage.getItem('addTrade_widgets');
        // Default to Equity and Recent if nothing saved
        return saved ? JSON.parse(saved) : ['equity', 'recent'];
    } catch { return ['equity', 'recent']; }
  });

  const [showStatMenu, setShowStatMenu] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      comment: '' 
  });

  // 2. PERSISTENCE: Save on change
  useEffect(() => {
      localStorage.setItem('addTrade_widgets', JSON.stringify(activeStats));
  }, [activeStats]);

  // --- HANDLERS ---
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []}, maxFiles: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.pair && !formData.pair.includes('/')) return alert('Symbol must contain "/"');

    const tradePayload = {
        id: Date.now(),
        date: `${formData.date}T${formData.time}`,
        direction: formData.type === 'Buy' ? 'Long' : 'Short',
        pair: formData.pair.toUpperCase(),
        timeframe: formData.timeframe,
        setup: formData.entryStrategy === 'Custom' ? formData.customEntry : formData.entryStrategy,
        exit: formData.exitStrategy,
        result: parseFloat(formData.result),
        comment: formData.comment,
        screenshot: formData.image
    };

    addTrade(tradePayload);
    handleClear();
  };

  const handleClear = () => {
    setFormData({
        ...formData,
        pair: '', timeframe: '', result: '', comment: '', image: null,
        entryStrategy: 'Candle Close', customEntry: ''
    });
  };

  const handleWithdraw = (e) => {
      e.preventDefault();
      if (!withdrawData.amount) return;
      addWithdrawal(parseFloat(withdrawData.amount), withdrawData.date);
      setWithdrawData({ amount: '', date: new Date().toISOString().split('T')[0], comment: '' });
      setShowWithdraw(false);
      alert('Withdrawal Processed');
  };

  const handleAddStat = (statId) => {
      if (activeStats.length < 4 && !activeStats.includes(statId)) {
          setActiveStats([...activeStats, statId]);
          setShowStatMenu(false);
      }
  };

  const handleRemoveStat = (statId) => {
      setActiveStats(activeStats.filter(id => id !== statId));
  };

  // --- 3. ANALYTICS CALCULATIONS ---
  const analytics = useMemo(() => {
      const trades = activeAccount.trades || [];
      const wins = trades.filter(t => t.result > 0);
      const losses = trades.filter(t => t.result < 0);
      
      // Basic
      const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
      const expectancy = trades.length ? (trades.reduce((a,b) => a + b.result, 0) / trades.length).toFixed(2) : 0;

      // Profit Factor
      const grossWin = wins.reduce((a,b) => a + b.result, 0);
      const grossLoss = Math.abs(losses.reduce((a,b) => a + b.result, 0));
      const profitFactor = grossLoss === 0 ? (grossWin > 0 ? '∞' : '0.00') : (grossWin / grossLoss).toFixed(2);

      // Best Pair
      const pairPerf = {};
      trades.forEach(t => pairPerf[t.pair] = (pairPerf[t.pair] || 0) + t.result);
      const bestPair = Object.keys(pairPerf).reduce((a, b) => pairPerf[a] > pairPerf[b] ? a : b, 'N/A');
      const bestPairPnL = pairPerf[bestPair] || 0;

      // Avg Win vs Avg Loss
      const avgWin = wins.length ? (grossWin / wins.length) : 0;
      const avgLoss = losses.length ? (grossLoss / losses.length) : 0;

      // Charts
      const recentData = [...trades].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((t, i) => ({ 
        val: t.result, color: t.result >= 0 ? '#4ade80' : '#ef4444' 
      })).reverse();

      const tradesChrono = [...trades].sort((a,b) => new Date(a.date) - new Date(b.date));
      let runningPnL = 0;
      const equityData = tradesChrono.map((t, i) => { runningPnL += t.result; return { idx: i, pnl: runningPnL }; });

      return { winRate, expectancy, profitFactor, bestPair, bestPairPnL, avgWin, avgLoss, recentData, equityData };
  }, [activeAccount.trades]);


  // --- WIDGET COMPONENT ---
  const Widget = ({ type }) => {
      return (
        <div className="bg-cosmic-card border border-white/10 rounded-xl p-4 h-48 relative group animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    {type === 'equity' && <><GraphUp/> Equity Curve</>}
                    {type === 'recent' && <><GraphUp/> Recent PnL</>}
                    {type === 'winrate' && <><PieChart/> Win Rate</>}
                    {type === 'expectancy' && <><Wallet/> Expectancy</>}
                    {type === 'profit_factor' && <><Lightning/> Profit Factor</>}
                    {type === 'best_pair' && <><Trophy/> Best Pair</>}
                    {type === 'avg_wl' && <><GraphUp/> Avg Win/Loss</>}
                </h4>
                <button onClick={() => handleRemoveStat(type)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X/></button>
            </div>
            
            <div className="h-[80%] w-full flex items-center justify-center">
                {/* 1. Equity Curve */}
                {type === 'equity' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.equityData}>
                            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <Area type="monotone" dataKey="pnl" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                {/* 2. Recent PnL */}
                {type === 'recent' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.recentData}>
                            <ReferenceLine y={0} stroke="#666" />
                            <Bar dataKey="val">{analytics.recentData.map((e,i) => <Cell key={i} fill={e.color}/>)}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* 3. Win Rate */}
                {type === 'winrate' && <div className="text-4xl font-bold text-cyan-400">{analytics.winRate.toFixed(1)}%</div>}

                {/* 4. Expectancy */}
                {type === 'expectancy' && (
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${analytics.expectancy >= 0 ? 'text-blue-400' : 'text-red-400'}`}>${analytics.expectancy}</div>
                        <div className="text-xs text-gray-500 mt-1">Avg per trade</div>
                    </div>
                )}

                {/* 5. Profit Factor */}
                {type === 'profit_factor' && (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-purple-400">{analytics.profitFactor}</div>
                        <div className="text-xs text-gray-500 mt-1">Gross Win / Gross Loss</div>
                    </div>
                )}

                {/* 6. Best Pair */}
                {type === 'best_pair' && (
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                             <Trophy className="text-yellow-500" size={24} /> {analytics.bestPair}
                        </div>
                        <div className={`text-sm font-mono ${analytics.bestPairPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {analytics.bestPairPnL > 0 ? '+' : ''}{analytics.bestPairPnL.toFixed(2)}
                        </div>
                    </div>
                )}

                {/* 7. Avg Win vs Loss */}
                {type === 'avg_wl' && (
                    <div className="w-full space-y-3 px-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-green-400">Avg Win</span>
                            <span className="font-bold">${analytics.avgWin.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-400">Avg Loss</span>
                            <span className="font-bold">${analytics.avgLoss.toFixed(0)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-full" style={{ width: `${(analytics.avgWin / (analytics.avgWin + analytics.avgLoss || 1)) * 100}%` }}></div>
                            <div className="bg-red-500 h-full" style={{ width: `${(analytics.avgLoss / (analytics.avgWin + analytics.avgLoss || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      );
  };

  const InputClass = "w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cyan-400 outline-none transition text-sm";
  const LabelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full pb-10">
        
        {/* ---------------- LEFT COLUMN: INPUTS (50%) ---------------- */}
        <div className="bg-cosmic-card border border-white/10 rounded-xl p-6 relative flex flex-col h-fit shadow-xl shadow-blue-900/5">
            
            {/* Header & Withdraw Toggle */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <h3 className="font-bold text-white text-lg">Log New Trade</h3>
                <button onClick={() => setShowWithdraw(!showWithdraw)} className="text-xs text-red-400 hover:text-white flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    <Wallet/> {showWithdraw ? 'Cancel' : 'Withdraw'}
                </button>
            </div>

            {/* WITHDRAWAL FORM (Conditional) */}
            {showWithdraw && (
                <div className="mb-6 bg-red-500/5 border border-red-500/20 p-4 rounded-lg animate-in slide-in-from-top-2">
                    <h4 className="text-red-400 text-sm font-bold mb-3">Record Withdrawal</h4>
                    <div className="flex gap-3 mb-3">
                        <input type="number" placeholder="Amount" className={InputClass} value={withdrawData.amount} onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})} />
                        <input type="date" className={InputClass} value={withdrawData.date} onChange={e => setWithdrawData({...withdrawData, date: e.target.value})} />
                    </div>
                    <button onClick={handleWithdraw} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-sm">Confirm Withdrawal</button>
                </div>
            )}

            {/* MAIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Row 1: Date, Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={LabelClass}>Date</label><input type="date" className={InputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                    <div><label className={LabelClass}>Time</label><input type="time" className={InputClass} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
                </div>

                {/* Row 2: Pair, Direction */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LabelClass}>Symbol</label>
                        <input type="text" placeholder="EUR/USD" className={InputClass} value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} />
                    </div>
                    <div>
                        <label className={LabelClass}>Direction</label>
                        <div className="flex bg-black/40 rounded p-1 border border-white/10 h-[42px]">
                            {['Buy', 'Sell'].map(type => (
                                <button key={type} type="button" onClick={()=>setFormData({...formData, type})} 
                                    className={`flex-1 text-xs font-bold rounded transition ${formData.type === type ? (type === 'Buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'text-gray-400 hover:text-white'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 3: Timeframe, Strategy */}
                <div className="grid grid-cols-2 gap-4">
                      <div><label className={LabelClass}>Timeframe</label><input type="text" placeholder="M5, H1" className={InputClass} value={formData.timeframe} onChange={e => setFormData({...formData, timeframe: e.target.value})} /></div>
                      <div>
                          <label className={LabelClass}>Entry Strategy</label>
                          <select className={InputClass} value={formData.entryStrategy} onChange={e => setFormData({...formData, entryStrategy: e.target.value})}>
                              <option>Candle Close</option><option>Limit Order</option><option>Market Exec</option><option>Custom</option>
                          </select>
                          {formData.entryStrategy === 'Custom' && <input type="text" placeholder="Specify..." className={`${InputClass} mt-2`} value={formData.customEntry} onChange={e => setFormData({...formData, customEntry: e.target.value})} />}
                      </div>
                </div>

                {/* Row 4: Result, Exit */}
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={LabelClass}>Result (PnL)</label><input type="number" step="0.01" placeholder="-50 or +100" className={InputClass} value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} /></div>
                    <div><label className={LabelClass}>Exit Reason</label><input type="text" placeholder="TP, SL, Manual" className={InputClass} value={formData.exitStrategy} onChange={e => setFormData({...formData, exitStrategy: e.target.value})} /></div>
                </div>

                {/* Dropzone */}
                <div {...getRootProps()} className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/50 transition cursor-pointer bg-black/20 group">
                    <input {...getInputProps()} />
                    {formData.image ? (
                        <div className="relative h-20 w-full"><img src={formData.image} className="h-full w-full object-contain"/><button type="button" onClick={(e)=>{e.stopPropagation(); setFormData({...formData, image:null})}} className="absolute top-0 right-0 bg-red-500 p-1 rounded text-white"><X/></button></div>
                    ) : <div className="text-gray-500 group-hover:text-cyan-400 transition"><Camera className="mx-auto mb-1 text-xl"/> <span className="text-xs">Drop screenshot</span></div>}
                </div>

                {/* Comment */}
                <div><label className={LabelClass}>Comments</label><textarea rows="2" className={InputClass} value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})}></textarea></div>

                {/* Submit */}
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow-lg shadow-blue-900/20">
                    Log Trade
                </button>
            </form>
        </div>

        {/* ---------------- RIGHT COLUMN: WIDGETS (50%) ---------------- */}
        <div className="space-y-6">
            
            {/* Header with Compact Add Button */}
            <div className="flex justify-between items-center relative">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Quick Stats</h3>
                <button 
                    onClick={() => setShowStatMenu(!showStatMenu)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 hover:text-white transition flex items-center gap-2 text-xs border border-white/5"
                >
                    <Plus size={16} /> Add
                </button>

                {/* Dropdown Menu (Positioned relative to button parent) */}
                {showStatMenu && (
                    <div className="absolute top-10 right-0 w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-2 text-xs font-bold text-gray-500 uppercase border-b border-white/5 bg-white/5">Select Widget</div>
                        
                        {!activeStats.includes('equity') && <button onClick={() => handleAddStat('equity')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Equity Curve</button>}
                        {!activeStats.includes('best_pair') && <button onClick={() => handleAddStat('best_pair')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Best Pair</button>}
                        {!activeStats.includes('winrate') && <button onClick={() => handleAddStat('winrate')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Win Rate</button>}
                        
                        {!activeStats.includes('profit_factor') && <button onClick={() => handleAddStat('profit_factor')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Profit Factor</button>}
                        {!activeStats.includes('recent') && <button onClick={() => handleAddStat('recent')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Recent PnL</button>}
                        {!activeStats.includes('avg_wl') && <button onClick={() => handleAddStat('avg_wl')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Avg Win/Loss</button>}
                        {!activeStats.includes('expectancy') && <button onClick={() => handleAddStat('expectancy')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300">Expectancy</button>}
                    </div>
                )}
            </div>
            
            {/* Grid of Active Widgets */}
            <div className={`grid gap-4 ${activeStats.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {activeStats.map(stat => <Widget key={stat} type={stat} />)}
            </div>

            {/* Empty State / Space for Future Features */}
            {activeStats.length === 0 && (
                <div className="h-40 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-600 text-sm">
                    No widgets selected
                </div>
            )}

        </div>

    </div>
  );
};

export default AddTradeTab;