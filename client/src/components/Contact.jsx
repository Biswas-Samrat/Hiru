import React from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Info */}
          <div className="lg:w-1/3">
            <h2 className="text-gold font-royal tracking-[0.3em] uppercase mb-4 text-sm">Find Us</h2>
            <h3 className="text-4xl font-serif font-bold mb-8">Visit the Royalty</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin className="text-gold shrink-0" />
                <div>
                  <h4 className="font-bold text-gold uppercase tracking-widest text-xs mb-1">Location</h4>
                  <p className="text-gray-300">113 Tongariro Street, Taupō 3330, New Zealand</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Phone className="text-gold shrink-0" />
                <div>
                  <h4 className="font-bold text-gold uppercase tracking-widest text-xs mb-1">Phone</h4>
                  <p className="text-gray-300">+64 7 123 4567</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-gold shrink-0" />
                <div>
                  <h4 className="font-bold text-gold uppercase tracking-widest text-xs mb-1">Hours</h4>
                  <p className="text-gray-300">Mon - Sun: 11:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a href="#" className="w-12 h-12 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="lg:w-2/3 h-[500px] grayscale contrast-125 border border-gold/20">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.401201509172!2d176.07125347683936!3d-38.68652397177005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d6be9023f03b475%3A0x867b140b90497552!2s113%20Tongariro%20Street%2C%20Taup%C5%8D%203330%2C%20New%20Zealand!5e0!3m2!1sen!2sus!4v1715150000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Hiran's Sri Lankan Fusion Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
