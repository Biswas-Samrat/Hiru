import { Link } from 'react-router-dom';

const HomeWorkingHours = () => {
  return (
    <section 
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat py-20 md:py-28"
      style={{ backgroundImage: `url('/assat/abaout/abaoutbg.jpg')` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#121212]/75 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column - About Us Lead */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[3px] w-6 bg-[#f3a623]" />
            <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-white">
              ABOUT US
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Working hours
          </h2>

          <p className="text-[#eae8e4] text-base md:text-lg mb-10 max-w-md font-serif leading-relaxed italic opacity-90">
            Rolorem, beatae dolorum, praesentium itaque et quam quaerat.
          </p>

          <div className="flex items-center gap-8">
            <Link 
              to="/book-a-table" 
              className="bg-[#f3a623] hover:bg-[#e09415] text-[#1a1a1a] font-sans font-bold py-3.5 px-8 rounded shadow-lg tracking-wider text-xs uppercase transition-all duration-300 hover:scale-102"
            >
              RESERVATION
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-[#f3a623] font-sans font-bold tracking-wider text-xs uppercase transition-colors duration-300 border-b border-transparent hover:border-[#f3a623] pb-0.5"
            >
              CONTACT US
            </Link>
          </div>
        </div>

        {/* Right column - Working Hours Card */}
        <div className="flex justify-center md:justify-end">
          <div className="bg-white px-8 py-12 md:px-10 md:py-16 shadow-2xl rounded-sm max-w-sm w-full text-center flex flex-col justify-center items-center border border-[#eaeaea]">
            <span className="text-[10px] md:text-xs font-sans tracking-[0.25em] text-[#6b7280] font-extrabold uppercase mb-5">
              SUNDAY TO TUESDAY
            </span>
            <div className="text-3xl md:text-4xl font-serif font-black text-[#1a1a1a] tracking-wider mb-2">
              09 <span className="text-[#f3a623]">:</span> 00
            </div>
            <div className="text-3xl md:text-4xl font-serif font-black text-[#1a1a1a] tracking-wider mb-8">
              22 <span className="text-[#f3a623]">:</span> 00
            </div>

            <div className="w-16 h-[1px] bg-gray-200 my-2" />

            <span className="text-[10px] md:text-xs font-sans tracking-[0.25em] text-[#6b7280] font-extrabold uppercase mt-6 mb-5">
              FRIDAY TO SATURDAY
            </span>
            <div className="text-3xl md:text-4xl font-serif font-black text-[#1a1a1a] tracking-wider mb-2">
              11 <span className="text-[#f3a623]">:</span> 00
            </div>
            <div className="text-3xl md:text-4xl font-serif font-black text-[#1a1a1a] tracking-wider">
              19 <span className="text-[#f3a623]">:</span> 00
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeWorkingHours;
