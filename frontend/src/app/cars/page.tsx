import CarCard from "@/components/CarCard";
import { cars } from "@/lib/mockCars";

export default function CarsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Sản phẩm</h1>
          <p className="text-muted-foreground">
            Danh sách xe điện (mock data) để bạn xem UI.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
