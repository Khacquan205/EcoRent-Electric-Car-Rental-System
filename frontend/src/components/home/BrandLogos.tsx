const evBrands = [
  {
    name: "VinFast",
    svg: (
      <svg className="h-7 w-auto" viewBox="0 0 120 24" fill="currentColor">
        <text x="0" y="18" fontSize="18" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1">
          VinFast
        </text>
      </svg>
    ),
  },
  {
    name: "Tesla",
    svg: (
      <svg className="h-7 w-auto" viewBox="0 0 90 24" fill="currentColor">
        <text x="0" y="18" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2">
          TESLA
        </text>
      </svg>
    ),
  },
  {
    name: "Hyundai",
    svg: (
      <svg className="h-7 w-auto" viewBox="0 0 120 24" fill="currentColor">
        <text x="0" y="18" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="3">
          HYUNDAI
        </text>
      </svg>
    ),
  },
  {
    name: "BYD",
    svg: (
      <svg className="h-7 w-auto" viewBox="0 0 60 24" fill="currentColor">
        <text x="0" y="18" fontSize="20" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="2">
          BYD
        </text>
      </svg>
    ),
  },
  {
    name: "Kia",
    svg: (
      <svg className="h-7 w-auto" viewBox="0 0 60 24" fill="currentColor">
        <text x="0" y="18" fontSize="20" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="3">
          KIA
        </text>
      </svg>
    ),
  },
];

const BrandLogos = () => {
  return (
    <section className="border-t border-[#E5E5E5] bg-white py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-[#ACACAC]">
          Các thương hiệu xe điện trên nền tảng
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:justify-between">
          {evBrands.map((brand) => (
            <div
              key={brand.name}
              className="text-[#ACACAC] opacity-60 transition-all duration-200 hover:text-[#1572D3] hover:opacity-100"
              aria-label={brand.name}
            >
              {brand.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
