import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-shell modern-hero">
      <div className="hero-media hero-video-bg">
        <video autoPlay muted loop playsInline>
          <source src="https://assets.mixkit.co/videos/preview/mixkit-chef-tossing-food-in-a-pan-4340-large.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay" />

      <div className="container hero-content">
        <div className="hero-layout">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-copy"
          >
            <p className="eyebrow">Hiran's Sri Lankan Fusion | Taupo</p>
            <h1>
              <span className="d-block">Authentic Sri Lankan</span>
              <span className="d-block">Street Food & Fusion Flavours</span>
            </h1>

            <div className="hero-actions">
              <Link to="/order-online" className="btn btn-warning btn-lg text-dark fw-bold">
                <i className="fa-solid fa-bag-shopping me-2" />
                Order Takeaway
              </Link>
              <Link to="/menu" className="btn btn-outline-warning btn-lg fw-bold">
                <i className="fa-solid fa-book-open me-2" />
                View Menu
              </Link>
            </div>

            <div className="hero-meta">
              <span><i className="fa-solid fa-location-dot" /> 113 Tongariro Street, Taupo</span>
              <span><i className="fa-solid fa-store" /> Takeaway pickup only</span>
              <span><i className="fa-solid fa-pepper-hot" /> Spice made your way</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-logo-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <img src="/assat/logo/logo (3).png" alt="Spicy Touch Logo" className="hero-logo-img" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
