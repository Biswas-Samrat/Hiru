import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <section id="about" className="bg-white pt-6 pb-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Div: Text & Badges & Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">About Chef Hiru</p>
            <h2 className="mb-6 text-3xl font-bold text-ink md:text-4xl">
              From Hilton kitchens to Taupo street-food theatre.
            </h2>
            <div className="space-y-4 text-muted">
              <p>Chef Hiru is the force behind Hiran's Sri Lankan Fusion, The Local Diner, and Spicy Touch by Chef Hiru in Taupo.</p>
              <p>His latest concept, Hiran's Sri Lankan Fusion, is located in the heart of Taupo at 113 Tongariro Street, bringing bold Sri Lankan street food and signature Kottu Rotti to the town.</p>
              <p>The Local Diner and Spicy Touch by Chef Hiru are based at Stag Park, 140 Napier Road, offering a mix of American-style comfort food and authentic Sri Lankan cuisine.</p>
              <p>He began his journey working in the professional kitchen of Hilton Auckland, building a strong foundation in quality, consistency, and customer service.</p>
              <p>After that, he started small, selling homemade food and running a local market stall in Taupo. Through hard work and passion, he grew step by step into multiple food brands.</p>
              <p>Today, his focus is simple: to serve bold, flavourful food and make Sri Lankan cuisine more popular in New Zealand.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">Hiran&apos;s Sri Lankan Fusion</span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">The Local Diner</span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">Spicy Touch by Chef Hiru</span>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/book-a-table" className="btn-primary cursor-pointer min-w-[160px] text-center">
                <i className="fa-solid fa-calendar-days me-2" />
                Book a table
              </Link>
              <Link to="/order-online" className="btn-outline cursor-pointer min-w-[160px] text-center bg-white border border-[#d8d6d0]">
                <i className="fa-solid fa-bag-shopping me-2" />
                Order now
              </Link>
            </div>
          </motion.div>

          {/* Right Div: Photo & Background Shapes */}
          <motion.div
            className="relative flex items-center justify-center lg:pl-10 w-full max-w-[340px] mx-auto"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Background shapes */}
            <div className="absolute -left-2 -top-2 -right-6 -bottom-6 bg-gradient-to-tr from-gold/20 via-gold/10 to-brand-orange/5 rounded-3xl rotate-3 transform scale-95 z-0" />
            <div className="absolute -left-6 -top-6 -right-2 -bottom-2 bg-gradient-to-bl from-gold/10 via-transparent to-brand-orange/10 rounded-full blur-xl opacity-70 z-0" />
            <div className="absolute -left-4 -top-4 -right-4 -bottom-4 border border-gold/30 rounded-3xl -rotate-2 transform z-0" />
            
            {/* Image Wrapper */}
            <div className="relative z-10 w-full overflow-hidden rounded-2xl shadow-xl border border-gold/20 bg-cream">
              <img
                src="/assat/chef/chef.png"
                alt="Chef Hiru"
                className="w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
