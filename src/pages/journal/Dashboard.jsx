import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Briefcase, Target, Zap } from 'lucide-react';
import CryptoTicker from '../components/CryptoTicker';

const weeklyData = [
  { day: 'Mon', profit: 1200 },
  { day: 'Tue', profit: 900 },
  { day: 'Wed', profit: -400 },
  { day: 'Thu', profit: 1500 },
  { day: 'Fri', profit: 2100 },
  { day: 'Sat', profit: 800 },
  { day: 'Sun', profit: 1100 },
];

const StatCard = ({ title, value, icon: Icon, subtext }) => (
  <div className="cosmic-card hover:border-cosmic-accent/50 transition-colors duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold font-mono">{value}</h3>
      </div>
      <div className="p-2 bg-cosmic-accent/10 rounded-lg">
        <Icon className="w-5 h-5 text-cosmic-accent" />
      </div>
    </div>
    <p className="text-xs text-trade-win flex items-center">
      <Zap className="w-3 h-3 mr-1" />
      {subtext}
    </p>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Command Center</h1>
          <p className="text-gray-400">Welcome back, Commander. Markets are volatile today.</p>
        </div>
        <button className="cosmic-button mt-4 md:mt-0">
          New Trade Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Portfolio" 
          value="$124,592.00" 
          icon={DollarSign} 
          subtext="+12.5% this month"
        />
        <StatCard 
          title="Win Rate" 
          value="68.4%" 
          icon={Target} 
          subtext="+2.1% vs last week"
        />
        <StatCard 
          title="Active Positions" 
          value="5" 
          icon={Briefcase} 
          subtext="2 Long, 3 Short"
        />
        <StatCard 
          title="Daily P&L" 
          value="+$1,240.50" 
          icon={Activity} 
          subtext="Target reached"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 cosmic-card">
          <h2 className="text-xl font-bold mb-6">Weekly Performance</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#161b2e', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#e0e1dd'
                  }}
                />
                {/* UPDATED: fill color changed from #7b2cbf to #3b82f6 
                  This corresponds to the new cosmic-accent color
                */}
                <Bar 
                  dataKey="profit" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <CryptoTicker />
        </div>
      </div>
    </div>
  );
};

// Simple import helper for the StatCard
import { Activity } from 'lucide-react';

export default Dashboard;