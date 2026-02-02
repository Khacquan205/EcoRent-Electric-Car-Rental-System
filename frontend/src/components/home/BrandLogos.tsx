const brands = [
  { name: "Honda", fontFamily: "Arial", letterSpacing: "0" },
  { name: "Jaguar", fontFamily: "serif", letterSpacing: "2" },
  { name: "Nissan", fontFamily: "Arial", letterSpacing: "0" },
  { name: "Volvo", fontFamily: "Arial", letterSpacing: "4" },
];

const BrandLogos = () => {
  return (
    <section className="border-t border-[#E5E5E5] bg-white py-16 lg:py-30">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:justify-between">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-2 text-[#242424] opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            >
              <svg
                className="h-8 w-auto"
                viewBox="0 0 100 20"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="16"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily={brand.fontFamily}
                  letterSpacing={brand.letterSpacing}
                >
                  {brand.name.toUpperCase()}
                </text>
              </svg>
            </div>
          ))}
          {/* Audi - Special rings logo */}
          <div className="flex items-center gap-2 text-[#242424] opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            <svg
              className="h-8 w-auto"
              viewBox="0 0 80 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="28" cy="12" r="10" />
              <circle cx="44" cy="12" r="10" />
              <circle cx="60" cy="12" r="10" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
