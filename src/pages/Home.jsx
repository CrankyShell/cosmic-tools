import React from 'react';
import { Link } from 'react-router-dom';
import { JournalRichtext, Activity, Calculator } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';

const ToolCard = ({ title, desc, icon, link, image }) => (
  <motion.div 
    whileHover={{ scale: 1.03 }}
    className="bg-cosmic-card border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex flex-col"
  >
    <div className="h-40 bg-gray-900 relative">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition"/>
        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-cyan-400">
            {icon}
        </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow">{desc}</p>
      <Link 
        to={link}
        className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-center rounded-lg hover:brightness-110 transition shadow-lg"
      >
        Launch Tool
      </Link>
    </div>
  </motion.div>
);

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-20">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 pb-2">
            Command Your Capital
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Professional trading tools for the modern chartist. <br/>
            <span className="text-cyan-400 font-mono">No Servers. No Fees. 100% Private.</span>
        </p>
        
        <div className="flex justify-center gap-4">
            <Link to="/about" className="px-8 py-3 rounded-full border border-blue-500 text-cyan-400 hover:bg-blue-500/10 transition">
                About The Project
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition">
                Contact Us
            </Link>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <ToolCard 
          title="Trading Journal" 
          desc="Log trades, track performance, and visualize your equity curve with advanced analytics. 100% Local Storage."
          icon={<JournalRichtext size={24}/>}
          link="/journal"
          image="/journal.png"
        />
        <ToolCard 
          title="Market Analyzer" 
          desc="Real-time news timelines, economic calendars, and advanced charting widgets to keep you ahead of the move."
          icon={<Activity size={24}/>}
          link="/analyzer"
          image="/analyzer.png"
        />
        <ToolCard 
          title="Risk Calculator" 
          desc="Calculate position sizes, stop losses, and visualize risk/reward ratios instantly."
          icon={<Calculator size={24}/>}
          link="/risk"
          image="/riskcalc.png"
        />
      </section>
    </div>
  );
};

export default Home;