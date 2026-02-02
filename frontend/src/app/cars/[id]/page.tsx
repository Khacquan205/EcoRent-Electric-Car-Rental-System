import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Users,
  Gauge,
  Wind,
  DoorOpen,
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPopularCarById, formatUsd, popularCars } from "@/lib/data";
import { notFound } from "next/navigation";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = getPopularCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#747474] transition-colors hover:text-[#1572D3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Car Image */}
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#F5F5F5]">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            </div>

            {/* Car Details */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-[#242424] lg:text-3xl">
                {car.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(car.rating)
                          ? "fill-[#FFC107] text-[#FFC107]"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-[#242424]">
                  {car.rating}
                </span>
                <span className="text-[#747474]">({car.reviews} reviews)</span>
              </div>

              {/* Specifications */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#242424]">
                  Specifications
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                    <Users className="h-6 w-6 text-[#1572D3]" />
                    <span className="mt-2 text-sm font-medium text-[#242424]">
                      {car.passengers} Passengers
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                    <Gauge className="h-6 w-6 text-[#1572D3]" />
                    <span className="mt-2 text-sm font-medium text-[#242424]">
                      {car.transmission}
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                    <Wind className="h-6 w-6 text-[#1572D3]" />
                    <span className="mt-2 text-sm font-medium text-[#242424]">
                      {car.airConditioning ? "AC" : "No AC"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                    <DoorOpen className="h-6 w-6 text-[#1572D3]" />
                    <span className="mt-2 text-sm font-medium text-[#242424]">
                      {car.doors} Doors
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#242424]">
                  Features
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    "GPS Navigation",
                    "Bluetooth",
                    "USB Charger",
                    "Backup Camera",
                    "Cruise Control",
                    "Leather Seats",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-[#747474]"
                    >
                      <Shield className="h-4 w-4 text-[#1572D3]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#242424]">
                  Description
                </h2>
                <p className="mt-3 leading-relaxed text-[#747474]">
                  Experience luxury and performance with the {car.name}. This
                  premium vehicle offers exceptional comfort, cutting-edge
                  technology, and impressive driving dynamics. Perfect for
                  business trips, special occasions, or simply enjoying the open
                  road in style.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              {/* Price */}
              <div className="text-center">
                <span className="text-sm text-[#747474]">Price per day</span>
                <p className="mt-1 text-3xl font-bold text-[#1572D3]">
                  {formatUsd(car.price)}
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-[#E5E5E5]" />

              {/* Date Selection */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#242424]">
                    Pick-up Date
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2">
                    <Calendar className="h-4 w-4 text-[#747474]" />
                    <input
                      type="date"
                      className="w-full text-sm text-[#242424] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#242424]">
                    Return Date
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2">
                    <Calendar className="h-4 w-4 text-[#747474]" />
                    <input
                      type="date"
                      className="w-full text-sm text-[#242424] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#242424]">
                    Pick-up Location
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2">
                    <MapPin className="h-4 w-4 text-[#747474]" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      className="w-full text-sm text-[#242424] outline-none placeholder:text-[#B6B6B6]"
                    />
                  </div>
                </div>
              </div>

              {/* Rent Button */}
              <Button className="mt-6 w-full bg-[#1572D3] py-6 text-white hover:bg-[#1260B0]">
                Book Now
              </Button>

              {/* Contact Owner */}
              <div className="mt-6 rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm font-medium text-[#242424]">
                  Have questions?
                </p>
                <p className="mt-1 text-xs text-[#747474]">
                  Contact the car owner directly
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#1572D3] text-[#1572D3]"
                  >
                    <Phone className="mr-1 h-4 w-4" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#1572D3] text-[#1572D3]"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Chat
                  </Button>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="mt-4 rounded-xl bg-[#FFF8E6] p-4">
                <p className="text-xs text-[#996600]">
                  <strong>Safety Tip:</strong> Always verify the car and owner
                  before making any payment. Meet in a safe, public location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#242424]">Similar Cars</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularCars
              .filter((c) => c.id !== car.id)
              .slice(0, 4)
              .map((similarCar) => (
                <Link
                  key={similarCar.id}
                  href={`/cars/${similarCar.id}`}
                  className="group overflow-hidden rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#F5F5F5]">
                    <Image
                      src={similarCar.image}
                      alt={similarCar.name}
                      fill
                      className="object-contain p-2"
                      sizes="25vw"
                    />
                  </div>
                  <h3 className="mt-3 font-semibold text-[#242424] group-hover:text-[#1572D3]">
                    {similarCar.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
                    <span className="text-sm text-[#747474]">
                      {similarCar.rating}
                    </span>
                  </div>
                  <p className="mt-2 font-bold text-[#1572D3]">
                    {formatUsd(similarCar.price)}
                    <span className="text-sm font-normal text-[#747474]">
                      /day
                    </span>
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
