import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HomeFeatures from '../components/home/HomeFeatures';
import HomeGallery from '../components/home/HomeGallery';
import HomeTestimonials from '../components/home/HomeTestimonials';

const Home = () => (
  <div>
    <Hero />
    <HomeFeatures />
    <HomeGallery />
    <HomeTestimonials />

    <section className="border-t border-[#e8e6e1] bg-white py-14 md:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-ink md:text-3xl">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Order takeaway for pickup, book a table, or track your order live from our kitchen.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/order-online" className="btn-primary cursor-pointer">
            Order takeaway
          </Link>
          <Link to="/book-a-table" className="btn-outline cursor-pointer bg-white">
            Book a table
          </Link>
          <Link to="/my-orders" className="btn-outline cursor-pointer bg-white">
            My orders
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
