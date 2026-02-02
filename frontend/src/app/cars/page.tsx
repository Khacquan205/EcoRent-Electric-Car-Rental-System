import { CarCard } from "@/components/cards";
import { popularCars } from "@/lib/data";

export default function CarsPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600">
            Danh sách xe điện (mock data) để bạn xem UI.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
