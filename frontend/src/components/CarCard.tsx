import Image from "next/image";
import Link from "next/link";
import { CarData, formatVnd } from "@/lib/data/cars"; // Sửa lại đường dẫn và kiểu dữ liệu

interface Props {
  car: CarData; // Đổi Car thành CarData
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
            src={car.image}
            alt={car.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>
      </Link>
      <h3 className="mt-3 line-clamp-1 text-lg font-semibold">
        <Link
          href={`/cars/${car.id}`}
          className="transition-colors group-hover:text-primary"
        >
          {car.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {car.passengers} chỗ • {car.transmission} • {car.doors} cửa
      </p>
      <p className="mt-2 text-sm font-semibold text-primary">
        {formatVnd(car.price)} / ngày
      </p>
    </div>
  );
};

export default CarCard;
