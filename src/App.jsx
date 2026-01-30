import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context (The Brain)
import { TradeProvider } from './context/TradeContext';

// Components (The Shell)
import Layout from './components/Layout';

// Main Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Journal Sub-Pages
import JournalLayout from './pages/journal/JournalLayout';
import AddTradeTab from './pages/journal/AddTradeTab';   // <--- New "Add Trade" Tab
import Accounts from './pages/journal/Accounts';         // <--- "Accounts" Tab
import ViewTrades from './pages/journal/ViewTrades';
import Analytics from './pages/journal/Analytics';

// Placeholder Component (For tabs we are about to build next)
const Placeholder = ({ title }) => (
  <div className="text-center py-20">
    <h2 className="text-2xl font-bold text-gray-500 mb-2">System Loading...</h2>
    <p className="text-purple-400 font-mono">Building Module: {title}</p>
  </div>
);

function App() {
  return (
    // 1. Wrap the entire app in the TradeProvider so data is available everywhere
    <TradeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* --- Public Website Pages --- */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* --- The Trading Journal (New 4-Tab Structure) --- */}
            <Route path="/journal" element={<JournalLayout />}>
              {/* Default: Redirect to "Add Trade" when opening journal */}
              <Route index element={<Navigate to="add" replace />} />
              
              {/* Tab 1: Add Trade (Done) */}
              <Route path="add" element={<AddTradeTab />} />
              
              {/* Tab 2: View Trades (Next Up) */}
              <Route path="view" element={<ViewTrades title="View Trades Tab" />} />
              
              {/* Tab 3: Analytics (Coming Soon) */}
              <Route path="analytics" element={<Analytics title="Analytics Tab" />} />
              
              {/* Tab 4: Accounts (Done) */}
              <Route path="accounts" element={<Accounts />} />
            </Route>

            {/* --- Other Tools --- */}
            <Route path="/analyzer/*" element={<Placeholder title="Market Analyzer" />} />
            <Route path="/risk" element={<Placeholder title="Risk Calculator" />} />
            
          </Routes>
        </Layout>
      </Router>
    </TradeProvider>
  );
}

export default App;