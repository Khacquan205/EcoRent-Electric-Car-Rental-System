"use client";

import { useState, useMemo } from "react";
import { Car, X } from "lucide-react";
import { CarCard } from "@/components/cards";
import { popularCars } from "@/lib/data";

export default function CarsPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Get unique brands from cars data
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(popularCars.map((car) => car.brand))];
    return uniqueBrands.sort();
  }, []);

  // Filter cars based on search text and selected brand
  const filteredCars = useMemo(() => {
    return popularCars.filter((car) => {
      const matchesSearch =
        car.name.toLowerCase().includes(searchText.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchText.toLowerCase());
      const matchesBrand =
        selectedBrand === "all" || car.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [searchText, selectedBrand]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedBrand("all");
  };

  const hasActiveFilters = searchText || selectedBrand !== "all";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#242424] lg:text-4xl">
            Our Electric Cars
          </h1>
          <p className="mt-2 text-[#747474]">
            Find the perfect electric car for your next adventure
          </p>
        </div>

        {/* Filters Section */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-6.5 w-6.5 -translate-y-1/2 text-[#747474]"
              viewBox="0 0 500 500"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M184.5 303.5C231.168 303.5 269 265.668 269 219C269 172.332 231.168 134.5 184.5 134.5C137.832 134.5 100 172.332 100 219C100 265.668 137.832 303.5 184.5 303.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="30"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M247.5 281.5L303 337"
                fill="none"
                stroke="currentColor"
                strokeWidth="30"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M155 200C155 189 165 175 185 175"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M380 80L380 160"
                stroke="currentColor"
                strokeWidth="25"
                strokeLinecap="round"
              />
              <path
                d="M340 120L420 120"
                stroke="currentColor"
                strokeWidth="25"
                strokeLinecap="round"
              />
              <path
                d="M440 200L440 250"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M415 225L465 225"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M350 280L350 320"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M330 300L370 300"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by car name, brand..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-4 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
            />
          </div>

          {/* Brand Filter - Horizontal Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedBrand("all")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selectedBrand === "all"
                  ? "bg-[#1572D3] text-white shadow-md"
                  : "border border-[#E5E5E5] bg-white text-[#484848] hover:border-[#1572D3] hover:text-[#1572D3]"
              }`}
            >
              All vehicles
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedBrand === brand
                    ? "bg-[#1572D3] text-white shadow-md"
                    : "border border-[#E5E5E5] bg-white text-[#484848] hover:border-[#1572D3] hover:text-[#1572D3]"
                }`}
              >
                <Car className="h-4 w-4" />
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6">
          <p className="text-sm text-[#747474]">
            Showing{" "}
            <span className="font-semibold text-[#242424]">
              {filteredCars.length}
            </span>{" "}
            {filteredCars.length === 1 ? "car" : "cars"}
            {hasActiveFilters && " matching your filters"}
          </p>
        </div>

        {/* Cars Grid */}
        <div className="mt-6">
          {filteredCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16">
              <div className="text-6xl">🚗</div>
              <h3 className="mt-4 text-xl font-semibold text-[#242424]">
                No cars found
              </h3>
              <p className="mt-2 text-[#747474]">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-[#1572D3] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1260B0]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
