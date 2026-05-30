const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="mx-auto max-w-2xl text-center">
    <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-brand-orange" />
    {eyebrow && (
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink">{eyebrow}</p>
    )}
    <h2 className="font-serif text-3xl font-bold text-ink md:text-4xl lg:text-[2.75rem]">{title}</h2>
    {subtitle && <p className="mt-4 font-serif text-base leading-relaxed text-muted md:text-lg">{subtitle}</p>}
  </div>
);

export default SectionHeading;
