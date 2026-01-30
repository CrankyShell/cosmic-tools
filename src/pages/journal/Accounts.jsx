import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { Wallet, Plus, Trash, CheckCircle, Download, Upload } from 'react-bootstrap-icons';

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

  // Handle creating a new account
  const handleCreate = (e) => {
    e.preventDefault();
    if (newName && newBalance) {
      createAccount(newName, newBalance);
      setNewName('');
      setNewBalance('');
    }
  };

  // Handle Exporting Data (Backup)
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cosmic_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Handle Importing Data
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        importData(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12">
      
      {/* SECTION 1: Account List */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wallet /> Your Portfolios
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
            {accounts.map(account => (
                <div 
                    key={account.id}
                    onClick={() => setActiveAccountId(account.id)}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 group
                    ${activeAccount.id === account.id 
                        ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-900/20' 
                        : 'bg-cosmic-card border-white/5 hover:border-white/20'}`}
                >
                    {/* Active Badge */}
                    {activeAccount.id === account.id && (
                        <div className="absolute top-4 right-4 text-purple-400">
                            <CheckCircle size={20}/>
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-1">{account.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">Balance: <span className="text-green-400 font-mono">${account.size}</span></p>
                    
                    <div className="text-xs text-gray-500 flex justify-between items-end">
                        <span>{account.trades.length} Trades logged</span>
                        
                        {/* Delete Button (Only shows if not active and not the only account) */}
                        {activeAccount.id !== account.id && accounts.length > 1 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Stop click from switching account
                                    if(confirm(`Are you sure you want to delete ${account.name}?`)) deleteAccount(account.id);
                                }}
                                className="text-red-900 group-hover:text-red-500 transition"
                            >
                                <Trash size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* "Add New" Card (Visual only, form is below) */}
            <div className="border border-dashed border-white/10 rounded-xl flex items-center justify-center p-6 text-gray-500">
                <span className="text-sm">Use the form below to add more</span>
            </div>
        </div>
      </section>

      <hr className="border-white/5" />

      {/* SECTION 2: Actions (Create & Backup) */}
      <div className="grid md:grid-cols-2 gap-12">
          
          {/* Create New Form */}
          <div className="bg-cosmic-card p-8 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Create New Portfolio</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Portfolio Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My Funded Challenge" 
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Starting Balance ($)</label>
                      <input 
                        type="number" 
                        placeholder="10000" 
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                        required
                      />
                  </div>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2">
                      <Plus size={20}/> Create Portfolio
                  </button>
              </form>
          </div>

          {/* Backup Zone */}
          <div className="bg-cosmic-card p-8 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Data Management</h3>
              <p className="text-sm text-gray-400 mb-6">
                  Your data is stored in your browser. We recommend exporting a backup file weekly to keep your trading history safe.
              </p>
              
              <div className="flex gap-4">
                  <button 
                    onClick={handleExport}
                    className="flex-1 bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white py-3 rounded transition flex justify-center items-center gap-2"
                  >
                      <Download /> Export Data
                  </button>
                  
                  <label className="flex-1 bg-purple-600/20 border border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white py-3 rounded transition flex justify-center items-center gap-2 cursor-pointer">
                      <Upload /> Import Data
                      <input type="file" onChange={handleImport} accept=".json" className="hidden" />
                  </label>
              </div>
          </div>

      </div>
    </div>
  );
};

export default Accounts;