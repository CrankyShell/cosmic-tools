import React, { createContext, useState, useEffect, useContext } from 'react';

const TradeContext = createContext();

// Default Data Structure (Matches your working file)
const defaultAccount = {
  id: 'default',
  name: 'Main Account',
  size: 10000,
  currency: 'USD',
  trades: [],
  withdrawals: [],
  // Memory Lists
  savedSymbols: ['XAU/USD', 'EUR/USD', 'USD/JPY', 'GBP/USD', 'BTC/USD'],
  savedTimeframes: ['1m', '5m', '15m', '1h', '4h', 'D'],
  savedEntryStrategies: ['Candle Close', 'Flip', 'Candle Break'],
  savedExitStrategies: ['TP', 'SL', 'BE', 'Decision']
};

export const TradeProvider = ({ children }) => {
  // 1. Load Accounts (Handle potential bad data)
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('cosmic_data');
      return saved ? JSON.parse(saved) : [defaultAccount];
    } catch (e) {
      return [defaultAccount];
    }
  });

  // 2. Load Active ID (Treat as STRING to avoid crashes)
  const [activeAccountId, setActiveAccountId] = useState(() => {
    return localStorage.getItem('cosmic_active_id') || 'default';
  });

  // 3. Persist Data
  useEffect(() => {
    localStorage.setItem('cosmic_data', JSON.stringify(accounts));
    localStorage.setItem('cosmic_active_id', activeAccountId);
  }, [accounts, activeAccountId]);

  // 4. Safe Active Account Retrieval
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  // --- ACTIONS ---

  const createAccount = (name, size) => {
    const newAccount = {
      ...defaultAccount,
      id: Date.now().toString(), // String ID
      name,
      size: parseFloat(size),
      trades: [],
      withdrawals: []
    };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
  };

  const deleteAccount = (id) => {
    if (accounts.length === 1) return alert("Cannot delete the last account!");
    const newList = accounts.filter(a => a.id !== id);
    setAccounts(newList);
    if (activeAccountId === id) setActiveAccountId(newList[0].id);
  };

  const addTrade = (trade) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === activeAccountId) {
        // Update Memory
        const newSymbols = Array.from(new Set([...acc.savedSymbols, trade.pair]));
        const newTimeframes = Array.from(new Set([...acc.savedTimeframes, trade.timeframe]));
        const newStrategies = Array.from(new Set([...acc.savedEntryStrategies, trade.setup]));

        return {
          ...acc,
          size: acc.size + parseFloat(trade.result),
          trades: [...acc.trades, trade],
          savedSymbols: newSymbols,
          savedTimeframes: newTimeframes,
          savedEntryStrategies: newStrategies
        };
      }
      return acc;
    }));
  };

  const deleteTrade = (tradeId) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === activeAccountId) {
        const trade = acc.trades.find(t => t.id === tradeId);
        if (!trade) return acc;
        return {
          ...acc,
          size: acc.size - parseFloat(trade.result),
          trades: acc.trades.filter(t => t.id !== tradeId)
        };
      }
      return acc;
    }));
  };

  const editTrade = (tradeId, updatedData) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === activeAccountId) {
        const oldTrade = acc.trades.find(t => t.id === tradeId);
        if (!oldTrade) return acc;

        // Revert old result, add new result
        const newSize = (acc.size - parseFloat(oldTrade.result)) + parseFloat(updatedData.result);
        
        const newTrades = acc.trades.map(t => 
            t.id === tradeId ? { ...t, ...updatedData } : t
        );

        return { ...acc, size: newSize, trades: newTrades };
      }
      return acc;
    }));
  };

  const addWithdrawal = (amount, date, comment) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === activeAccountId) {
        return {
          ...acc,
          size: acc.size - parseFloat(amount),
          withdrawals: [...acc.withdrawals, { id: Date.now(), amount, date, comment }]
        };
      }
      return acc;
    }));
  };

  const importData = (jsonData) => {
    try {
        const parsed = JSON.parse(jsonData);
        if (Array.isArray(parsed) && parsed[0].id) {
            setAccounts(parsed);
            alert("Data imported successfully!");
        } else {
            alert("Invalid file format.");
        }
    } catch (e) {
        alert("Error reading file.");
    }
  };

  return (
    <TradeContext.Provider value={{
      activeAccount,
      accounts,
      setActiveAccountId,
      createAccount,
      deleteAccount,
      addTrade,
      deleteTrade,
      editTrade,
      addWithdrawal,
      importData
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTradeContext = () => useContext(TradeContext);