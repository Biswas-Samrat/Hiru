import { Link } from 'react-router-dom';
import Hero from '../components/Hero';

const Home = () => (
  <div>
    <Hero />

    <section className="border-t border-gray-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Welcome</p>
            <h2 className="mb-4 text-3xl font-bold text-ink md:text-4xl">Home of Ceylon fusion in Taupo</h2>
            <p className="text-lg text-muted leading-relaxed">
              Hiran&apos;s brings Sri Lankan street food, fusion burgers, devilled rice plates, and a few dine-in tables into one polished takeaway-first experience.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="card-light p-8">
              <span className="mb-2 block font-royal text-xs font-bold uppercase tracking-widest text-gold">Live prep timer</span>
              <strong className="mb-4 block text-lg text-ink">Every takeaway order gets a ready-time countdown.</strong>
              <div className="flex flex-wrap gap-3">
                <Link to="/order-online" className="btn-primary text-sm">
                  Order takeaway
                </Link>
                <Link to="/my-orders" className="btn-outline text-sm">
                  My orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
