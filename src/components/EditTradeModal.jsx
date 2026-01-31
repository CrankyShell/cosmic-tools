import React, { useState, useEffect } from 'react';
import { useTradeContext } from './context/TradeContext';
import { X, Save } from 'react-bootstrap-icons';

const EditTradeModal = ({ trade, onClose }) => {
  const { activeAccount, editTrade } = useTradeContext();
  
  // Local state for the form, initialized with the trade data
  const [formData, setFormData] = useState({
    type: '',
    pair: '',
    timeframe: '',
    setup: '', // 'setup' matches the key we used in Analytics
    exit: '',
    result: '',
    date: '',
    comment: ''
  });

  useEffect(() => {
    if (trade) {
      setFormData({
        type: trade.type || 'Buy',
        pair: trade.pair || '',
        timeframe: trade.timeframe || '',
        setup: trade.setup || '',
        exit: trade.exit || '',
        result: trade.result || '',
        date: trade.date || '',
        comment: trade.comment || ''
      });
    }
  }, [trade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pair || !formData.result) return alert("Pair and Result are required!");

    // Call the context function
    editTrade(trade.id, formData);
    onClose();
  };

  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-cosmic-card border border-blue-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-900/50">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-cosmic-card z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">Edit</span> Trade
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Row 1: Type, Pair, Timeframe */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Symbol</label>
              <input 
                list="savedSymbols" 
                name="pair" 
                value={formData.pair} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="EUR/USD"
              />
              <datalist id="savedSymbols">
                {activeAccount.savedSymbols.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Timeframe</label>
              <input 
                list="savedTimeframes" 
                name="timeframe" 
                value={formData.timeframe} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="15m"
              />
              <datalist id="savedTimeframes">
                {activeAccount.savedTimeframes.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          {/* Row 2: Strategy, Exit, Date */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Entry Strategy</label>
              <input 
                list="savedEntryStrategies" 
                name="setup" 
                value={formData.setup} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="Candle Close"
              />
              <datalist id="savedEntryStrategies">
                {activeAccount.savedEntryStrategies.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="space-y-2">
               <label className="text-xs text-gray-400 uppercase tracking-wider">Exit Reason</label>
               <input 
                list="savedExitStrategies" 
                name="exit" 
                value={formData.exit} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="TP"
              />
              <datalist id="savedExitStrategies">
                {activeAccount.savedExitStrategies.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Date</label>
              <input 
                type="date"
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 3: Result & Comment */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">PnL ($)</label>
              <input 
                type="number"
                name="result" 
                value={formData.result} 
                onChange={handleChange} 
                className={`w-full bg-[#0b0d17] border rounded-lg p-3 font-mono font-bold outline-none
                  ${parseFloat(formData.result) > 0 ? 'text-green-400 border-green-500/30' : 
                    parseFloat(formData.result) < 0 ? 'text-red-400 border-red-500/30' : 'text-white border-white/10'}`}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Comment</label>
              <input 
                type="text"
                name="comment" 
                value={formData.comment} 
                onChange={handleChange} 
                className="w-full bg-[#0b0d17] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                placeholder="Notes about this trade..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex justify-end gap-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/20"
            >
              <Save /> Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditTradeModal;