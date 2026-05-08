import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-chef-tossing-food-in-a-pan-4340-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-gold font-royal text-xl tracking-[0.4em] mb-4 uppercase">Taupō's Finest Ceylon Cuisine</h2>
          <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight">
            The Royalty of <br />
            <span className="text-gold italic">Sri Lankan Fusion</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the theatrical art of Kottu Rotti and the rich heritage of Sri Lankan spices, crafted by Chef Hiru.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="#menu" className="btn-primary w-full md:w-auto">Order Online</a>
            <a href="#booking" className="btn-outline w-full md:w-auto">Book a Table</a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-1 h-12 rounded-full border border-gold/30 flex items-start justify-center p-1">
          <div className="w-1 h-3 bg-gold rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
