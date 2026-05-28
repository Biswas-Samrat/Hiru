import { Link } from 'react-router-dom';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div className="section-dark">
      <Hero />

      <section className="intro-band">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <p className="eyebrow">Welcome</p>
              <h2>Home of Ceylon Fusion in Taupo.</h2>
              <p>
                Hiran's brings Sri Lankan street food, fusion burgers, devilled rice plates, and a few dine-in tables into one polished takeaway-first experience.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="quick-order-panel">
                <span>Live Preparation Timer</span>
                <strong>Every takeaway order gets a ready-time countdown.</strong>
                <Link to="/order-online" className="btn btn-warning text-dark fw-bold">
                  Order Takeaway
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
