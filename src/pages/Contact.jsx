import React from 'react';
import { Discord, Envelope, Youtube } from 'react-bootstrap-icons'; // Added Youtube Icon

const Contact = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">Get In Touch</h1>

      <div className="grid md:grid-cols-2 gap-12">
        
        {/* Left Side: Contact Forms */}
        <div className="space-y-12">
            
            {/* Website Team Form */}
            <div className="bg-cosmic-card p-8 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-900/10">
                <div className="flex items-center gap-3 mb-6">
                    <Envelope className="text-cyan-400 text-xl"/>
                    <h2 className="text-2xl font-bold text-white">Website Team</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">For bugs, suggestions, or inquiries about the web platform.</p>
                <form className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyan-400 outline-none transition"/>
                    <input type="email" placeholder="Your Email" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyan-400 outline-none transition"/>
                    <textarea rows="4" placeholder="Message" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyan-400 outline-none transition"></textarea>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded hover:opacity-90 transition">
                        Send Message
                    </button>
                </form>
            </div>

            {/* Direct Contact Info */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Other Ways to Connect</h3>
                <div className="p-6 rounded-xl bg-white/5 border border-dashed border-white/10">
                    <p className="text-gray-500 italic">Direct contact not available yet.</p>
                    <p className="text-gray-500 text-sm">Please use the Discord server.</p>
                </div>
            </div>

        </div>

        {/* Right Side: Discord & YouTube & Info */}
        <div className="flex flex-col justify-center space-y-8">
            
            {/* Discord Card */}
            <div className="bg-[#5865F2] p-10 rounded-2xl text-center transform hover:scale-105 transition duration-300 cursor-pointer shadow-xl shadow-blue-900/20">
                <Discord size={60} className="mx-auto mb-4 text-white"/>
                <h2 className="text-3xl font-bold text-white mb-2">Join the Community</h2>
                <p className="text-white/80 mb-6">Chat with over 500+ traders, get live updates, and share your setups.</p>
                <a 
                    href="https://discord.gg/Q5GQk6Gb6X" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-white text-[#5865F2] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
                >
                    Join Discord Server
                </a>
            </div>

            {/* NEW: YouTube Card */}
            {/* Updated bg and text color to #ea3333 */}
            <div className="bg-[#ea3333] p-10 rounded-2xl text-center transform hover:scale-105 transition duration-300 cursor-pointer shadow-xl shadow-red-900/20">
                <Youtube size={60} className="mx-auto mb-4 text-white"/>
                <h2 className="text-3xl font-bold text-white mb-2">Subscribe & Learn</h2>
                <p className="text-white/80 mb-6">Educational content, live trading sessions, and weekly breakdowns.</p>
                <a 
                    href="https://www.youtube.com/@PaulG-FX" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-white text-[#ea3333] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
                >
                    Visit Channel
                </a>
            </div>

            <div className="text-center text-gray-400">
                <p>We typically respond within 24-48 hours.</p>
                <p className="text-xs mt-2 text-gray-600">Note: We will never ask for your seed phrase or private keys.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;