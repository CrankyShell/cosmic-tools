import React, { useState, useCallback } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus, Wallet, Camera, Trash } from 'react-bootstrap-icons';
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
  // We track which stats are active. 
  const [activeStats, setActiveStats] = useState(['equity', 'recent']); 
  const [showStatMenu, setShowStatMenu] = useState(false);
  
  const [showPairMenu, setShowPairMenu] = useState(false);
  const [showTfMenu, setShowTfMenu] = useState(false);
  
  // Withdrawal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ 
      amount: '', 
      date: new Date().toISOString().split('T')[0], // Default to today
      comment: '' 
  });

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

  const handleAddStat = (statId) => {
      if (activeStats.length < 4 && !activeStats.includes(statId)) {
          setActiveStats([...activeStats, statId]);
          setShowStatMenu(false);
      }
  };

  const handleRemoveStat = (statId) => {
      setActiveStats(activeStats.filter(id => id !== statId));
  };

  // --- DATA PREP FOR WIDGETS ---
  const tradesRev = [...activeAccount.trades].reverse(); // Newest first for list, but calculations need logic
  // Calculate Equity Curve (Chronological)
  const tradesChrono = [...activeAccount.trades].sort((a,b) => new Date(a.date) - new Date(b.date));
  let runningPnL = 0;
  const equityData = tradesChrono.map((t, i) => { runningPnL += t.result; return { idx: i, pnl: runningPnL }; });
  
  // Recent 10 Trades (Newest First)
  const recentData = [...activeAccount.trades].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((t, i) => ({ 
      val: t.result, 
      color: t.result >= 0 ? '#4ade80' : '#ef4444' 
  })).reverse(); // Reverse for chart left-to-right

  const winRate = activeAccount.trades.length ? (activeAccount.trades.filter(t => t.result > 0).length / activeAccount.trades.length) * 100 : 0;
  const avgPnL = activeAccount.trades.length ? (activeAccount.trades.reduce((a,b) => a + b.result, 0) / activeAccount.trades.length).toFixed(2) : 0;

  // --- WIDGET COMPONENT ---
  const Widget = ({ type }) => {
      return (
        <div className="bg-cosmic-card border border-white/10 rounded-xl p-4 h-48 relative group animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider">
                    {type === 'equity' ? 'Equity Curve' : 
                     type === 'recent' ? 'Recent PnL' : 
                     type === 'winrate' ? 'Win Rate' : 'Avg PnL'}
                </h4>
                <button onClick={() => handleRemoveStat(type)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X/></button>
            </div>
            <div className="h-[80%] w-full">
                {type === 'equity' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityData}>
                            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                            <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
                {type === 'recent' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recentData}>
                            <ReferenceLine y={0} stroke="#666" />
                            <Bar dataKey="val">{recentData.map((e,i) => <Cell key={i} fill={e.color}/>)}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
                {type === 'winrate' && <div className="flex items-center justify-center h-full text-4xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>}
                {type === 'avg' && <div className="flex items-center justify-center h-full text-4xl font-bold text-purple-400">${avgPnL}</div>}
            </div>
        </div>
      );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full pb-10">
      
      {/* ---------------- LEFT COLUMN: INPUTS (50%) ---------------- */}
      <div className="bg-cosmic-card border border-white/10 rounded-xl p-6 relative flex flex-col h-fit shadow-xl shadow-purple-900/5">
         <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <h3 className="font-bold text-white text-lg">Log New Trade</h3>
            <button onClick={() => setShowWithdraw(true)} className="text-xs text-red-400 hover:text-white flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 transition hover:bg-red-500 hover:border-red-500">
                <Wallet size={12}/> Record Withdrawal
            </button>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Type & Pair */}
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 bg-black/40 p-1 rounded flex">
                    {['Buy', 'Sell'].map(type => (
                        <button key={type} type="button" onClick={() => setFormData({...formData, type})}
                            className={`flex-1 rounded text-sm font-bold transition ${formData.type === type ? (type === 'Buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'text-gray-500'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <div className="col-span-8 relative">
                    <input type="text" placeholder="Pair (e.g. XAU/USD)" className="w-full h-full bg-black/40 border border-white/10 rounded px-3 text-white text-sm focus:border-purple-500 outline-none uppercase"
                        value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value})}
                        onFocus={() => setShowPairMenu(true)} onBlur={() => setTimeout(() => setShowPairMenu(false), 200)}
                    />
                    {showPairMenu && activeAccount.savedSymbols.length > 0 && (
                        <div className="absolute z-50 w-full bg-gray-900 border border-white/20 rounded mt-1 shadow-xl max-h-40 overflow-y-auto">
                            {activeAccount.savedSymbols.map(s => (
                                <div key={s} className="p-2 hover:bg-white/10 cursor-pointer text-xs text-gray-300" onClick={() => setFormData({...formData, pair: s})}>{s}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: TF & Strategy */}
            <div className="grid grid-cols-2 gap-3">
                 <div className="relative">
                    <input type="text" placeholder="TF (15m)" className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none"
                        value={formData.timeframe} onChange={e => setFormData({...formData, timeframe: e.target.value})}
                        onFocus={() => setShowTfMenu(true)} onBlur={() => setTimeout(() => setShowTfMenu(false), 200)}
                    />
                     {showTfMenu && activeAccount.savedTimeframes.length > 0 && (
                        <div className="absolute z-50 w-full bg-gray-900 border border-white/20 rounded mt-1 shadow-xl max-h-40 overflow-y-auto">
                            {activeAccount.savedTimeframes.map(s => (
                                <div key={s} className="p-2 hover:bg-white/10 cursor-pointer text-xs text-gray-300" onClick={() => setFormData({...formData, timeframe: s})}>{s}</div>
                            ))}
                        </div>
                    )}
                 </div>
                 <select className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none"
                    value={formData.entryStrategy} onChange={e => setFormData({...formData, entryStrategy: e.target.value})}>
                    {activeAccount.savedEntryStrategies.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Custom">Custom...</option>
                </select>
            </div>
            {formData.entryStrategy === 'Custom' && (
                <input type="text" placeholder="Custom Strategy Name" className="w-full bg-black/40 border border-purple-500 rounded p-2 text-white text-sm"
                    value={formData.customEntry} onChange={e => setFormData({...formData, customEntry: e.target.value})} />
            )}

            {/* Row 3: Exit Strategy */}
            <div className="grid grid-cols-4 gap-2">
                {['TP', 'SL', 'BE', 'Decision'].map(opt => (
                    <button key={opt} type="button" onClick={() => setFormData({...formData, exitStrategy: opt})}
                        className={`text-xs py-2 rounded border ${formData.exitStrategy === opt ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/10 text-gray-400'}`}>
                        {opt}
                    </button>
                ))}
            </div>

            {/* Row 4: PnL & Date */}
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                    <input type="number" placeholder="PnL ($)" className={`w-full h-full bg-black/40 border rounded p-2 font-mono font-bold outline-none ${parseFloat(formData.result) > 0 ? 'border-green-500 text-green-400' : parseFloat(formData.result) < 0 ? 'border-red-500 text-red-400' : 'border-white/10 text-white'}`}
                        value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} />
                </div>
                <div className="col-span-5 relative">
                    <input type="date" className="w-full h-full bg-black/40 border border-white/10 rounded p-2 text-white text-xs outline-none"
                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="col-span-3 relative">
                     <input type="time" className="w-full h-full bg-black/40 border border-white/10 rounded p-2 text-white text-xs outline-none"
                        value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
            </div>

            {/* Row 5: Screenshot (Compact Button) */}
            <div className="flex items-center gap-3">
                 <div {...getRootProps()} className="flex-grow cursor-pointer bg-black/20 hover:bg-white/5 border border-white/10 border-dashed rounded p-3 text-center transition group">
                    <input {...getInputProps()} />
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 group-hover:text-white">
                        <Camera size={14}/> {formData.image ? 'Replace Image' : 'Attach Screenshot'}
                    </div>
                 </div>
                 {formData.image && (
                     <div className="h-10 w-10 relative group shrink-0">
                         <img src={formData.image} className="h-full w-full object-cover rounded border border-white/20" />
                         <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, image: null})}} 
                             className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:scale-110 transition"><X size={8}/></button>
                     </div>
                 )}
            </div>

            {/* Row 6: Comment */}
            <textarea rows="3" className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none resize-none focus:border-purple-500 transition"
                placeholder="Trade notes..." value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})}
            ></textarea>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-purple-900/20 transform hover:translate-y-[-1px]">Save Trade</button>
                <button type="button" onClick={handleClear} className="px-6 py-3 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">Clear</button>
            </div>
         </form>

         {/* Withdrawal Modal (Updated with Date) */}
         {showWithdraw && (
             <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center rounded-xl p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                 <div className="w-full">
                     <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><Wallet/> Record Withdrawal</h4>
                     
                     <label className="text-xs text-gray-500 uppercase">Amount</label>
                     <input type="number" placeholder="Amount ($)" className="w-full mb-3 bg-black border border-white/10 rounded p-3 text-white" 
                        value={withdrawData.amount} onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})}/>
                     
                     <label className="text-xs text-gray-500 uppercase">Date</label>
                     <input type="date" className="w-full mb-3 bg-black border border-white/10 rounded p-3 text-white" 
                        value={withdrawData.date} onChange={e => setWithdrawData({...withdrawData, date: e.target.value})}/>

                     <label className="text-xs text-gray-500 uppercase">Note</label>
                     <input type="text" placeholder="Reason..." className="w-full mb-4 bg-black border border-white/10 rounded p-3 text-white" 
                        value={withdrawData.comment} onChange={e => setWithdrawData({...withdrawData, comment: e.target.value})}/>

                     <div className="flex gap-2 mt-4">
                        <button onClick={() => { addWithdrawal(withdrawData.amount, withdrawData.date, withdrawData.comment); setShowWithdraw(false); }} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded py-2 transition">Confirm</button>
                        <button onClick={() => setShowWithdraw(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded py-2 transition">Cancel</button>
                     </div>
                 </div>
             </div>
         )}
      </div>

      {/* ---------------- RIGHT COLUMN: ANALYTICS (GRID LAYOUT) ---------------- */}
      <div className="grid grid-cols-2 gap-4 auto-rows-min content-start">
          {activeStats.map(statId => (
             <Widget key={statId} type={statId} />
          ))}

          {/* Add Stat Button - Only shows if less than 4 stats */}
          {activeStats.length < 4 && (
             <div className="border border-dashed border-white/10 rounded-xl h-48 flex items-center justify-center relative">
                <button 
                    onClick={() => setShowStatMenu(!showStatMenu)}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-purple-400 transition"
                >
                    <Plus size={32} />
                    <span className="text-sm font-medium">Add Statistic</span>
                </button>
                
                {/* Click Menu */}
                {showStatMenu && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                        {!activeStats.includes('equity') && <button onClick={() => handleAddStat('equity')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Equity Curve</button>}
                        {!activeStats.includes('recent') && <button onClick={() => handleAddStat('recent')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Recent PnL</button>}
                        {!activeStats.includes('winrate') && <button onClick={() => handleAddStat('winrate')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300 border-b border-white/5">Win Rate</button>}
                        {!activeStats.includes('avg') && <button onClick={() => handleAddStat('avg')} className="w-full text-left p-3 hover:bg-white/10 text-sm text-gray-300">Average PnL</button>}
                    </div>
                )}
             </div>
          )}
      </div>

    </div>
  );
};

export default AddTradeTab;