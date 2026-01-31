import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context (The Brain)
import { TradeProvider } from './components/context/TradeContext';

// Components (The Shell)
import Layout from './components/Layout';

// Main Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import RiskCalculator from './pages/RiskCalculator';

// Journal Sub-Pages
import JournalLayout from './pages/journal/JournalLayout';
import AddTradeTab from './pages/journal/AddTradeTab';   // <--- New "Add Trade" Tab
import Accounts from './pages/journal/Accounts';         // <--- "Accounts" Tab
import ViewTrades from './pages/journal/ViewTrades';
import Analytics from './pages/journal/Analytics';

// Analyzer Sub-Pages
import AnalyzerLayout from './pages/analyzer/AnalyzerLayout';
import NewsTab from './pages/analyzer/NewsTab';
import CalendarTab from './pages/analyzer/CalendarTab';
import MarketTab from './pages/analyzer/MarketTab';

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
            <Route path="/analyzer" element={<AnalyzerLayout />}>
              {/* Default: Redirect to "News" when opening analyzer */}
              <Route index element={<Navigate to="news" replace />} />

              {/* Tab 1: News */}
              <Route path="news" element={<NewsTab />} />

              {/* Tab 2: Calendar */}
              <Route path="calendar" element={<CalendarTab />} />

              {/* Tab 3: Market */}
              <Route path="market" element={<MarketTab />} />
            </Route>
            <Route path="/risk" element={<RiskCalculator />} />
            
          </Routes>
        </Layout>
      </Router>
    </TradeProvider>
  );
}

export default App;