import React from 'react';
import { Discord, Envelope, Phone } from 'react-bootstrap-icons';

const Contact = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Get In Touch</h1>

      <div className="grid md:grid-cols-2 gap-12">
        
        {/* Left Side: Contact Forms */}
        <div className="space-y-12">
            
            {/* Website Team Form */}
            <div className="bg-cosmic-card p-8 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-900/10">
                <div className="flex items-center gap-3 mb-6">
                    <Envelope className="text-purple-400 text-xl"/>
                    <h2 className="text-2xl font-bold">Website Team</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">For bugs, suggestions, or inquiries about the web platform.</p>
                <form className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 outline-none transition"/>
                    <input type="email" placeholder="Your Email" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 outline-none transition"/>
                    <textarea placeholder="Message" rows="4" className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 outline-none transition"></textarea>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition">Send to Paul</button>
                </form>
                <p className="mt-4 text-xs text-gray-500 text-center">Direct: paulgherman29@gmail.com</p>
            </div>

            {/* App Team Form */}
            <div className="bg-cosmic-card p-8 rounded-xl border border-white/5 opacity-75">
                <div className="flex items-center gap-3 mb-6">
                    <Phone className="text-blue-400 text-xl"/>
                    <h2 className="text-2xl font-bold">App Team</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">For inquiries regarding the upcoming iOS/Android apps.</p>
                <div className="text-center py-8 bg-black/30 rounded border border-dashed border-white/10">
                    <p className="text-gray-500 italic">Direct contact not available yet.</p>
                    <p className="text-gray-500 text-sm">Please use the Discord server.</p>
                </div>
            </div>

        </div>

        {/* Right Side: Discord & Info */}
        <div className="flex flex-col justify-center space-y-8">
            <div className="bg-[#5865F2] p-10 rounded-2xl text-center transform hover:scale-105 transition duration-300 cursor-pointer shadow-xl">
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

            <div className="text-center text-gray-400">
                <p>We typically respond within 24-48 hours.</p>
                <p>Timezone: EET (Eastern European Time)</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;