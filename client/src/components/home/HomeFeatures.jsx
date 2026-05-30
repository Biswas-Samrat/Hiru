import SectionHeading from './SectionHeading';

const features = [
  {
    icon: 'fa-solid fa-book-open',
    title: 'Menu for every taste',
    description:
      'From classic chicken kottu and devilled rice to fusion burgers — bold Sri Lankan flavours with something for everyone.',
  },
  {
    icon: 'fa-solid fa-leaf',
    title: 'Always fresh ingredients',
    description:
      'Prepared to order with authentic spices and quality produce, so every plate leaves the kitchen hot and full of flavour.',
  },
  {
    icon: 'fa-solid fa-hat-chef',
    title: 'Experienced chefs',
    description:
      'Chef Hiru brings professional kitchen training and years of passion for Ceylon street food to every dish in Taupo.',
  },
];

const HomeFeatures = () => (
  <section className="bg-white py-16 md:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <SectionHeading
        eyebrow="Features"
        title="Why people choose us?"
        subtitle="Authentic Sri Lankan fusion, cooked fresh for takeaway pickup and dine-in tables in the heart of Taupo."
      />

      <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
        {features.map(({ icon, title, description }) => (
          <div key={title} className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center text-ink">
              <i className={`${icon} text-5xl font-light`} aria-hidden />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink md:text-2xl">{title}</h3>
            <p className="mx-auto mt-3 max-w-xs font-serif text-sm leading-relaxed text-muted md:text-base">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFeatures;
