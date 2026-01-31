import React, { useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addDays, isSameMonth, isValid
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, X, ArrowUpCircle, ArrowDownCircle, 
  Activity, PieChart as PieIcon, Clock, Award
} from 'react-bootstrap-icons';
import { 
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, PieChart, Pie
} from 'recharts';

const CalendarView = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (trades.length > 0) {
      const sorted = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestDate = new Date(sorted[0].date);
      return isValid(latestDate) ? latestDate : new Date();
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState(null);

  const dailyData = useMemo(() => {
    const data = {};
    trades.forEach(trade => {
      const dateObj = new Date(trade.date);
      if (!isValid(dateObj)) return;
      const dateKey = format(dateObj, 'yyyy-MM-dd');
      
      if (!data[dateKey]) {
        data[dateKey] = { pnl: 0, trades: [], wins: 0, count: 0 };
      }
      
      const result = parseFloat(trade.result);
      data[dateKey].pnl += result;
      data[dateKey].count += 1;
      if (result > 0) data[dateKey].wins += 1;
      data[dateKey].trades.push(trade);
    });
    return data;
  }, [trades]);

  const dayAnalytics = useMemo(() => {
    if (!selectedDate) return null;
    const dayTrades = selectedDate.trades;
    const totalTrades = dayTrades.length;
    const wins = dayTrades.filter(t => parseFloat(t.result) > 0).length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : 0;
    
    const results = dayTrades.map(t => parseFloat(t.result));
    const bestTrade = Math.max(...results);
    const worstTrade = Math.min(...results);
    const totalPnl = results.reduce((a,b) => a + b, 0);
    const avgPnl = (totalPnl / totalTrades).toFixed(2);

    const hourlyMap = new Array(24).fill(0).map((_, i) => ({ name: `${i}:00`, value: 0 }));
    dayTrades.forEach(t => {
      let h = -1;
      if (t.time) h = parseInt(t.time.split(':')[0]);
      else if (t.date) h = new Date(t.date).getHours();
      if (h >= 0 && h < 24) hourlyMap[h].value += parseFloat(t.result);
    });
    const activeHours = hourlyMap.filter(h => h.value !== 0);

    const pieData = [
      { name: 'Wins', value: wins },
      { name: 'Losses', value: totalTrades - wins }
    ];

    return { winRate, bestTrade, worstTrade, avgPnl, activeHours, pieData };
  }, [selectedDate]);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6 px-4 bg-cosmic-card p-4 rounded-xl border border-white/5">
      <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
        <span className="text-cyan-400"><CalendarIcon /></span>
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -32))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white transition border border-white/10"><ChevronLeft /></button>
        <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 text-xs text-gray-400 transition border border-white/10">Today</button>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, 32))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white transition border border-white/10"><ChevronRight /></button>
      </div>
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const cloneDay = day;
        const data = dailyData[formattedDate];
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        let bgClass = "bg-cosmic-card";
        let borderClass = "border-white/5";
        let textClass = "text-gray-400";
        
        if (data) {
           if (data.pnl > 0) {
               bgClass = "bg-green-500/10";
               borderClass = "border-green-500/30";
               textClass = "text-green-400";
           } else if (data.pnl < 0) {
               bgClass = "bg-red-500/10";
               borderClass = "border-red-500/30";
               textClass = "text-red-400";
           }
        }

        days.push(
          <div
            key={day}
            className={`
              relative h-32 border p-2 transition-all cursor-pointer group rounded-xl
              ${!isCurrentMonth ? 'opacity-30 grayscale' : ''}
              ${bgClass} ${borderClass} hover:border-cyan-500/50
            `}
            onClick={() => data ? setSelectedDate({ date: cloneDay, ...data }) : null}
          >
            <span className={`absolute top-2 right-3 text-sm font-bold ${!isCurrentMonth ? 'text-gray-600' : 'text-gray-500'}`}>
              {format(day, 'd')}
            </span>
            {data && (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <span className={`font-mono font-bold text-lg ${textClass}`}>
                  {data.pnl > 0 ? '+' : ''}{data.pnl.toFixed(0)}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">
                  {data.count} {data.count === 1 ? 'trade' : 'trades'}
                </span>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-2" key={day}>{days}</div>);
      days = [];
    }
    return <div className="space-y-2">{renderHeader()}<div className="grid grid-cols-7 mb-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="text-center text-gray-500 text-xs font-bold uppercase py-2">{d}</div>)}</div>{rows}</div>;
  };

  return (
    <div className="animate-fade-in pb-20">
      {renderCells()}

      {selectedDate && dayAnalytics && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedDate(null)}>
            <div className="bg-[#0b0d17] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-blue-900/20" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#161b2e] p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        {format(selectedDate.date, 'EEEE, MMMM do')}
                        <span className={`text-sm px-3 py-1 rounded-full border ${selectedDate.pnl >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {selectedDate.pnl > 0 ? '+' : ''}{selectedDate.pnl.toFixed(2)}
                        </span>
                    </h3>
                    <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <StatBox label="Win Rate" value={`${dayAnalytics.winRate}%`} icon={<PieIcon/>} color="text-cyan-400" />
                        <StatBox label="Best Trade" value={`+${dayAnalytics.bestTrade}`} icon={<ArrowUpCircle/>} color="text-green-400" />
                        <StatBox label="Worst Trade" value={`${dayAnalytics.worstTrade}`} icon={<ArrowDownCircle/>} color="text-red-400" />
                        <StatBox label="Avg PnL" value={`$${dayAnalytics.avgPnl}`} icon={<Activity/>} color="text-white" />
                    </div>
                    {/* Charts & Trade List */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8 h-48">
                         <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Clock size={12}/> Hourly Performance</h4>
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dayAnalytics.activeHours}>
                                        <Tooltip contentStyle={{backgroundColor: '#161b2e', border: '1px solid #333', borderRadius: '8px'}} itemStyle={{color: '#fff'}} cursor={{fill: '#ffffff10'}}/>
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {dayAnalytics.activeHours.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#3b82f6' : '#ef4444'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Award size={12}/> Win vs Loss</h4>
                             <div className="h-32 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dayAnalytics.pieData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                            <Cell fill="#10b981" /><Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#161b2e', border: '1px solid #333', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Trades Breakdown</h4>
                        {selectedDate.trades.map((trade, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${trade.type === 'Buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {trade.type === 'Buy' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg">{trade.pair}</div>
                                        <div className="text-xs text-gray-500">{trade.timeframe} • {trade.setup}</div>
                                    </div>
                                </div>
                                <div className={`font-mono font-bold text-xl ${parseFloat(trade.result) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {parseFloat(trade.result) > 0 ? '+' : ''}{trade.result}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/></svg>;
const StatBox = ({ label, value, icon, color }) => (
    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3">
        <div className={`text-lg ${color} opacity-80`}>{icon}</div>
        <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
            <div className={`font-bold font-mono ${color}`}>{value}</div>
        </div>
    </div>
);

export default CalendarView;