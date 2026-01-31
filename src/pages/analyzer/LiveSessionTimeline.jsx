import React, { useState, useEffect, useMemo } from 'react';

// Forex sessions defined in UTC (Start hour, End hour)
const SESSIONS_UTC = [
  { name: 'Sydney', start: 21, end: 6, color: 'bg-purple-500/80', borderColor: 'border-purple-400' },
  { name: 'Tokyo', start: 0, end: 9, color: 'bg-red-500/80', borderColor: 'border-red-400' },
  { name: 'London', start: 8, end: 17, color: 'bg-blue-500/80', borderColor: 'border-blue-400' },
  { name: 'New York', start: 13, end: 22, color: 'bg-green-500/80', borderColor: 'border-green-400' },
];

const AVAILABLE_ZONES = [
  { city: 'Local Time', value: 'local' },
  { city: 'UTC', value: 'UTC' },
  { city: 'New York', value: 'America/New_York' },
  { city: 'London', value: 'Europe/London' },
  { city: 'Berlin', value: 'Europe/Berlin' },
  { city: 'Dubai', value: 'Asia/Dubai' },
  { city: 'Tokyo', value: 'Asia/Tokyo' },
  { city: 'Sydney', value: 'Australia/Sydney' },
];

const LiveSessionTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState('local');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getZoneOffset = (zoneValue) => {
    if (zoneValue === 'local') {
      return -new Date().getTimezoneOffset() / 60;
    }
    try {
      const now = new Date();
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: zoneValue }));
      const diff = tzDate.getTime() - utcDate.getTime();
      return diff / 3600000;
    } catch (e) {
      return 0;
    }
  };

  const currentOffset = useMemo(() => getZoneOffset(selectedZone), [selectedZone, currentTime]);

  const getFormattedLabel = (zone) => {
    if (zone.value === 'local') return `UTC${currentOffset >= 0 ? '+' : ''}${currentOffset} (Local)`;
    if (zone.value === 'UTC') return 'UTC+0';
    
    const offset = getZoneOffset(zone.value);
    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset} (${zone.city})`;
  };

  const getZoneTimeParts = () => {
    if (selectedZone === 'local') {
      return { hours: currentTime.getHours(), minutes: currentTime.getMinutes() };
    }
    const tzDate = new Date(currentTime.toLocaleString('en-US', { timeZone: selectedZone }));
    return { hours: tzDate.getHours(), minutes: tzDate.getMinutes() };
  };

  const { hours: zoneHour, minutes: zoneMinutes } = getZoneTimeParts();
  const currentPosition = ((zoneHour + zoneMinutes / 60) / 24) * 100;

  const renderSessionBar = (session) => {
    let start = (session.start + currentOffset) % 24;
    let end = (session.end + currentOffset) % 24;

    if (start < 0) start += 24;
    if (end < 0) end += 24;

    const isActive = isSessionActiveInZone(start, end, zoneHour);
    const crossesMidnight = start > end;

    // Inner label for the bar
    const BarLabel = () => (
      <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
        <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md whitespace-nowrap">
          {session.name}
        </span>
      </div>
    );

    if (crossesMidnight) {
      const firstPartWidth = ((24 - start) / 24) * 100;
      const secondPartWidth = (end / 24) * 100;
      
      return (
        <React.Fragment key={session.name}>
          <div 
            className={`absolute top-6 h-8 border-l-2 ${session.borderColor} ${session.color} rounded-sm transition-all duration-500 ${isActive ? 'opacity-100 ring-1 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'opacity-40 grayscale-[20%]'}`} 
            style={{ left: `${(start / 24) * 100}%`, width: `${firstPartWidth}%` }} 
          >
            {firstPartWidth > 5 && <BarLabel />}
          </div>
          <div 
            className={`absolute top-6 h-8 border-r-2 ${session.borderColor} ${session.color} rounded-sm transition-all duration-500 ${isActive ? 'opacity-100 ring-1 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'opacity-40 grayscale-[20%]'}`} 
            style={{ left: '0%', width: `${secondPartWidth}%` }} 
          >
             {secondPartWidth > 5 && <BarLabel />}
          </div>
        </React.Fragment>
      );
    } else {
      const width = ((end - start) / 24) * 100;
      return (
        <div
          key={session.name}
          className={`absolute top-6 h-8 border-x-2 ${session.borderColor} ${session.color} rounded-sm transition-all duration-500 ${isActive ? 'opacity-100 ring-1 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'opacity-40 grayscale-[20%]'}`}
          style={{ left: `${(start / 24) * 100}%`, width: `${width}%` }}
        >
           {width > 5 && <BarLabel />}
        </div>
      );
    }
  };

  const isSessionActiveInZone = (start, end, currentH) => {
    if (start > end) {
      return currentH >= start || currentH < end;
    }
    return currentH >= start && currentH < end;
  };

  const currentZoneObj = AVAILABLE_ZONES.find(z => z.value === selectedZone);
  const displayLabel = currentZoneObj ? getFormattedLabel(currentZoneObj) : 'UTC';

  return (
    <div className="mb-8 select-none bg-[#0B0D17]/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative group/timeline z-40 shadow-2xl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
             <svg className="w-5 h-5 text-cosmic-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div>
             <h3 className="text-white font-bold text-base tracking-wide">Market Sessions</h3>
             <p className="text-xs text-gray-400">Live trading hours map</p>
           </div>
        </div>

        <div className="relative z-[100]">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 px-4 py-2 rounded-xl border border-white/10 transition-colors min-w-[160px] justify-between shadow-lg"
          >
            <span>{displayLabel}</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="fixed inset-0 z-[90] cursor-default" onClick={() => setShowDropdown(false)} />
          )}

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#151925] border border-white/10 rounded-xl shadow-2xl z-[100] py-2 overflow-hidden ring-1 ring-black/50">
              {AVAILABLE_ZONES.map((zone) => (
                <button
                  key={zone.value}
                  onClick={() => {
                    setSelectedZone(zone.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${selectedZone === zone.value ? 'text-cosmic-accent bg-white/5 font-bold' : 'text-gray-400'}`}
                >
                  {getFormattedLabel(zone)}
                  {selectedZone === zone.value && <div className="w-1.5 h-1.5 rounded-full bg-cosmic-accent shadow-[0_0_8px_rgba(var(--cosmic-accent-rgb),0.8)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative w-full h-20 bg-[#08090F] border border-white/10 rounded-xl mb-4 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] z-0">
        
        {/* Background Grid & Numbers */}
        <div className="absolute inset-0 flex">
           {[...Array(24)].map((_, i) => (
             <div key={i} className="flex-1 border-r border-white/5 h-full relative group/hour">
                {/* Hour Number */}
                <span className={`absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono font-medium ${i % 2 === 0 ? 'text-gray-400' : 'text-gray-700 opacity-50'} group-hover/hour:text-white transition-colors`}>
                  {i}
                </span>
                {/* Tick mark at bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-white/20"></div>
             </div>
           ))}
        </div>

        {/* Sessions */}
        {SESSIONS_UTC.map((session) => renderSessionBar(session))}

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cosmic-accent z-20 shadow-[0_0_12px_rgba(var(--cosmic-accent-rgb),0.8)]"
          style={{ left: `${currentPosition}%` }}
        >
          {/* "NOW" Badge */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-cosmic-accent text-[#0B0D17] text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-lg leading-none tracking-tighter z-30 transform -translate-y-full mb-1">
            NOW
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-cosmic-accent"></div>
          </div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
          
          {/* Hover Time Tooltip */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 px-1.5 py-0.5 rounded opacity-0 group-hover/timeline:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                {String(zoneHour).padStart(2,'0')}:{String(zoneMinutes).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs px-2 relative z-0">
         <div className="text-gray-500 font-medium">
            Status: <span className="text-gray-300">
               {SESSIONS_UTC.filter(s => {
                  const shift = currentOffset;
                  let st = (s.start + shift) % 24; if(st<0) st+=24;
                  let en = (s.end + shift) % 24; if(en<0) en+=24;
                  return isSessionActiveInZone(st, en, zoneHour);
               }).map(s => s.name).join(' & ') || 'Closed'}
            </span>
         </div>
        
        <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cosmic-accent animate-pulse"></span>
              <span className="font-mono font-bold text-white text-sm">
                {String(zoneHour).padStart(2,'0')}:{String(zoneMinutes).padStart(2,'0')}
              </span>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionTimeline;