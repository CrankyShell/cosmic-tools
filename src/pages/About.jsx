import React from 'react';
import { motion } from 'framer-motion';
import { Github, Instagram, Twitter } from 'react-bootstrap-icons';

const TeamMember = ({ name, role, motto, socials }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-cosmic-card p-6 rounded-xl border border-white/5 text-center hover:border-cyan-500/50 transition-all duration-300"
  >
    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 mb-4">
      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
         <span className="text-4xl font-bold text-white/20">{name.charAt(0)}</span>
      </div>
    </div>
    <h3 className="text-xl font-bold text-white">{name}</h3>
    <p className="text-cyan-400 text-sm mb-4 font-mono">{role}</p>
    <blockquote className="text-gray-400 italic text-sm mb-6">"{motto}"</blockquote>
    <div className="flex justify-center gap-4 text-gray-500">
        {socials.github && <Github className="hover:text-white cursor-pointer"/>}
        {socials.twitter && <Twitter className="hover:text-white cursor-pointer"/>}
        {socials.instagram && <Instagram className="hover:text-white cursor-pointer"/>}
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => (
    <div className="bg-white/5 rounded-lg p-6 border border-white/5">
        <h3 className="font-bold text-lg text-white mb-2">{question}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
    </div>
);

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-20">
      
      {/* Intro */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">About <span className="text-cyan-400">Cosmic</span></h1>
        <p className="text-xl text-gray-400">
            Built by traders, for traders. We believe that journaling shouldn't be a chore—it should be a powerful routine that improves your edge.
        </p>
      </section>

      {/* Team */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet the Pilots</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <TeamMember 
                name="PaulFX" 
                role="Lead Developer & Trader" 
                motto="Risk comes from not knowing what you're doing."
                socials={{ github: true, twitter: true }}
            />
            <TeamMember 
                name="Mihail" 
                role="Mobile Architect" 
                motto="Consistency is the only holy grail."
                socials={{ instagram: true, twitter: true }}
            />
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequent Questions</h2>
        <div className="grid gap-4">
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