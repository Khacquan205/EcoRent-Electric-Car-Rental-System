import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CarCard } from "@/components/cards";
import { popularCars } from "@/lib/data/cars";

const RentalDeals = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6">

        {/* Section header — reference-style: eyebrow + bold title inline */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1572D3]">
              Xe điện nổi bật
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              Xe điện được quan tâm nhiều nhất
            </h2>
          </div>
          <Link
            href="/cars"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1572D3] transition-colors hover:text-[#1260B0]"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Car grid — reference-style 4-column */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularCars.map((car, index) => (
            <div
              key={car.id}
              className={
                index === 1
                  ? "ring-2 ring-[#1572D3] ring-offset-2 rounded-2xl"
                  : ""
              }
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Hơn 500 xe điện từ khắp Việt Nam đang chờ bạn khám phá
        </p>
      </div>
    </section>
  );
};

export default RentalDeals;
