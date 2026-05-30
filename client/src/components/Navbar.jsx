import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_BG = 'bg-[#fff9f2]';
const LOGO_SRC = '/assat/logo/logo%20(3).png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/my-orders') {
      return location.pathname.startsWith('/order-tracking') || location.pathname === '/my-orders';
    }
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `relative cursor-pointer px-2 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors xl:px-3 ${
      isActive(path) ? 'text-gold' : 'text-ink/75 hover:text-gold'
    }`;

  const mainLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/book-a-table', label: 'Book a Table' },
    { to: '/chef-hiru', label: 'Chef Hiru' },
    { to: '/contact', label: 'Contact' },
    { to: '/my-orders', label: 'My Orders' },
  ];

  return (
    <header className={`fixed top-0 z-50 w-full border-b border-[#e8dfd0] ${NAV_BG} shadow-[0_2px_16px_rgba(26,26,26,0.06)]`}>
      <nav className="mx-auto max-w-7xl px-4">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 cursor-pointer items-center no-underline">
            <img
              src={LOGO_SRC}
              alt="Hiran's Sri Lankan Fusion"
              className="h-12 w-auto max-w-[140px] object-contain sm:h-14 sm:max-w-[160px]"
            />
          </Link>

          <ul className="hidden items-center gap-3 lg:flex xl:gap-5 2xl:gap-7">
            {mainLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={linkClass(to)}>
                  {label}
                  {isActive(to) && (
                    <span className="absolute -bottom-0.5 left-0 right-0 mx-auto h-0.5 w-4 rounded-full bg-gold" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e8dfd0] text-ink transition hover:border-gold hover:text-gold sm:flex"
              title="Cart"
            >
              <i className="fa-solid fa-cart-shopping" />
            </Link>
            <Link
              to="/order-online"
              className="hidden cursor-pointer rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-gold-bright sm:inline-flex sm:items-center"
            >
              <i className="fa-solid fa-bag-shopping me-2 text-xs" />
              Order Now
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#e8dfd0] text-ink lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-[#e8dfd0] py-4 lg:hidden">
            <ul className="flex flex-col gap-1">
              {mainLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`block cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide ${
                      isActive(to) ? 'bg-gold/10 text-gold' : 'text-ink hover:bg-white'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 grid grid-cols-2 gap-2 px-2">
                <Link
                  to="/cart"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e8dfd0] py-3 text-sm font-semibold text-ink"
                >
                  <i className="fa-solid fa-cart-shopping" />
                  Cart
                </Link>
                <Link
                  to="/order-online"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-white"
                >
                  <i className="fa-solid fa-bag-shopping" />
                  Order Now
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
