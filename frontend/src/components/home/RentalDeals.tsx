import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";
import { CarCard } from "@/components/cards";
import { popularCars } from "@/lib/data/cars";

const RentalDeals = () => {
  return (
    <section className="bg-[#F8FAFC] py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge="POPULAR RENTAL DEALS"
          title="Most popular cars rental deals"
        />

        {/* Car Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* Show All Button */}
        <div className="mt-10 flex justify-center">
          <Link href="/cars">
            <Button
              variant="outline"
              className="border-[#E5E5E5] text-[#484848] hover:bg-[#F5F5F5]"
            >
              Show all vehicles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RentalDeals;
