import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-gray-200 bg-white py-12">
    <div className="mx-auto max-w-7xl px-4 text-center">
      <div className="mb-4">
        <span className="font-royal text-2xl font-bold uppercase text-gold">Hiran&apos;s</span>
        <span className="block text-sm uppercase text-muted">Sri Lankan Fusion · Taupo</span>
      </div>
      <p className="mb-6 text-sm text-muted">
        &copy; {new Date().getFullYear()} Hiran&apos;s Sri Lankan Fusion. All rights reserved.
      </p>
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <Link to="/menu" className="text-muted no-underline hover:text-gold">Menu</Link>
        <Link to="/order-online" className="text-muted no-underline hover:text-gold">Order</Link>
        <Link to="/book-a-table" className="text-muted no-underline hover:text-gold">Book a table</Link>
        <Link to="/my-orders" className="text-muted no-underline hover:text-gold">My orders</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
