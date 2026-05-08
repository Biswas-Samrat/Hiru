import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex flex-col items-center">
            <span className="text-2xl font-royal font-bold text-gold tracking-widest uppercase">Hiran's</span>
            <span className="text-[10px] text-gold/80 tracking-[0.3em] uppercase -mt-1">Sri Lankan Fusion</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Home</Link>
            <a href="#menu" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Menu</a>
            <a href="#about" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Chef Hiru</a>
            <a href="#contact" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Contact</a>
            <button className="btn-primary">Order Now</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gold">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 absolute w-full h-screen top-0 left-0 flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-gold">
            <X size={32} />
          </button>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl uppercase tracking-widest">Home</Link>
          <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl uppercase tracking-widest">Menu</a>
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl uppercase tracking-widest">Chef Hiru</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl uppercase tracking-widest">Contact</a>
          <button className="btn-primary mt-4">Order Now</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
