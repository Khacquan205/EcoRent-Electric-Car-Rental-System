import Image from "next/image";
import Link from "next/link";
import { Star, Users, Gauge, Wind, DoorOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarData } from "@/lib/data/cars";

interface CarCardProps {
  car: CarData;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="group rounded-2xl border border-[#E5E5E5] bg-white p-4 transition-shadow hover:shadow-lg">
      {/* Car Image */}
      <Link href={`/cars/${car.id}`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F5F5F5]">
          <Image
            src={car.image}
            alt={car.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Car Info */}
      <div className="mt-4">
        <span className="inline-block rounded-full bg-[#E8F4FD] px-3 py-1 text-xs font-medium text-[#1572D3]">
          {car.brand}
        </span>
        <Link href={`/cars/${car.id}`}>
          <h3 className="mt-2 text-lg font-semibold text-[#242424] hover:text-[#1572D3] transition-colors">
            {car.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
          <span className="text-sm font-medium text-[#242424]">
            {car.rating}
          </span>
          <span className="text-sm text-[#747474]">
            ({car.reviews} reviews)
          </span>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#747474]">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{car.passengers} Passengers</span>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          <span>{car.transmission}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4" />
          <span>Air Conditioning</span>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="h-4 w-4" />
          <span>{car.doors} Doors</span>
        </div>
      </div>

      {/* Price and Button */}
      <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E5] pt-4">
        <div>
          <span className="text-sm text-[#747474]">Price</span>
          <p className="text-lg font-bold text-[#242424]">
            ${car.price.toLocaleString()}
            <span className="text-sm font-normal text-[#747474]">/day</span>
          </p>
        </div>
        <Link href={`/cars/${car.id}`}>
          <Button className="bg-[#1572D3] text-white hover:bg-[#1260B0]">
            Rent Now
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
