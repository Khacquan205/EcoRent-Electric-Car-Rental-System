import Image from "next/image";
import Link from "next/link";
import { Car, formatVnd } from "@/lib/mockCars";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <div className="group rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
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
      <h3 className="mt-3 line-clamp-1 text-lg font-semibold">
        <Link href={`/cars/${car.id}`} className="transition-colors group-hover:text-primary">
          {car.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {car.seats} chỗ • {car.transmission} • {car.rangeKm} km
      </p>
      <p className="mt-2 text-sm font-semibold text-primary">
        {formatVnd(car.pricePerDay)} / ngày
      </p>
    </div>
  );
};

export default CarCard;
