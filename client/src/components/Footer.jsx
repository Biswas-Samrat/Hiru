import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 bg-black border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-8">
          <span className="text-2xl font-royal font-bold text-gold tracking-widest uppercase">Hiran's</span>
          <span className="block text-[10px] text-gold/80 tracking-[0.3em] uppercase">Sri Lankan Fusion</span>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          &copy; {new Date().getFullYear()} Hiran's Sri Lankan Fusion. All Rights Reserved. <br />
          Designed for Royalty. Built for Taupō.
        </p>
        <div className="flex justify-center gap-8 text-xs uppercase tracking-[0.2em] text-gray-400">
          <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
