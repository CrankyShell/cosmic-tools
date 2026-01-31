import React, { useMemo, useState } from 'react';
import { useTradeContext } from '../../components/context/TradeContext';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Legend, ReferenceLine
} from 'recharts';
import { GraphUp, PieChart, Activity, Award, Grid3x3, Calendar3 } from 'react-bootstrap-icons'; // Added Icons
import CalendarView from '../../components/CalendarView'; // Import the new component

const Analytics = () => {
  const { activeAccount } = useTradeContext();
  const trades = activeAccount.trades || [];
  
  // NEW: View Mode State
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'calendar'

  // ==========================================
  // 1. DATA PROCESSING & CALCULATIONS
  // ==========================================

  // Simplified Statistics
  const stats = useMemo(() => {
    const totalPnL = trades.reduce((sum, t) => sum + parseFloat(t.result), 0);
    const wins = trades.filter(t => parseFloat(t.result) > 0).length;
    return {
      count: trades.length,
      pnl: totalPnL.toFixed(2),
      winRate: trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0,
      avgPnL: trades.length > 0 ? (totalPnL / trades.length).toFixed(2) : 0
    };
  }, [trades]);

  // General Time Series
  const timeSeriesData = useMemo(() => {
    if (trades.length === 0) return [];

    let cumulativePnL = 0;
    let winsSoFar = 0;
    let totalWinSize = 0;
    let winCount = 0;
    
    const totalAccountPnL = trades.reduce((acc, t) => acc + parseFloat(t.result), 0);
    const startBalance = (parseFloat(activeAccount.size) || 0) - totalAccountPnL;

    const initialPoint = {
      name: 'Start',
      pnl: 0,
      equity: startBalance,
      cumulative: 0,
      evolutiveWinRate: 0,
      avgReward: 0,
      date: 'Start',
      pair: '-'
    };

    const tradePoints = trades.map((t, index) => {
      const pnl = parseFloat(t.result);
      cumulativePnL += pnl;
      if (pnl > 0) {
        winsSoFar++;
        totalWinSize += pnl;
        winCount++;
      }
      return {
        name: `Trade ${index + 1}`,
        pnl,
        equity: startBalance + cumulativePnL,
        cumulative: cumulativePnL,
        evolutiveWinRate: ((winsSoFar / (index + 1)) * 100).toFixed(1),
        avgReward: winCount > 0 ? (totalWinSize / winCount).toFixed(2) : 0,
        date: t.date,
        pair: t.pair,
      };
    });

    return [initialPoint, ...tradePoints];
  }, [trades, activeAccount.size]);

  // Y-Axis Domain with Padding
  const yAxisDomain = useMemo(() => {
    if (timeSeriesData.length === 0) return ['auto', 'auto'];
    const values = timeSeriesData.map(d => d.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.05 || (min * 0.01); 
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [timeSeriesData]);

  // Monthly Performance
  const monthlyData = useMemo(() => {
    const months = {};
    trades.forEach(t => {
      const dateObj = new Date(t.date);
      if (isNaN(dateObj)) return;

      const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`; 
      const label = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!months[key]) months[key] = { name: label, value: 0 };
      months[key].value += parseFloat(t.result);
    });
    return Object.values(months);
  }, [trades]);

  // Cumulative PnL By Pair
  const cumulativeByPairData = useMemo(() => {
    const pairs = [...new Set(trades.map(t => t.pair))];
    const runningTotals = {};
    pairs.forEach(p => runningTotals[p] = 0);

    return trades.map((t, i) => {
      const pnl = parseFloat(t.result);
      if (runningTotals[t.pair] !== undefined) {
        runningTotals[t.pair] += pnl;
      }
      return {
        name: i + 1,
        ...runningTotals
      };
    });
  }, [trades]);

  // Helper for Grouping
  const getPerformanceBy = (key) => {
    const groups = trades.reduce((acc, t) => {
      const val = t[key] || 'Unknown';
      acc[val] = (acc[val] || 0) + parseFloat(t.result);
      return acc;
    }, {});
    return Object.keys(groups).map(name => ({ name, value: groups[name] }));
  };

  // Day of Week Stats
  const dayStats = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = days.map(day => ({ name: day, pnl: 0, wins: 0, count: 0 }));
    trades.forEach(t => {
      const d = new Date(t.date).getDay();
      if(!isNaN(d)) {
        const pnl = parseFloat(t.result);
        data[d].pnl += pnl;
        data[d].count++;
        if (pnl > 0) data[d].wins++;
      }
    });
    return data.map(d => ({ ...d, winRate: d.count > 0 ? ((d.wins / d.count) * 100).toFixed(1) : 0 }));
  }, [trades]);

  // Hourly Stats
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, value: 0 }));
    trades.forEach(t => {
      let h = -1;
      if (t.time && typeof t.time === 'string') {
        h = parseInt(t.time.split(':')[0]);
      } else if (t.date) {
        const d = new Date(t.date);
        if (!isNaN(d)) h = d.getHours();
      }

      if (!isNaN(h) && h >= 0 && h < 24) {
        hours[h].value += parseFloat(t.result);
      }
    });
    return hours;
  }, [trades]);

  // --- STYLING CONSTANTS ---
  const tooltipContentStyle = {
    backgroundColor: '#161b2e',
    border: '1px solid #3b82f6', // Changed to Blue
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
  };
  const tooltipItemStyle = { color: '#e0e1dd', fontSize: '13px', fontWeight: '500' };
  const tooltipLabelStyle = { color: '#9ca3af', fontSize: '12px', marginBottom: '5px' };
  // Changed first color from purple (#8b5cf6) to blue (#3b82f6)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#60a5fa', '#ec4899'];
  const startBalanceRef = timeSeriesData.length > 0 ? timeSeriesData[0].equity : 0;

  return (
    <div className="space-y-8 pb-24 px-2">
      
      {/* HEADER WITH TOGGLE SWITCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Stats Summary (Always visible) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
            <StatCard title="Trades" value={stats.count} icon={<Activity />} />
            <StatCard title="Total PnL" value={`$${stats.pnl}`} icon={<GraphUp />} color={stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
            <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={<PieChart />} />
            <StatCard title="Avg PnL" value={`$${stats.avgPnL}`} icon={<Award />} />
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-[#0b0d17] p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setViewMode('charts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold ${
                    viewMode === 'charts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white' // Changed bg-purple-600 to bg-blue-600
                }`}
              >
                  <Grid3x3 size={14}/> Charts
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold ${
                    viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white' // Changed bg-purple-600 to bg-blue-600
                }`}
              >
                  <Calendar3 size={14}/> Calendar
              </button>
          </div>
      </div>

      {/* CONDITIONAL RENDER: Charts vs Calendar */}
      {viewMode === 'calendar' ? (
        <CalendarView trades={trades} />
      ) : (
        // Existing Chart Views
        <div className="space-y-8 animate-fade-in">
            {/* 2. Advanced Equity Curve */}
            <ChartWrapper title="2. Advanced Equity Curve">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                    <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/> {/* Changed to Blue */}
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/> {/* Changed to Blue */}
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis 
                    domain={yAxisDomain} 
                    stroke="#666" 
                    fontSize={10} 
                    tickFormatter={(val) => `$${val.toFixed(0)}`} 
                    />
                    <Tooltip 
                    contentStyle={tooltipContentStyle} 
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} // Changed to Blue
                    />
                    <ReferenceLine y={startBalanceRef} stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" /> {/* Changed to Blue */}
                    <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#3b82f6" // Changed to Blue (was #a855f7)
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                    baseValue="dataMin"
                    />
                </AreaChart>
                </ResponsiveContainer>
            </ChartWrapper>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* 3. Monthly Performance */}
                <ChartWrapper title="3. Monthly Performance (PnL)">
                <BarChart data={monthlyData}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 4. Symbol Performance */}
                <ChartWrapper title="4. Symbol Performance">
                <BarChart data={getPerformanceBy('pair')}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {getPerformanceBy('pair').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 5. Entry Strategy Performance */}
                <ChartWrapper title="5. Entry Strategy Performance">
                <BarChart data={getPerformanceBy('setup')}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {getPerformanceBy('setup').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 6. Timeframe Performance */}
                <ChartWrapper title="6. Timeframe Performance">
                <BarChart data={getPerformanceBy('timeframe')}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {getPerformanceBy('timeframe').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 7. Trade Type Performance */}
                <ChartWrapper title="7. Trade Type Performance">
                <BarChart data={getPerformanceBy('type')}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {getPerformanceBy('type').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 8. Cumulative PnL All */}
                <ChartWrapper title="8. Cumulative PnL All">
                <AreaChart data={timeSeriesData}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="#10b98120" />
                </AreaChart>
                </ChartWrapper>
            </div>

            {/* 9. Cumulative PnL (By Pair) */}
            <ChartWrapper title="9. Cumulative PnL (By Pair)">
                <LineChart data={cumulativeByPairData}>
                <CartesianGrid stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Legend />
                {[...new Set(trades.map(t => t.pair))].map((pair, index) => (
                    <Line 
                    key={pair} 
                    type="monotone" 
                    dataKey={pair} 
                    stroke={colors[index % colors.length]} 
                    dot={false} 
                    strokeWidth={2}
                    />
                ))}
                </LineChart>
            </ChartWrapper>

            <div className="grid md:grid-cols-2 gap-6">
                {/* 10. Average Reward Over Time */}
                <ChartWrapper title="10. Average Reward (Win Size)">
                <LineChart data={timeSeriesData}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    <Line type="monotone" dataKey="avgReward" stroke="#06b6d4" dot={false} strokeWidth={2} />
                </LineChart>
                </ChartWrapper>

                {/* 11. Evolutive Winrate */}
                <ChartWrapper title="11. Evolutive Winrate (%)">
                <LineChart data={timeSeriesData}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    <Line type="stepAfter" dataKey="evolutiveWinRate" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
                </ChartWrapper>

                {/* 12. Monthly PnL Overview */}
                <ChartWrapper title="12. Monthly PnL Overview">
                <BarChart data={monthlyData} layout="vertical">
                    <CartesianGrid stroke="#ffffff05" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={50}/>
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value" barSize={20}>
                    {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 13. PnL by Day of Week */}
                <ChartWrapper title="13. PnL by Day of Week">
                <BarChart data={dayStats}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickFormatter={(val) => val.substring(0,3)} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="pnl">
                    {dayStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>

                {/* 14. Win Rate by Day of Week */}
                <ChartWrapper title="14. Win Rate by Day of Week (%)">
                <BarChart data={dayStats}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickFormatter={(val) => val.substring(0,3)} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="winRate" fill="#3b82f6" /> {/* Changed to Blue */}
                </BarChart>
                </ChartWrapper>

                {/* 15. Total PnL per Hour */}
                <ChartWrapper title="15. Total PnL per Hour">
                <BarChart data={hourlyData}>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={8} interval={2} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="value">
                    {hourlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ChartWrapper>
            </div>

            {/* 16. Performance hierarchy */}
            <div className="bg-cosmic-card p-6 rounded-2xl border border-white/5">
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3"> {/* Changed to Blue */}
                        16. Performance Hierarchy
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 ml-4">
                        Detailed breakdown of PnL by asset class and execution timeframe
                    </p>
                </div>
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={getPerformanceBy('pair')} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid stroke="#ffffff05" horizontal={false} />
                            <XAxis type="number" stroke="#666" fontSize={10} />
                            <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={80} />
                            <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{fill: '#ffffff05'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {getPerformanceBy('pair').map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#3b82f6' : '#ef4444'} /> // Changed Positive to Blue
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon, color = "text-white" }) => (
  <div className="bg-cosmic-card p-4 rounded-xl border border-white/5 flex items-center gap-4 min-h-[80px]">
    <div className="p-3 bg-white/5 rounded-lg text-blue-400">{icon}</div> {/* Changed to text-blue-400 */}
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{title}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  </div>
);

const ChartWrapper = ({ title, children }) => (
  <div className="bg-cosmic-card p-6 rounded-2xl border border-white/5 h-[350px] flex flex-col">
    <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest border-l-2 border-blue-500 pl-3"> {/* Changed to Blue */}
      {title}
    </h3>
    <div className="flex-grow w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

export default Analytics;