import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTradeContext } from '../../context/TradeContext';

const StatCard = ({ label, value, subtext, color = "text-white" }) => (
  <div className="bg-cosmic-card p-6 rounded-xl border border-white/5">
    <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">{label}</h3>
    <div className={`text-3xl font-bold font-mono mb-1 ${color}`}>{value}</div>
    {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
  </div>
);

const Dashboard = () => {
  const { activeAccount } = useTradeContext();
  const trades = activeAccount.trades;

  // --- 1. Calculate Stats ---
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result > 0).length;
  const losses = trades.filter(t => t.result < 0).length;
  const breakevens = trades.filter(t => t.result === 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  
  // Net Profit
  const netPnL = trades.reduce((acc, t) => acc + t.result, 0);

  // --- 2. Prepare Chart Data ---
  // We need to reconstruct the history of the balance
  let runningBalance = activeAccount.size - netPnL; // Start from initial balance (approx)
  // Actually, a better way is to start from initial and add up
  // But since we only store current size, let's reverse engineer for the chart, 
  // or simply calculate cumulative PnL. Let's do Cumulative PnL for simplicity.
  
  // Sort trades by date (Oldest first) for the chart
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let currentPnL = 0;
  const chartData = sortedTrades.map((t, index) => {
    currentPnL += t.result;
    return {
      name: index + 1, // Trade #1, #2, etc.
      pnl: currentPnL,
      date: t.date
    };
  });
  // Add a "Start" point at 0
  if (chartData.length > 0) {
      chartData.unshift({ name: 0, pnl: 0, date: 'Start' });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
            label="Net P&L" 
            value={`${netPnL >= 0 ? '+' : ''}$${netPnL.toFixed(2)}`} 
            color={netPnL >= 0 ? "text-trade-win" : "text-trade-loss"}
        />
        <StatCard label="Win Rate" value={`${winRate}%`} subtext={`${wins}W - ${losses}L - ${breakevens}BE`} />
        <StatCard label="Profit Factor" value="N/A" subtext="Need more data" />
        <StatCard label="Avg R:R" value="N/A" subtext="Calculated from Risk" />
      </div>

      {/* Main Chart Section */}
      <div className="bg-cosmic-card p-6 rounded-xl border border-white/5 h-[400px]">
        <h3 className="text-white font-bold mb-6">Equity Curve (Cumulative P&L)</h3>
        
        {totalTrades === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
                No trades logged yet. Start trading to see your curve!
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7b2cbf" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7b2cbf" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                <YAxis stroke="#666" tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#161b2e', borderColor: '#ffffff20', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#7b2cbf" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPnL)" 
                />
            </AreaChart>
            </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default Dashboard;