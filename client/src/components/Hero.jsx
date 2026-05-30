import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const Hero = () => (
  <section className="relative overflow-hidden bg-[#fff9f2] pt-[72px]">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, #f5e6c8 0%, transparent 45%),
          radial-gradient(circle at 80% 10%, #fde8d0 0%, transparent 40%),
          radial-gradient(circle at 60% 90%, #f0dfc8 0%, transparent 50%)`,
      }}
    />
    <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
    <div className="pointer-events-none absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-3 md:pb-20 md:pt-4">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div {...fadeUp} transition={{ duration: 0.65 }}>
          <h1 className="mb-5 text-4xl font-bold leading-[1.1] text-ink md:text-5xl lg:text-[3.35rem]">
            Bold Sri Lankan
            <span className="mt-1 block text-gold">street food &amp; fusion</span>
          </h1>

          <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted">
            Kottu, devilled rice, fusion burgers — cooked fresh to order. Pick up takeaway or book one of our few tables.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <Link to="/order-online" className="btn-primary shadow-lg shadow-gold/25">
              <i className="fa-solid fa-bag-shopping me-2" />
              Order takeaway
            </Link>
            <Link to="/menu" className="btn-outline bg-white">
              <i className="fa-solid fa-book-open me-2" />
              View menu
            </Link>
            <Link
              to="/my-orders"
              className="inline-flex items-center justify-center rounded-full border border-[#e8dfd0] bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-gold hover:text-gold"
            >
              <i className="fa-solid fa-location-crosshairs me-2 text-gold" />
              My orders
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ['fa-clock', 'Live prep timer', 'Know when food is ready'],
              ['fa-pepper-hot', 'Spice your way', 'Mild to extra hot'],
              ['fa-location-dot', '113 Tongariro St', 'Taupo, NZ'],
            ].map(([icon, title, sub]) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-[#e8dfd0] bg-white/80 p-4 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <i className={`fa-solid ${icon} text-sm`} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="text-xs text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#e8dfd0] shadow-[0_24px_60px_rgba(26,26,26,0.12)] sm:aspect-[5/6]">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              poster="https://images.unsplash.com/photo-1585937421612-70a008296fbe?w=800&q=80"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-chef-tossing-food-in-a-pan-4340-large.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/90 p-4 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">Chef&apos;s pick</p>
              <p className="font-serif text-lg font-bold text-ink">Chicken Kottu · Devilled Rice · Fusion Burgers</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -right-2 top-8 rounded-2xl border border-[#e8dfd0] bg-white px-4 py-3 shadow-lg sm:right-[-12px]"
          >
            <p className="text-xs font-bold uppercase text-muted">Avg. prep</p>
            <p className="text-2xl font-bold text-gold">15–25 min</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="absolute -left-2 bottom-24 rounded-2xl border border-[#e8dfd0] bg-gold px-4 py-3 text-white shadow-lg sm:left-[-12px]"
          >
            <p className="flex items-center gap-2 text-sm font-bold">
              <i className="fa-solid fa-star" />
              4.9 guest rating
            </p>
          </motion.div>

          <div className="absolute -z-10 -right-6 -top-6 h-full w-full rounded-3xl border-2 border-gold/20" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;
