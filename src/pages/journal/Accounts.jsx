import React, { useState } from 'react';
import { useTradeContext } from '../../components/context/TradeContext';
import { Wallet, Plus, Trash, CheckCircle, Download, Upload, FileEarmarkSpreadsheet, FiletypeJson } from 'react-bootstrap-icons';

const Accounts = () => {
  const { 
    accounts, 
    activeAccount, 
    setActiveAccountId, 
    createAccount, 
    deleteAccount,
    importData 
  } = useTradeContext();

  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');

  // --- HELPER: CSV PARSER (MT4/MT5/FTMO Standard Format) ---
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Helper to split CSV line handling quotes
    const splitCSVLine = (line) => {
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(m => m.replace(/"/g, '')) : [];
    };

    // Skip header and process data
    const trades = lines.slice(1).map((line, index) => {
      const cols = splitCSVLine(line);
      if (cols.length < 10) return null; // Skip malformed lines

      // 1. Calculate Financials
      const profit = parseFloat(cols[12] || 0);
      const commission = parseFloat(cols[11] || 0);
      const swap = parseFloat(cols[10] || 0);
      const result = profit + commission + swap;

      // 2. Parse Date (Critical for Analytics)
      // FTMO/MT4 Format: "2026-01-30 12:24:01" -> Needs "2026-01-30T12:24:01" for safe parsing
      const rawOpenTime = cols[1]; 
      let dateObj = new Date(rawOpenTime);
      
      // Fallback if direct parsing fails (replace space with T for ISO standard)
      if (isNaN(dateObj.getTime())) {
          dateObj = new Date(rawOpenTime.replace(' ', 'T'));
      }
      
      // If still invalid, fallback to now (prevents crash)
      if (isNaN(dateObj.getTime())) dateObj = new Date();

      const isoDate = dateObj.toISOString();

      return {
        id: cols[0] || Date.now() + index, // Ticket or Index
        date: isoDate,        // REQUIRED by Analytics/RiskCalc
        timestamp: dateObj.getTime(), // Numeric timestamp
        openTime: rawOpenTime,
        type: cols[2].toLowerCase(), // 'buy' or 'sell'
        size: parseFloat(cols[3]),
        pair: cols[4],
        entryPrice: parseFloat(cols[5]),
        sl: parseFloat(cols[6]),
        tp: parseFloat(cols[7]),
        closeTime: cols[8],
        exitPrice: parseFloat(cols[9]),
        swap: swap,
        commission: commission,
        profit: profit, // Gross
        result: result, // Net PnL
        pips: parseFloat(cols[13]),
        status: 'Closed',
        notes: 'Imported via CSV'
      };
    }).filter(t => t !== null);

    return trades;
  };

  // --- MAIN IMPORT HANDLER ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target.result;
      let newAccounts = [];

      try {
        // STRATEGY 1: JSON IMPORT
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            newAccounts = parsed;
          } else if (parsed.trades || parsed.id) {
            newAccounts = [parsed];
          }
        } 
        // STRATEGY 2: CSV IMPORT
        else if (file.name.endsWith('.csv')) {
          const trades = parseCSV(content);
          
          if (trades.length === 0) {
             alert("No valid trades found in CSV.");
             return;
          }

          // Calculate approximate starting balance from history (optional logic)
          // For now, we default to 100k or user can edit later
          const csvAccount = {
            id: Date.now().toString(),
            name: `Imported FTMO (${new Date().toLocaleDateString()})`,
            size: 100000, 
            trades: trades,
            withdrawals: [],
            deposits: []
          };
          newAccounts = [csvAccount];
        }

        if (newAccounts.length > 0) {
          // Merge and Save
          const mergedAccounts = [...accounts, ...newAccounts];
          importData(JSON.stringify(mergedAccounts));
          alert(`Successfully imported ${newAccounts.length} portfolio(s)!`);
        }

      } catch (err) {
        console.error("Import Failed:", err);
        alert("Failed to import file. Please check the format.");
      }
    };

    if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      alert("Unsupported file type. Please use JSON or CSV.");
    }
    
    e.target.value = '';
  };

  // Handle Creating a new account
  const handleCreate = (e) => {
    e.preventDefault();
    if (newName && newBalance) {
      createAccount(newName, newBalance);
      setNewName('');
      setNewBalance('');
    }
  };

  // Handle Exporting Data
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cosmic_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* SECTION 1: Account List */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Wallet className="text-blue-400"/> Your Portfolios
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
            {accounts.map(account => (
                <div 
                    key={account.id}
                    onClick={() => setActiveAccountId(account.id)}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 group
                    ${activeAccount.id === account.id 
                        ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20' 
                        : 'bg-cosmic-card border-white/5 hover:border-white/20'}`}
                >
                    {activeAccount.id === account.id && (
                        <div className="absolute top-4 right-4 text-blue-400">
                            <CheckCircle size={20}/>
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-1 truncate pr-8">{account.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">Balance: <span className="text-green-400 font-mono">${parseFloat(account.size).toLocaleString()}</span></p>
                    
                    <div className="text-xs text-gray-500 flex justify-between items-end">
                        <span className="flex items-center gap-1">
                          {account.trades?.length || 0} Trades logged
                        </span>
                        
                        {activeAccount.id !== account.id && accounts.length > 1 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    if(confirm(`Are you sure you want to delete ${account.name}?`)) deleteAccount(account.id);
                                }}
                                className="text-red-900 group-hover:text-red-500 transition p-1 rounded hover:bg-white/5"
                                title="Delete Portfolio"
                            >
                                <Trash size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <div className="border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-gray-600 gap-2 min-h-[140px]">
                <Plus size={32} className="opacity-50"/>
                <span className="text-sm">Create or Import below</span>
            </div>
        </div>
      </section>

      <hr className="border-white/5" />

      {/* SECTION 2: Actions */}
      <div className="grid md:grid-cols-2 gap-12">
          
          <div className="bg-cosmic-card p-8 rounded-xl border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="text-blue-400"/> Create New Portfolio
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Portfolio Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My Funded Challenge" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Starting Balance ($)</label>
                      <input 
                        type="number" 
                        placeholder="10000" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                        required
                      />
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20">
                      <Plus size={20}/> Create Portfolio
                  </button>
              </form>
          </div>

          <div className="bg-cosmic-card p-8 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="text-green-400"/> Data Management
                </h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Your data is stored locally. Export backups regularly to prevent data loss. 
                    You can import <strong>JSON backups</strong> or <strong>CSV files</strong> (MT4/MT5/FTMO format).
                </p>
              </div>
              
              <div className="flex gap-4">
                  <button 
                    onClick={handleExport}
                    className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white py-3 rounded-lg transition flex justify-center items-center gap-2 group"
                  >
                      <FiletypeJson className="group-hover:scale-110 transition"/> Export JSON
                  </button>
                  
                  <label className="flex-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white py-3 rounded-lg transition flex justify-center items-center gap-2 cursor-pointer group">
                      <Upload className="group-hover:scale-110 transition"/> Import File
                      <input 
                        type="file" 
                        onChange={handleImport} 
                        accept=".json,.csv" 
                        className="hidden" 
                      />
                  </label>
              </div>
              <div className="text-center mt-3">
                 <span className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                    Supported: <FiletypeJson/> JSON Backup & <FileEarmarkSpreadsheet/> MT4/MT5 CSV
                 </span>
              </div>
          </div>

      </div>
    </div>
  );
};

export default Accounts;