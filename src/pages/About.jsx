import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Instagram, Twitter, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

// --- Components for this page ---

const TeamMember = ({ name, role, motto, image, socials }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-cosmic-card p-6 rounded-xl border border-white/5 text-center hover:border-purple-500/50 transition-all duration-300"
  >
    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-1 mb-4">
      {/* Placeholder for profile pic - using a generic avatar for now */}
      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
         <span className="text-4xl font-bold text-white/20">{name.charAt(0)}</span>
      </div>
    </div>
    <h3 className="text-xl font-bold text-white">{name}</h3>
    <p className="text-purple-400 text-sm mb-4 font-mono">{role}</p>
    <blockquote className="text-gray-400 italic text-sm mb-6">"{motto}"</blockquote>
    <div className="flex justify-center gap-4 text-gray-500">
        {/* Social Placeholders */}
        <Github className="hover:text-white cursor-pointer transition"/>
        <Instagram className="hover:text-white cursor-pointer transition"/>
        <Twitter className="hover:text-white cursor-pointer transition"/>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex justify-between items-center hover:text-purple-400 transition group"
      >
        <span className="font-medium text-lg text-gray-200 group-hover:text-purple-400 transition">{question}</span>
        {/* Rotate the arrow based on state */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="text-gray-500"/>
        </motion.div>
      </button>

      {/* The Smooth Accordion Logic */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-gray-400 text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page Component ---

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-20">
      
      {/* 1. Mission Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Our Mission
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed">
          Trading is a lonely journey, but it doesn't have to be a blind one. 
          <span className="text-purple-400 font-bold"> Cosmic Tools</span> was born from 3 years of navigating the chaotic Forex markets. 
          We realized that the difference between gambling and trading is <b>data, discipline, and clarity</b>.
          Our goal is to provide privacy-focused, professional-grade tools to help you find your edge in the noise of the market.
        </p>
      </section>

      {/* 2. The Team Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-white">The Developers</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <TeamMember 
                name="Gherman Paul"
                role="Founder & Website Developer"
                motto="Code the logic, trade the probability."
            />
            <TeamMember 
                name="Oprea Mihail"
                role="Co-Founder & App Developer"
                motto="Simplicity is the ultimate sophistication."
            />
        </div>
      </section>

      {/* 3. FAQ Section */}
      <section className="bg-cosmic-card/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-2">
            <FAQItem question="Is Cosmic Tools really free?" answer="Yes. We are traders ourselves, and we believe essential tools shouldn't be behind a paywall." />
            <FAQItem question="Is my data safe?" answer="Absolutely. We use LocalStorage technology. Your trade data never leaves your browser and is never sent to our servers." />
            <FAQItem question="Do I need an account to use it?" answer="No. Just open the website and start trading. However, creating a 'local profile' helps you organize multiple portfolios." />
            <FAQItem question="What markets can I track?" answer="Our tools are optimized for Forex, but they work perfectly for Crypto, Indices, and Stocks as well." />
            <FAQItem question="Will there be a mobile app?" answer="Yes! Our Co-Founder Mihail is currently building the iOS and Android native apps." />
            <FAQItem question="How do I backup my data?" answer="In the 'Accounts' tab of the Journal, you can export a JSON file. Keep this file safe; it is your only backup." />
            <FAQItem question="Can I request a feature?" answer="We love community feedback! Join our Discord or use the Contact form to send us your ideas." />
            <FAQItem question="Why the space theme?" answer="The market is a vast, cold void. We provide the spaceship to navigate it safely." />
            <FAQItem question="Do you offer signals?" answer="No. We provide tools for analysis, not financial advice. Your trades are your responsibility." />
            <FAQItem question="How often is the news updated?" answer="Our widgets pull real-time data from major financial providers like FinancialJuice and TradingView." />
        </div>
      </section>

    </div>
  );
};

export default About;