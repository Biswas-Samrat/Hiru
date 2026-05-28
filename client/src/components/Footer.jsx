const Footer = () => {
  return (
    <footer className="py-5 section-dark border-top border-gold">
      <div className="container text-center">
        <div className="mb-4">
          <span className="fs-3 font-royal fw-bold text-gold text-uppercase">Hiran's</span>
          <span className="d-block small text-gold text-uppercase">Sri Lankan Fusion</span>
        </div>
        <p className="text-secondary small mb-4">
          &copy; {new Date().getFullYear()} Hiran's Sri Lankan Fusion. All Rights Reserved. <br />
          Designed for Royalty. Built for Taupo.
        </p>
        <div className="d-flex justify-content-center gap-4 small text-uppercase">
          <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>
          <a href="#" className="text-secondary text-decoration-none">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
