import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { CarData } from "@/lib/data/cars";

interface CarCardProps {
  car: CarData;
}

const CarCard = ({ car }: CarCardProps) => {
  const priceDisplay =
    car.price >= 1000
      ? car.price.toLocaleString("vi-VN") + "₫"
      : "$" + car.price.toLocaleString();

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#1572D3]/25 hover:shadow-xl">
      {/* Image area — reference-style top image */}
      <Link href={`/posts/${car.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-slate-50">
          <Image
            src={car.image}
            alt={car.name}
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand + rating row */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#1572D3]">
            {car.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-700">
              {car.rating}
            </span>
            <span className="text-[11px] text-slate-400">({car.reviews})</span>
          </div>
        </div>

        {/* Model name */}
        <Link href={`/posts/${car.id}`}>
          <h3 className="mt-2 text-[15px] font-bold text-slate-900 transition-colors hover:text-[#1572D3]">
            {car.name}
          </h3>
        </Link>

        {/* Specs row — minimal, reference-inspired */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
          <span>{car.passengers} chỗ</span>
          <span className="h-2.5 w-px bg-slate-200" />
          <span>{car.transmission}</span>
          <span className="h-2.5 w-px bg-slate-200" />
          <span>{car.doors} cửa</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA — reference-style bottom row */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Bắt đầu từ
            </p>
            <p className="text-base font-black text-slate-900">
              {priceDisplay}
              <span className="text-xs font-normal text-slate-400">/ngày</span>
            </p>
          </div>

          <Link href={`/posts/${car.id}`}>
            <button className="rounded-full bg-[#1572D3] px-5 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-[#1260B0] hover:shadow-md group-hover:shadow-[0_0_0_3px_rgba(21,114,211,0.15)]">
              Xem tin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
