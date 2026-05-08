import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const videos = [
    { id: 1, title: "Tossing Kottu", url: "https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-4339-large.mp4" },
    { id: 2, title: "Secret Spices", url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-person-pouring-spices-4341-large.mp4" },
    { id: 3, title: "The Perfect Fusion", url: "https://assets.mixkit.co/videos/preview/mixkit-chef-decorating-a-plate-4342-large.mp4" }
  ];

  return (
    <section id="about" className="py-24 bg-black-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-gold font-royal tracking-[0.3em] uppercase mb-4 text-sm">The Visionary</h2>
            <h3 className="text-4xl md:text-6xl font-serif font-bold mb-8">Chef Hiran</h3>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                From the prestigious halls of the Hilton to the vibrant street markets, Chef Hiran's journey has always been about one thing: <span className="text-gold font-semibold italic">Authenticity with a Twist.</span>
              </p>
              <p>
                Having mastered the traditional art of Sri Lankan cuisine, Hiran moved to Taupō to bring a new dimension of flavor to New Zealand. His "Fusion" approach combines the royalty of Ceylonese heritage with modern culinary techniques.
              </p>
              <p>
                Every plate of Kottu Rotti is a performance, every blend of spice is a story. At 113 Tongariro Street, we don't just serve food; we serve a theatrical experience.
              </p>
            </div>
            
            <div className="mt-10 flex gap-8">
              <div>
                <span className="block text-3xl font-serif font-bold text-gold">15+</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Years Experience</span>
              </div>
              <div>
                <span className="block text-3xl font-serif font-bold text-gold">3</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Signature Brands</span>
              </div>
            </div>
          </motion.div>

          {/* Video Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="rounded-none overflow-hidden h-64 border border-gold/20">
                <video autoPlay muted loop className="w-full h-full object-cover">
                  <source src={videos[0].url} type="video/mp4" />
                </video>
              </div>
              <div className="rounded-none overflow-hidden h-40 border border-gold/20 bg-gold/10 flex items-center justify-center p-8">
                <span className="text-gold font-royal text-center text-sm tracking-widest uppercase italic">"Cooking is a performance, the kitchen is my stage."</span>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="rounded-none overflow-hidden h-40 border border-gold/20">
                <video autoPlay muted loop className="w-full h-full object-cover">
                  <source src={videos[1].url} type="video/mp4" />
                </video>
              </div>
              <div className="rounded-none overflow-hidden h-64 border border-gold/20">
                <video autoPlay muted loop className="w-full h-full object-cover">
                  <source src={videos[2].url} type="video/mp4" />
                </video>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
