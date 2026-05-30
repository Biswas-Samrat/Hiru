const MenuPage = () => (
  <div className="bg-cream pb-24 pt-28">
    <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
      <div className="mb-12 text-center">
        <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Full menu</p>
        <h1 className="text-4xl font-bold text-ink">Hiran&apos;s menu</h1>
      </div>
      <div className="flex flex-col gap-6">
        <img
          src="/assat/menu/menu_1.jpg"
          alt="Hiran's menu page 1"
          className="w-full rounded-2xl border border-gray-200 shadow-soft"
        />
        <img
          src="/assat/menu/menu_2.jpg"
          alt="Hiran's menu page 2"
          className="w-full rounded-2xl border border-gray-200 shadow-soft"
        />
      </div>
    </div>
  </div>
);

export default MenuPage;
