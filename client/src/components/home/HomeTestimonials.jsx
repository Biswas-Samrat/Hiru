import SectionHeading from './SectionHeading';

const testimonials = [
  {
    title: 'The best kottu in Taupo!',
    body: 'We order takeaway every week. The spice levels are perfect and the live prep timer means we never wait around wondering when food will be ready.',
    name: 'Sarah M.',
    date: '12.03.26',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    featured: false,
  },
  {
    title: 'It was very delicious!',
    body: 'Hiran\'s fusion burgers and devilled rice are incredible. Fresh, generous portions, and the team always gets our order right. Easily our favourite spot in town.',
    name: 'James K.',
    date: '28.02.26',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0bf1d2ffb520?auto=format&fit=crop&w=120&q=80',
    featured: true,
  },
  {
    title: 'A real taste of Sri Lanka',
    body: 'Booked a table for dinner and loved the atmosphere. Chef Hiru\'s cooking reminds us of home — authentic, bold, and made with real care.',
    name: 'Priya R.',
    date: '15.01.26',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    featured: false,
  },
];

const TestimonialCard = ({ title, body, name, date, avatar, featured }) => (
  <article
    className={`relative flex h-full flex-col bg-white p-8 md:p-10 ${
      featured
        ? 'z-10 border border-[#d8d6d0] shadow-[0_12px_40px_rgba(26,26,26,0.08)] md:-mt-2 md:mb-2'
        : 'border border-dashed border-[#d0cec8]'
    }`}
  >
    {featured && (
      <span
        className="absolute -right-1 -top-3 font-serif text-6xl leading-none text-brand-orange md:text-7xl"
        aria-hidden
      >
        &ldquo;
      </span>
    )}
    <h3 className="font-serif text-xl font-bold text-ink md:text-2xl">{title}</h3>
    <p className="mt-4 flex-grow font-serif text-sm leading-relaxed text-muted md:text-base">{body}</p>
    <div className="mt-6 border-t border-dotted border-[#d0cec8] pt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
          <span className="truncate text-xs font-bold uppercase tracking-wider text-ink">{name}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[#f0efeb] px-3 py-1 text-xs font-semibold text-muted">
          {date}
        </span>
      </div>
    </div>
  </article>
);

const HomeTestimonials = () => (
  <section className="bg-white py-16 md:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <SectionHeading
        eyebrow="Reviews"
        title="What our visitors say"
        subtitle="Guests love our takeaway, dine-in tables, and the bold flavours of Chef Hiru&apos;s Sri Lankan fusion kitchen."
      />

      <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
        {testimonials.map((item) => (
          <TestimonialCard key={item.name} {...item} />
        ))}
      </div>
    </div>
  </section>
);

export default HomeTestimonials;
