import React, { useState, useMemo } from 'react';
import { Calculator, Shield, GraphUp, Trophy, Wallet, BoxArrowUpRight, QuestionCircle } from 'react-bootstrap-icons';
import { useTradeContext } from '../components/context/TradeContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- 1. EXPANDED MARKET DATA (For Tooltip Reference Only) ---
const MARKET_DATA = {
  Majors: [
    { label: 'EUR/USD', aliases: ['Fiber'] },
    { label: 'GBP/USD', aliases: ['Cable'] },
    { label: 'USD/JPY', aliases: ['Gopher'] },
    { label: 'USD/CHF', aliases: ['Swissie'] },
    { label: 'AUD/USD', aliases: ['Aussie'] },
    { label: 'USD/CAD', aliases: ['Loonie'] },
    { label: 'NZD/USD', aliases: ['Kiwi'] },
  ],
  Minors: [
    { label: 'EUR/GBP', aliases: ['Chunnel'] },
    { label: 'EUR/AUD', aliases: ['Euro Aussie'] },
    { label: 'GBP/JPY', aliases: ['Guppy', 'The Beast'] },
    { label: 'EUR/JPY', aliases: ['Yuppy'] },
    { label: 'AUD/JPY', aliases: ['Aussie Yen'] },
    { label: 'CAD/JPY', aliases: ['Caddie'] },
    { label: 'GBP/AUD', aliases: ['Pound Aussie'] },
    { label: 'GBP/CAD', aliases: ['Pound Loonie'] },
    { label: 'NZD/JPY', aliases: ['Kiwi Yen'] },
  ],
  Indices: [
    { label: 'US500', aliases: ['S&P 500', 'SPX'] },
    { label: 'US30', aliases: ['Dow Jones', 'DJI'] },
    { label: 'NAS100', aliases: ['Nasdaq', 'NDX'] },
    { label: 'GER30', aliases: ['DAX', 'DE30'] },
    { label: 'UK100', aliases: ['FTSE 100'] },
  ],
  Metals: [
    { label: 'XAU/USD', aliases: ['Gold'] },
    { label: 'XAG/USD', aliases: ['Silver'] },
  ],
  Crypto: [
    { label: 'BTC/USD', aliases: ['Bitcoin'] },
    { label: 'ETH/USD', aliases: ['Ethereum'] },
    { label: 'SOL/USD', aliases: ['Solana'] },
  ]
};

// --- 2. HELPERS: ASSET LOGIC ---
const getAssetConfig = (pair) => {
  if (!pair) return { type: 'forex', lotSize: 100000, pipSize: 0.0001, name: 'Standard Forex' };
  // Robust normalization: Remove slashes, dashes, and uppercase everything
  const p = pair.toUpperCase().replace('/', '').replace('-', '').trim();

  // Metals (Gold/Silver)
  if (p.includes('XAU') || p.includes('GOLD')) return { type: 'metal', lotSize: 100, pipSize: 0.01, name: 'Gold (100oz)' };
  if (p.includes('XAG') || p.includes('SILVER')) return { type: 'metal', lotSize: 5000, pipSize: 0.01, name: 'Silver (5000oz)' };

  // Crypto
  if (['BTC', 'ETH', 'SOL', 'LTC', 'BNB', 'XRP', 'ADA'].some(c => p.startsWith(c))) return { type: 'crypto', lotSize: 1, pipSize: 1, name: 'Crypto (1 Unit)' };

  // Indices
  if (['US30', 'DJI', 'WS30', 'WALL'].some(i => p.includes(i))) return { type: 'index', lotSize: 1, pipSize: 1, name: 'US30' };
  if (['NAS100', 'NDX', 'US100'].some(i => p.includes(i))) return { type: 'index', lotSize: 1, pipSize: 1, name: 'Nasdaq' };
  if (['SPX', 'SP500', 'US500'].some(i => p.includes(i))) return { type: 'index', lotSize: 1, pipSize: 1, name: 'S&P 500' };
  if (['GER30', 'DAX', 'DE30'].some(i => p.includes(i))) return { type: 'index', lotSize: 1, pipSize: 1, name: 'DAX 40' };
  if (['UK100', 'FTSE'].some(i => p.includes(i))) return { type: 'index', lotSize: 1, pipSize: 1, name: 'FTSE 100' };

  // Forex JPY
  if (p.includes('JPY')) return { type: 'forex_jpy', lotSize: 100000, pipSize: 0.01, name: 'Forex (JPY)' };

  // Default Forex
  return { type: 'forex', lotSize: 100000, pipSize: 0.0001, name: 'Forex (Standard)' };
};

