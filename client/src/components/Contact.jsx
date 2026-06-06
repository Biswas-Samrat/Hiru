import { useState, useEffect } from 'react';

const Contact = () => {
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Defer the loading of the map iframe to allow the rest of the page to mount instantly
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="contact" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-4">
            <div className="card-light h-full p-6">
              <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Contact &amp; locations</p>
              <h2 className="mb-6 text-3xl font-bold text-ink">Find Hiran&apos;s in Taupo</h2>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <i className="fa-solid fa-location-dot mt-1 text-gold" />
                  <span className="text-muted">
                    <strong className="block text-ink">Primary location</strong>
                    113 Tongariro Street, Taupo
                  </span>
                </div>
                <div className="flex gap-3">
                  <i className="fa-solid fa-store mt-1 text-gold" />
                  <span className="text-muted">
                    <strong className="block text-ink">Secondary brands</strong>
                    Stag Park, 140 Napier Road
                  </span>
                </div>
                <div className="flex gap-3">
                  <i className="fa-solid fa-phone mt-1 text-gold" />
                  <span className="text-muted">
                    <strong className="block text-ink">Phone</strong>
                    07 281 7206
                  </span>
                </div>
                <div className="flex gap-3">
                  <i className="fa-solid fa-envelope mt-1 text-gold" />
                  <span className="text-muted">
                    <strong className="block text-ink">Email</strong>
                    info@hiransfusion.co.nz
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">

                <a
                  href="https://www.facebook.com/share/14hqfxHZ6i1/"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold/10"
                >
                  <i className="fa-brands fa-facebook-f" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-lg border border-gold/25 shadow-xl bg-cream">
              {/* Spinner/Skeleton Placeholder */}
              {(!showMap || !mapLoaded) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream/90 p-4 text-center z-20">
                  <div className="relative flex items-center justify-center mb-4">
                    <div className="absolute h-16 w-16 animate-ping rounded-full bg-gold/20 opacity-75" />
                    <div className="relative h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                      <i className="fa-solid fa-map-location-dot text-xl" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-ink animate-pulse">Loading Map...</p>
                  <p className="text-xs text-muted mt-1 max-w-[200px]">Getting interactive map details</p>
                </div>
              )}

              {showMap && (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.401201509172!2d176.07125347683936!3d-38.68652397177005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d6be9023f03b475%3A0x867b140b90497552!2s113%20Tongariro%20Street%2C%20Taup%C5%8D%203330%2C%20New%20Zealand!5e0!3m2!1sen!2snz!4v1715150000000!5m2!1sen!2snz"
                  width="100%"
                  height="100%"
                  className={`min-h-[400px] border-0 transition-opacity duration-500 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  allowFullScreen=""
                  onLoad={() => setMapLoaded(true)}
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hiran's Sri Lankan Fusion map"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
