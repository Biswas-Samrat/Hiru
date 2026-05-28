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
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Interactive Menu</p>
          <h2>Choose Your Curry Base, Heat, and Add-ons</h2>
          <p>
            Full PDF menu content is grouped for quick ordering, with vegetarian, dairy-free, gluten-free, and spicy labels.
          </p>
        </div>

        {!compact && (
          <div className="featured-strip">
            {featuredDishes.map((item) => (
              <motion.article
                key={item.id}
                className="featured-dish"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <img src={item.image} alt={item.name} />
                <div>
                  <span className="small text-gold fw-bold">All-Time Favorite</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="category-tabs" role="tablist" aria-label="Menu categories">
          {menuCategories.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? 'active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {visibleItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="menu-card-body">
                <div className="d-flex justify-content-between gap-3">
                  <h3>{item.code}. {item.name}</h3>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>
                <p>{item.description}</p>
                <div className="menu-badges">
                  {item.dietary.map((tag) => <span key={tag}>{tag}</span>)}
                  {item.isSpicy && <span><i className="fa-solid fa-pepper-hot" /> Spicy</span>}
                  {item.customization?.spice && <span>Spice Choice</span>}
                  {item.customization?.curryBase && <span>Curry Base</span>}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link to="/order-online" className="btn btn-warning text-dark fw-bold px-4 py-3">
            <i className="fa-solid fa-cart-shopping me-2" />
            Start Takeaway Order
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Menu;
