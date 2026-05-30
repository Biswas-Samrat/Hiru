import { motion } from 'framer-motion';

const videos = [
  'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-4339-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-person-pouring-spices-4341-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-chef-decorating-a-plate-4342-large.mp4',
];

const About = () => {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-3">
              <video autoPlay muted loop playsInline className="col-span-2 h-48 w-full rounded-lg object-cover">
                <source src={videos[0]} type="video/mp4" />
              </video>
              <video autoPlay muted loop playsInline className="h-36 w-full rounded-lg object-cover">
                <source src={videos[1]} type="video/mp4" />
              </video>
              <video autoPlay muted loop playsInline className="h-36 w-full rounded-lg object-cover">
                <source src={videos[2]} type="video/mp4" />
              </video>
              <div className="col-span-2 rounded-2xl border border-gray-200 bg-surface p-6 shadow-soft">
                <span className="mb-2 block font-royal text-xs font-bold uppercase tracking-widest text-gold">Chef in action</span>
                <strong className="text-lg text-ink">Kottu is food, rhythm, heat, and theatre all at once.</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
