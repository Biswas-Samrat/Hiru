import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { customerMenu, featuredDishes, formatCurrency, menuCategories } from '../data/menuData';

const Menu = ({ compact = false }) => {
  const [activeCategory, setActiveCategory] = useState('Kottu');

  const visibleItems = useMemo(
    () => customerMenu.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  return (
    <section id="menu" className="bg-[#070707] py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Interactive Menu</p>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Choose Your Curry Base, Heat, and Add-ons</h2>
          <p className="mx-auto max-w-2xl text-muted">
            Full PDF menu content is grouped for quick ordering, with vegetarian, dairy-free, gluten-free, and spicy labels.
          </p>
        </div>

        {!compact && (
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {featuredDishes.map((item) => (
              <motion.article
                key={item.id}
                className="flex gap-4 overflow-hidden rounded-lg border border-gold/25 bg-white/5 shadow-xl"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <img src={item.image} alt={item.name} className="h-32 w-32 shrink-0 object-cover" />
                <div className="p-4">
                  <span className="text-xs font-bold text-gold">All-Time Favorite</span>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-muted">{item.description}</p>
                  <strong className="text-gold">{formatCurrency(item.price)}</strong>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Menu categories">
          {menuCategories.map((category) => (
            <button
              type="button"
              key={category}
              className={`rounded-full border px-4 py-2 font-semibold transition-colors ${
                activeCategory === category
                  ? 'border-gold bg-gold text-[#0b0b0b]'
                  : 'border-gold/35 bg-white/5 text-white hover:border-gold/60'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article className="overflow-hidden rounded-lg border border-gold/25 bg-white/5 shadow-xl" key={item.id}>
              <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
              <div className="p-5">
                <div className="mb-2 flex justify-between gap-3">
                  <h3 className="font-bold text-white">{item.code}. {item.name}</h3>
                  <strong className="shrink-0 text-gold">{formatCurrency(item.price)}</strong>
                </div>
                <p className="mb-3 text-sm text-muted">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.dietary.map((tag) => (
                    <span key={tag} className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold">
                      {tag}
                    </span>
                  ))}
                  {item.isSpicy && (
                    <span className="rounded-full border border-brand-red/50 px-2 py-0.5 text-xs text-brand-orange">
                      <i className="fa-solid fa-pepper-hot" /> Spicy
                    </span>
                  )}
                  {item.customization?.spice && (
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-white/70">Spice Choice</span>
                  )}
                  {item.customization?.curryBase && (
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-white/70">Curry Base</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/order-online"
            className="inline-flex items-center rounded-full bg-amber-400 px-6 py-3 font-bold text-black hover:bg-amber-300"
          >
            <i className="fa-solid fa-cart-shopping me-2" />
            Start Takeaway Order
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Menu;
