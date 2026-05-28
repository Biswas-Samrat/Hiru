import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (location.pathname === "/order-online") {
        if (isMobileMenuOpen) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, location.pathname, isMobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const navStyle = {
    transition: "all 0.35s ease, transform 0.35s ease",
    background: isScrolled
      ? "rgba(0,0,0,0.95)"
      : "rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    padding: isScrolled ? "10px 0" : "18px 0",
    boxShadow: isScrolled
      ? "0 4px 20px rgba(0,0,0,0.25)"
      : "none",
    transform: isVisible ? "translateY(0)" : "translateY(-100%)",
  };

  const navLinkStyle = {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    transition: "0.3s",
    position: "relative",
  };

  const activeLinkStyle = {
    color: "#ffc107",
  };

  const buttonStyle = {
    borderRadius: "50px",
    padding: "10px 24px",
    fontWeight: "700",
    transition: "0.3s",
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top "
      style={navStyle}
    >
      <div className="container">

        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center"
        >
          <img
            src="/assat/logo/logo%20(3).png"
            alt="Hiran Logo"
            style={{
              height: isScrolled ? "58px" : "72px",
              width: "auto",
              objectFit: "contain",
              transition: "0.3s",
            }}
          />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() =>
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div
          className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""
            }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <ul className="navbar-nav mx-auto align-items-lg-center gap-lg-4 text-center">

            <li className="nav-item">
              <Link
                to="/"
                className="nav-link"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/") ? activeLinkStyle : {}),
                }}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/menu"
                className="nav-link"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/menu")
                    ? activeLinkStyle
                    : {}),
                }}
              >
                Menu
              </Link>
            </li>


            <li className="nav-item">
              <Link
                to="/book-a-table"
                className="nav-link"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/book-a-table")
                    ? activeLinkStyle
                    : {}),
                }}
              >
                Book a Table
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/chef-hiru"
                className="nav-link"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/chef-hiru")
                    ? activeLinkStyle
                    : {}),
                }}
              >
                Chef Hiru
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/contact"
                className="nav-link"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/contact")
                    ? activeLinkStyle
                    : {}),
                }}
              >
                Contact
              </Link>
            </li>



            {/* Order Now Button */}
            <li className="nav-item mt-3 mt-lg-0">
              <Link
                to="/order-online"
                className="btn btn-warning text-dark d-inline-flex align-items-center"
                style={buttonStyle}
              >
                <i className="fa-solid fa-bag-shopping me-2"></i>
                Order Now
              </Link>
            </li>

            {/* Cart Icon */}
            <li className="nav-item mt-2 mt-lg-0">
              <Link
                to="/cart"
                className="nav-link position-relative d-inline-block px-3"
                title="View cart"
              >
                <i className="fa-solid fa-cart-shopping fs-5"></i>
              </Link>
            </li>

          </ul>
        </div>
      </div>

      {/* Mobile Menu Background */}
      <style>
        {`
          @media (max-width: 991px) {
            .navbar-collapse {
              background: rgba(0,0,0,0.96);
              margin-top: 15px;
              padding: 24px;
              border-radius: 18px;
            }

            .navbar-nav {
              gap: 16px;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
