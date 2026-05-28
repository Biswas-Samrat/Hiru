const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="row g-5 align-items-stretch">
          <div className="col-lg-4">
            <div className="contact-panel">
              <p className="eyebrow">Contact & Locations</p>
              <h2>Find Hiran’s in Taupo</h2>

              <div className="contact-list">
                <div>
                  <i className="fa-solid fa-location-dot" />
                  <span>
                    <strong>Primary Location</strong>
                    113 Tongariro Street, Taupo
                  </span>
                </div>
                <div>
                  <i className="fa-solid fa-store" />
                  <span>
                    <strong>Secondary Brands</strong>
                    Stag Park, 140 Napier Road
                  </span>
                </div>
                <div>
                  <i className="fa-solid fa-phone" />
                  <span>
                    <strong>Phone</strong>
                    07 281 7206
                  </span>
                </div>
                <div>
                  <i className="fa-solid fa-envelope" />
                  <span>
                    <strong>Email</strong>
                    info@hiransfusion.co.nz
                  </span>
                </div>
              </div>

              <div className="social-actions">
                <a href="https://www.instagram.com/" aria-label="Instagram">
                  <i className="fa-brands fa-instagram" />
                </a>
                <a href="https://www.tiktok.com/" aria-label="TikTok">
                  <i className="fa-brands fa-tiktok" />
                </a>
                <a href="https://www.facebook.com/" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.401201509172!2d176.07125347683936!3d-38.68652397177005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d6be9023f03b475%3A0x867b140b90497552!2s113%20Tongariro%20Street%2C%20Taup%C5%8D%203330%2C%20New%20Zealand!5e0!3m2!1sen!2snz!4v1715150000000!5m2!1sen!2snz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hiran's Sri Lankan Fusion map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
