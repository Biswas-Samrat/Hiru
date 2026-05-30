import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FALLBACK_GALLERY = [
  {
    image: 'https://images.unsplash.com/photo-1585937421612-70a008296fbe?auto=format&fit=crop&w=800&q=80',
    caption: 'Sri Lankan kottu',
    layout: 'hero',
  },
  {
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    caption: 'Devilled rice plate',
    layout: 'normal',
  },
  {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    caption: 'Fusion burger',
    layout: 'normal',
  },
  {
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    caption: 'Fresh drinks',
    layout: 'normal',
  },
  {
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    caption: 'Street food sides',
    layout: 'wide',
  },
  {
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    caption: 'Dessert',
    layout: 'normal',
  },
];

const layoutSpan = (layout) => {
  if (layout === 'hero') return 'md:col-span-2 md:row-span-2';
  if (layout === 'wide') return 'md:col-span-2';
  return '';
};

const HomeGallery = () => {
  const [photos, setPhotos] = useState(FALLBACK_GALLERY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/gallery`);
        if (!res.ok) throw new Error('Gallery fetch failed');
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPhotos(
            data.map((item) => ({
              id: item.id || item._id,
              image: item.image,
              caption: item.caption || 'Gallery photo',
              layout: item.layout || 'normal',
            }))
          );
        }
      } catch {
        /* keep fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-[#f5f4f0] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="A glimpse of our kitchen"
          subtitle="Fresh plates, sizzling kottu, and fusion favourites — see what awaits at Hiran&apos;s Sri Lankan Fusion."
        />

        <div
          className={`mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[180px] md:gap-4 lg:auto-rows-[200px] ${
            loading ? 'opacity-60' : ''
          }`}
        >
          {photos.map((item, index) => (
            <div
              key={item.id || `${item.caption}-${index}`}
              className={`group relative overflow-hidden rounded-xl bg-[#ebe9e4] ${layoutSpan(item.layout)}`}
            >
              <img
                src={item.image}
                alt={item.caption}
                className="h-full min-h-[140px] w-full object-cover transition duration-500 group-hover:scale-110 md:min-h-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/20" />
              {item.caption ? (
                <p className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-ink/70 to-transparent p-3 text-xs font-semibold text-white transition group-hover:translate-y-0">
                  {item.caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/order-online" className="btn-primary cursor-pointer">
            <i className="fa-solid fa-bag-shopping me-2" />
            Order your favourites
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeGallery;
