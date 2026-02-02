import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative overflow-visible bg-gradient-to-br from-white via-white to-blue-50">
      <div className="px-6 py-12 lg:px-12 lg:py-20 xl:px-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#242424] md:text-5xl lg:text-6xl">
              Find, book and <br />
              rent a car{" "}
              <span className="relative text-[#1572D3]">
                Easily
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 120 8"
                  fill="none"
                >
                  <path
                    d="M2 6C20 2 60 2 118 6"
                    stroke="#1572D3"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#747474]">
              Get a car wherever and whenever you need it with your IOS and
              Android device.
            </p>

            {/* App Store Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#242424] px-4 text-white transition-transform hover:scale-105"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.523 2H6.477C3.467 2 1 4.467 1 7.477v9.046C1 19.533 3.467 22 6.477 22h11.046C20.533 22 23 19.533 23 16.523V7.477C23 4.467 20.533 2 17.523 2zM8.5 17.5l-1-1L11 13l-3.5-3.5 1-1L13 13l-4.5 4.5zm8 0l-4.5-4.5L16.5 8.5l1 1L14 13l3.5 3.5-1 1z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase leading-tight opacity-80">
                    Get it on
                  </div>
                  <div className="text-sm font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </Link>
              <Link
                href="#"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#242424] px-4 text-white transition-transform hover:scale-105"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase leading-tight opacity-80">
                    Download on the
                  </div>
                  <div className="text-sm font-semibold leading-tight">
                    App Store
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Content - Car Image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Background Frame */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 lg:-right-12 xl:-right-20">
              <Image
                src="/Frame.png"
                alt=""
                width={700}
                height={700}
                className="h-[400px] w-auto opacity-100 md:h-[500px] lg:h-[600px] xl:h-[700px]"
                priority
              />
            </div>
            {/* Car Image */}
            <div className="relative z-10 h-[300px] w-full max-w-[800px] md:h-[400px] lg:h-[500px] lg:-mr-12 xl:-mr-20">
              <Image
                src="/car 2 1.png"
                alt="Blue Porsche sports car"
                fill
                className="object-contain object-right"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
