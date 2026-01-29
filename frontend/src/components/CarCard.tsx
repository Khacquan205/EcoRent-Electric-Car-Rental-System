import Image from "next/image";
import Link from "next/link";
import { Car, formatVnd } from "@/lib/mockCars";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link
        href={`/cars/${car.id}`}
        className="block overflow-hidden rounded-xl"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={car.images[0]}
            alt={car.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>
      </Link>
      <h3 className="mt-3 text-lg font-semibold text-gray-900">
        <Link href={`/cars/${car.id}`}>{car.name}</Link>
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {car.seats} chỗ • {car.transmission} • {car.rangeKm} km
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-700">
        {formatVnd(car.pricePerDay)} / ngày
      </p>
    </div>
  );
};

export default CarCard;