const calculatePipValue = (pair, price) => {
  const config = getAssetConfig(pair);
  const p = pair.toUpperCase();

  // 1. Quote is USD (Fixed Value)
  if (p.endsWith('USD') || p.endsWith('/USD')) {
      return config.pipSize * config.lotSize;
  }
  // 2. Base is USD (Value varies by price)
  if (p.startsWith('USD') && price > 0) {
      return (config.pipSize / price) * config.lotSize;
  }
  // 3. Fallback
  return 10;
};

const RiskCalculator = () => {
  const { activeAccount, accounts, setActiveAccountId } = useTradeContext();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [mode, setMode] = useState('pips'); 
  const [riskBasis, setRiskBasis] = useState('equity'); 
  
  const [inputs, setInputs] = useState({
    riskPercent: 1.0,
    stopLossPips: 20,
    entryPrice: 0,
    stopLossPrice: 0,
    rrRatio: 2.0 
  });

  const [selectedPair, setSelectedPair] = useState('EUR/USD');

  // --- DERIVED STATE ---
  const currentEquity = useMemo(() => activeAccount ? activeAccount.size : 10000, [activeAccount]);

  const initialBalance = useMemo(() => {
    if (!activeAccount) return 10000;
    const totalPnL = activeAccount.trades ? activeAccount.trades.reduce((acc, t) => acc + parseFloat(t.result), 0) : 0;
    const totalWithdrawals = activeAccount.withdrawals ? activeAccount.withdrawals.reduce((acc, w) => acc + parseFloat(w.amount), 0) : 0;
    return activeAccount.size - totalPnL + totalWithdrawals;
  }, [activeAccount]);

  const effectiveCalculationBase = useMemo(() => {
      if (!activeAccount) return 10000;
      return riskBasis === 'equity' ? currentEquity : initialBalance;
  }, [activeAccount, riskBasis, initialBalance, currentEquity]);

  const { pipValue, contractSize, assetName } = useMemo(() => {
      if (!selectedPair) return { pipValue: 10, contractSize: 100000, assetName: '-' };
      const config = getAssetConfig(selectedPair);
      const val = calculatePipValue(selectedPair, inputs.entryPrice);
      return { pipValue: val, contractSize: config.lotSize, assetName: config.name };
  }, [selectedPair, inputs.entryPrice]);

  // --- MAIN CALCULATION ---
  const results = useMemo(() => {
    const { riskPercent, stopLossPips, entryPrice, stopLossPrice, rrRatio } = inputs;
    
    const riskAmount = (effectiveCalculationBase * (riskPercent / 100));
    const rewardAmount = riskAmount * rrRatio;

    let pips = stopLossPips;
    let positionSize = 0;
    let positionUnits = 0;

    if (mode === 'levels' && entryPrice > 0 && stopLossPrice > 0) {
        const diff = Math.abs(entryPrice - stopLossPrice);
        if (diff > 0) {
            positionUnits = riskAmount / diff;
            positionSize = positionUnits / contractSize;
        }
    } else if (mode === 'pips' && pips > 0) {
        if (pipValue > 0) {
            positionSize = riskAmount / (pips * pipValue);
            positionUnits = positionSize * contractSize;
        }
    }

    return {
        riskAmount: riskAmount,
        positionSize: positionSize,
        positionUnits: positionUnits,
        actualRiskPercent: riskPercent,
        potentialWin: rewardAmount,
        potentialLoss: riskAmount,
        equityWin: currentEquity + rewardAmount,
        equityLoss: currentEquity - riskAmount
    };
  }, [inputs, mode, effectiveCalculationBase, currentEquity, pipValue, contractSize]);

  // --- ANALYTICS ---
  const pairPerformance = useMemo(() => {
    if (!activeAccount || !selectedPair) return null;
    const cleanPair = selectedPair.replace('/', '').toUpperCase();
    
    const trades = activeAccount.trades.filter(t => t.pair.replace('/', '').toUpperCase() === cleanPair);
    
    if (trades.length === 0) return { count: 0, winRate: 0, pnl: 0, profitFactor: 0 };
    
    const wins = trades.filter(t => t.result > 0);
    const losses = trades.filter(t => t.result < 0);
    const totalPnL = trades.reduce((acc, t) => acc + parseFloat(t.result), 0);
    const grossWin = wins.reduce((acc, t) => acc + parseFloat(t.result), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + parseFloat(t.result), 0));
    
    return {
        count: trades.length,
        winRate: ((wins.length / trades.length) * 100).toFixed(1),
        pnl: totalPnL.toFixed(2),
        profitFactor: grossLoss === 0 ? (grossWin > 0 ? '∞' : '0.00') : (grossWin / grossLoss).toFixed(2)
    };
  }, [activeAccount, selectedPair]);

  const equityCurveData = useMemo(() => {
    if (!activeAccount) return [];
    const sortedTrades = [...activeAccount.trades].sort((a,b) => new Date(a.date) - new Date(b.date));
    const totalPnL = sortedTrades.reduce((acc, t) => acc + parseFloat(t.result), 0);
    let runningEquity = activeAccount.size - totalPnL; 
    
    const data = [{ name: 'Start', equity: runningEquity }];
    sortedTrades.forEach((t, i) => {
        runningEquity += parseFloat(t.result);
        data.push({ name: `T${i+1}`, equity: runningEquity });
    });

    const startProjection = currentEquity;
    const lastHistoryPoint = { name: 'Now', equity: startProjection, win: startProjection, loss: startProjection };
    const futurePoint = { name: 'Proj', win: results.equityWin, loss: results.equityLoss };

    return [...data, lastHistoryPoint, futurePoint];
  }, [activeAccount, results.equityWin, results.equityLoss, currentEquity]);


  // --- STYLES ---
  const InputClass = "w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cyan-400 outline-none transition text-sm font-mono";
  const LabelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1";
  const CardClass = "bg-cosmic-card border border-white/10 rounded-xl p-6 shadow-xl shadow-blue-900/5 relative";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg text-cyan-400">
                <Calculator size={32}/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">Risk Calculator</h1>
                <p className="text-gray-400">Precision position sizing & trade projection.</p>
            </div>
        </div>
        <button 
            onClick={() => navigate('/journal')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-900/20"
        >
            <BoxArrowUpRight/> Entered a trade? Log it!
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: INPUTS --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* PAIR SELECTION AREA */}
            <div className={CardClass}>
                 <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* INPUT PAIR SELECTOR */}
                    <div className="flex-1 relative z-20"> 
                        <label className={LabelClass}>Select Pair</label>
                        <div className="relative group">
                            
                            {/* TEXT INPUT */}
                            <input 
                                type="text"
                                className={InputClass}
                                value={selectedPair}
                                placeholder="e.g. EUR/USD"
                                onChange={(e) => {
                                    let val = e.target.value.toUpperCase();
                                    if(val.length === 6 && !val.includes('/') && !val.includes(' ') && /^[A-Z]+$/.test(val)) {
                                       val = val.slice(0,3) + '/' + val.slice(3);
                                    }
                                    setSelectedPair(val);
                                }}
                            />

                            {/* TOOLTIP TRIGGER */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 cursor-help transition-colors group">
                                <QuestionCircle size={18} />
                                
                                {/* TOOLTIP POPUP */}
                                {/* UPDATED: w-80 (was w-72) to prevent text clipping */}
                                <div className="absolute top-full right-0 pt-3 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-200 group-hover:delay-0 z-50 pointer-events-none group-hover:pointer-events-auto">
                                    <div className="bg-[#0f172a] border border-white/20 rounded-xl shadow-2xl p-4 relative">
                                        <div className="text-xs text-gray-300 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <p className="font-bold text-white border-b border-white/10 pb-2 mb-2 sticky top-0 bg-[#0f172a]">Market Name Guide</p>
                                            {Object.entries(MARKET_DATA).map(([category, pairs]) => (
                                                <div key={category}>
                                                    <span className="text-cyan-500 font-bold block mb-1 text-[10px] uppercase">{category}</span>
                                                    <ul className="space-y-1 mb-3">
                                                        {pairs.map(pair => (
                                                            /* Added pr-2 to prevent scrollbar overlap */
                                                            <li key={pair.label} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-1 pr-2">
                                                                <span className="text-white font-mono">{pair.label}</span>
                                                                <span className="text-gray-500 italic text-[10px] text-right">
                                                                    {pair.aliases.join(', ')}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute -top-1 right-2 w-3 h-3 bg-[#0f172a] border-t border-l border-white/20 transform rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500 mt-2 flex justify-between">
                            <span>Detected: <span className="text-cyan-400">{assetName}</span></span>
                            <span>Pip Val: <span className="text-cyan-400">${pipValue.toFixed(2)}</span></span>
                        </p>
                    </div>

                    {/* Mini Analytics for Pair */}
                    {pairPerformance && (
                        <div className="flex-1 flex gap-4 bg-black/20 p-3 rounded-lg border border-white/5 items-center justify-around z-10">
                            <div className="text-center">
                                <div className="text-xs text-gray-500">Win Rate</div>
                                <div className={`text-xl font-bold ${parseFloat(pairPerformance.winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {pairPerformance.winRate}%
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="text-xs text-gray-500">Profit Factor</div>
                                <div className="text-xl font-bold text-blue-400">{pairPerformance.profitFactor}</div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="text-xs text-gray-500">Total PnL</div>
                                <div className={`text-xl font-bold ${parseFloat(pairPerformance.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${pairPerformance.pnl}
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            </div>

            <div className={CardClass}>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="text-blue-400"/> Trade Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Risk Basis Selector */}
                    <div className="md:col-span-2 bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                         <div className="text-sm text-gray-400 flex items-center gap-2">
                            <Wallet/>
                            Calculate risk based on:
                         </div>
                         <div className="flex bg-black/40 rounded p-1 border border-white/10">
                            <button 
                                onClick={() => setRiskBasis('balance')}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition ${riskBasis === 'balance' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Initial Balance
                            </button>
                            <button 
                                onClick={() => setRiskBasis('equity')}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition ${riskBasis === 'equity' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Current Equity
                            </button>
                         </div>
                    </div>

                    {/* Account Balance Display */}
                    <div>
                        <label className={LabelClass}>
                            {riskBasis === 'balance' ? 'Initial Balance ($)' : 'Current Equity ($)'}
                        </label>
                        <input 
                            type="number" 
                            className={InputClass} 
                            value={effectiveCalculationBase}
                            readOnly 
                            title="Used to calculate the dollar risk amount"
                        />
                    </div>

                    {/* Risk Percent */}
                    <div>
                        <label className={LabelClass}>Risk per Trade (%)</label>
                        <div className="flex items-center gap-3">
                             <input 
                                type="number" 
                                step="0.1"
                                className={InputClass} 
                                value={inputs.riskPercent}
                                onChange={(e) => setInputs({...inputs, riskPercent: parseFloat(e.target.value) || 0})}
                            />
                            {/* Quick Presets */}
                            <div className="flex gap-1">
                                {[0.5, 1, 2].map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => setInputs({...inputs, riskPercent: val})}
                                        className={`text-xs px-2 py-2 rounded border transition ${inputs.riskPercent === val ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk:Reward Ratio */}
                    <div>
                        <label className={LabelClass}>Risk : Reward Ratio</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-bold">1 :</span>
                            <input 
                                type="number" 
                                step="0.1"
                                className={InputClass} 
                                value={inputs.rrRatio}
                                onChange={(e) => setInputs({...inputs, rrRatio: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    {/* Calculation Mode Toggle */}
                    <div className="flex items-end">
                        <div className="w-full bg-black/20 p-1 rounded-lg flex border border-white/5 h-[46px]">
                            <button 
                                onClick={() => setMode('pips')}
                                className={`flex-1 rounded text-sm font-bold transition ${mode === 'pips' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                By Pips
                            </button>
                            <button 
                                onClick={() => setMode('levels')}
                                className={`flex-1 rounded text-sm font-bold transition ${mode === 'levels' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                By Levels
                            </button>
                        </div>
                    </div>

                    {/* DYNAMIC INPUTS BASED ON MODE */}
                    {mode === 'pips' ? (
                        <>
                             <div>
                                <label className={LabelClass}>Stop Loss (Pips)</label>
                                <input 
                                    type="number" 
                                    className={InputClass} 
                                    value={inputs.stopLossPips}
                                    onChange={(e) => setInputs({...inputs, stopLossPips: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div className="opacity-50">
                                <label className={LabelClass}>Pip Value (Auto-Calc)</label>
                                <input 
                                    type="number" 
                                    className={InputClass} 
                                    value={pipValue}
                                    readOnly
                                    title="Calculated automatically based on pair selection"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className={LabelClass}>Entry Price</label>
                                <input 
                                    type="number" 
                                    className={InputClass} 
                                    value={inputs.entryPrice}
                                    onChange={(e) => setInputs({...inputs, entryPrice: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className={LabelClass}>Stop Loss Price</label>
                                <input 
                                    type="number" 
                                    className={InputClass} 
                                    value={inputs.stopLossPrice}
                                    onChange={(e) => setInputs({...inputs, stopLossPrice: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>
            
            {/* Equity Curve Projection */}
            <div className={CardClass}>
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GraphUp className="text-purple-400"/> Projected Equity Curve
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityCurveData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="name" stroke="#666" fontSize={10} tick={{fill: '#666'}} />
                            <YAxis stroke="#666" fontSize={10} tick={{fill: '#666'}} domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}}
                                itemStyle={{fontSize: '12px'}}
                            />
                            {/* History Line */}
                            <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r: 4}} name="History" />
                            
                            {/* Win Projection */}
                            <Line type="monotone" dataKey="win" stroke="#4ade80" strokeWidth={2} strokeDasharray="5 5" dot={{r:4}} name="If Won" />
                            
                            {/* Loss Projection */}
                            <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{r:4}} name="If Lost" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* --- RIGHT: RESULTS --- */}
        <div className="lg:col-span-1 space-y-6">
            <div 
                className={`${CardClass} bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center py-10`}
            >
                <h3 className="text-center text-gray-400 text-sm uppercase tracking-widest mb-8">Calculated Position</h3>
                
                <div className="space-y-8">
                    {/* Primary Result */}
                    <div className="text-center">
                        <p className="text-gray-500 text-xs mb-2">Position Size (Lots)</p>
                        <div className="text-5xl font-bold text-white font-mono tracking-tighter">
                            {results.positionSize.toFixed(2)}
                        </div>
                        <p className="text-cyan-400 text-xs mt-2 font-mono">{Math.floor(results.positionUnits).toLocaleString()} Units</p>
                    </div>

                    <div className="h-px bg-white/10 w-full"></div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Risk Amount</p>
                            <div className="text-xl font-bold text-red-400">
                                -${results.riskAmount.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Reward (Target)</p>
                            <div className="text-xl font-bold text-green-400">
                                +${results.potentialWin.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RR Visual */}
                <div className="mt-10 px-4">
                     <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Risk (1.0)</span>
                        <span>Reward ({inputs.rrRatio})</span>
                    </div>
                    <div className="flex w-full h-3 rounded-full overflow-hidden">
                        <div className="bg-red-500 flex-1 opacity-80"></div>
                        <div className="bg-green-500 opacity-80" style={{ flex: inputs.rrRatio }}></div>
                    </div>
                </div>

            </div>
            
            {/* Quick Summary Card */}
             <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5">
                <h4 className="text-blue-400 font-bold text-sm mb-3 flex items-center gap-2"><Trophy/> Projection Summary</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400">
                        <span>Current Equity</span>
                        <span className="text-white">${currentEquity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>If Won (+{inputs.rrRatio}R)</span>
                        <span className="text-green-400 font-bold">${results.equityWin.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>If Lost (-1R)</span>
                        <span className="text-red-400 font-bold">${results.equityLoss.toLocaleString()}</span>
                    </div>

                    {/* Account Details & Selector */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <label className={LabelClass}>Active Account</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-xs mb-3"
                            value={activeAccount?.id}
                            onChange={(e) => setActiveAccountId(e.target.value)}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} (${acc.size.toLocaleString()})</option>
                            ))}
                        </select>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Trades Logged:</span>
                            <span className="text-white">{activeAccount?.trades?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Start Bal:</span>
                            <span className="text-white">${initialBalance.toLocaleString()}</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default RiskCalculator;