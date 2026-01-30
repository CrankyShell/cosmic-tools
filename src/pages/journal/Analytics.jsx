import React, { useMemo } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, ReferenceLine
} from 'recharts';

const Analytics = () => {
  const { activeAccount } = useTradeContext();
  const trades = activeAccount.trades;

  // --- DATA ENGINE ---
  const data = useMemo(() => {
    if (!trades.length) return null;
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

    // A. BASICS
    const totalPnL = sortedTrades.reduce((acc, t) => acc + t.result, 0);
    const wins = sortedTrades.filter(t => t.result > 0);
    const winRate = (wins.length / sortedTrades.length) * 100;
    const avgPnL = totalPnL / sortedTrades.length;

    // B. EVOLUTIVE & HOURLY
    let runningPnL = 0;
    let runningWins = 0;
    let runningWinSum = 0;
    
    // Initialize Hourly Buckets (00:00 - 23:00)
    const byHour = Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, val: 0 }));

    const evolutive = sortedTrades.map((t, i) => {
        runningPnL += t.result;
        if (t.result > 0) {
            runningWins++;
            runningWinSum += t.result;
        }

        // Hour Logic
        const h = new Date(t.date).getHours();
        if(!isNaN(h)) byHour[h].val += t.result;

        return {
            id: i + 1,
            pnl: runningPnL,
            winRate: ((runningWins / (i + 1)) * 100).toFixed(1),
            avgReward: runningWins > 0 ? (runningWinSum / runningWins).toFixed(2) : 0
        };
    });

    // C. AGGREGATION HELPERS
    const groupBy = (key) => {
        const groups = {};
        sortedTrades.forEach(t => {
            const val = t[key] || 'Unknown';
            if (!groups[val]) groups[val] = { name: val, pnl: 0, wins: 0, total: 0 };
            groups[val].pnl += t.result;
            groups[val].total++;
            if (t.result > 0) groups[val].wins++;
        });
        return Object.values(groups).map(g => ({ ...g, winRate: (g.wins / g.total) * 100 })).sort((a, b) => b.pnl - a.pnl);
    };

    // D. DAY OF WEEK
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = days.map(d => ({ name: d, pnl: 0, wins: 0, total: 0 }));
    sortedTrades.forEach(t => {
        const d = new Date(t.date).getDay();
        if(byDay[d]) {
            byDay[d].pnl += t.result;
            byDay[d].total++;
            if(t.result > 0) byDay[d].wins++;
        }
    });

    // E. HIERARCHY (Pair + TF)
    const hierarchyMap = {};
    sortedTrades.forEach(t => {
        const key = `${t.pair} (${t.timeframe})`;
        if(!hierarchyMap[key]) hierarchyMap[key] = { name: key, pnl: 0, wins: 0, total: 0 };
        hierarchyMap[key].pnl += t.result;
        hierarchyMap[key].total++;
        if(t.result > 0) hierarchyMap[key].wins++;
    });
    const hierarchy = Object.values(hierarchyMap).sort((a,b) => b.pnl - a.pnl);

    return {
        basics: { count: sortedTrades.length, totalPnL, winRate, avgPnL },
        evolutive,
        bySymbol: groupBy('pair'),
        bySetup: groupBy('setup'),
        byTimeframe: groupBy('timeframe'),
        bySide: groupBy('direction'),
        byDay,
        byHour,
        hierarchy
    };
  }, [trades]);

  if (!trades.length) return <div className="text-center py-20 text-gray-500">No trades yet.</div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-white/20 p-3 rounded shadow-xl z-50">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          {payload.map((p, i) => (
             <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
                {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. TOP STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Trades" value={data.basics.count} />
        <StatCard label="Net PnL" value={`$${data.basics.totalPnL.toFixed(2)}`} color={data.basics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Win Rate" value={`${data.basics.winRate.toFixed(1)}%`} />
        <StatCard label="Avg PnL" value={`$${data.basics.avgPnL.toFixed(2)}`} />
      </div>

      {/* 2. EQUITY CURVE */}
      <ChartSection title="Account Growth (Equity)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.evolutive}>
                <defs><linearGradient id="gPnL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="id" hide />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pnl" name="Equity" stroke="#8b5cf6" fill="url(#gPnL)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
      </ChartSection>

      {/* 3. GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <ChartSection title="Avg Win Size (Over Time)">
             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.evolutive}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="id" hide />
                    <YAxis stroke="#666" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="avgReward" stroke="#10b981" strokeWidth={2} dot={false}/>
                </LineChart>
             </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="PnL by Hour">
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.byHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                    <XAxis dataKey="name" stroke="#666" interval={2} fontSize={10}/>
                    <YAxis stroke="#666" />
                    <Tooltip content={<CustomTooltip />} cursor={{fill:'transparent'}}/>
                    <ReferenceLine y={0} stroke="#666"/>
                    <Bar dataKey="val" name="PnL">
                        {data.byHour.map((e,i) => <Cell key={i} fill={e.val>=0?'#4ade80':'#ef4444'}/>)}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="PnL by Day of Week">
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                    <XAxis dataKey="name" stroke="#666"/>
                    <YAxis stroke="#666" />
                    <Tooltip content={<CustomTooltip />} cursor={{fill:'transparent'}}/>
                    <ReferenceLine y={0} stroke="#666"/>
                    <Bar dataKey="pnl" name="PnL">
                        {data.byDay.map((e,i) => <Cell key={i} fill={e.pnl>=0?'#4ade80':'#ef4444'}/>)}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
          </ChartSection>

           <ChartSection title="Win Rate Evolution">
             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.evolutive}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="id" hide />
                    <YAxis domain={[0,100]} stroke="#666" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="winRate" stroke="#f59e0b" strokeWidth={2} dot={false}/>
                </LineChart>
             </ResponsiveContainer>
          </ChartSection>
          
          {/* Include other existing charts (Symbol, Strategy, TF) here similarly... */}

      </div>

      {/* 4. HIERARCHY TABLE */}
      <div className="bg-cosmic-card border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/10 font-bold text-white">Performance Hierarchy (Pair + Timeframe)</div>
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/20 uppercase text-xs">
                <tr><th className="px-6 py-3">Context</th><th className="px-6 py-3">WR%</th><th className="px-6 py-3 text-right">PnL</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {data.hierarchy.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                        <td className="px-6 py-3 font-bold text-white">{item.name}</td>
                        <td className="px-6 py-3 text-blue-400">{((item.wins/item.total)*100).toFixed(1)}%</td>
                        <td className={`px-6 py-3 text-right font-mono font-bold ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${item.pnl.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

// Sub-Components
const StatCard = ({ label, value, color="text-white" }) => (
    <div className="bg-cosmic-card border border-white/10 p-6 rounded-xl text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
);
const ChartSection = ({ title, children }) => (
    <div className="bg-cosmic-card border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide border-b border-white/5 pb-2">{title}</h3>
        {children}
    </div>
);

export default Analytics;