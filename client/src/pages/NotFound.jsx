import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-28 text-center">
    <p className="mb-2 font-royal text-sm font-bold uppercase tracking-widest text-gold">404</p>
    <h1 className="mb-4 text-4xl font-bold text-ink md:text-5xl">Page not found</h1>
    <p className="mb-8 max-w-md text-muted">
      The page you are looking for does not exist or may have been moved.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
      <Link to="/order-online" className="btn-outline">
        Order takeaway
      </Link>
    </div>
  </div>
);

export default NotFound;
