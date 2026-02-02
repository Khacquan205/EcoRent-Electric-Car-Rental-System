"use client";

import { MapPin, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="container mx-auto px-6 pb-12">
      <div className="relative -mt-4 rounded-2xl bg-white p-6 shadow-lg lg:p-8">
        <div className="grid gap-4 md:grid-cols-4 md:items-end">
          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#484848]">
              <MapPin className="h-4 w-4 text-[#747474]" />
              Location
            </label>
            <Input
              type="text"
              placeholder="Search your location"
              className="h-12 border-[#E5E5E5] bg-white text-[#242424] placeholder:text-[#ACACAC] focus-visible:ring-[#1572D3]"
            />
          </div>

          {/* Pickup Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#484848]">
              <Calendar className="h-4 w-4 text-[#747474]" />
              Pickup date
            </label>
            <Input
              type="text"
              placeholder="Tue 15 Feb, 09:00"
              className="h-12 border-[#E5E5E5] bg-white text-[#242424] placeholder:text-[#ACACAC] focus-visible:ring-[#1572D3]"
            />
          </div>

          {/* Return Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#484848]">
              <Calendar className="h-4 w-4 text-[#747474]" />
              Return date
            </label>
            <Input
              type="text"
              placeholder="Thu 16 Feb, 11:00"
              className="h-12 border-[#E5E5E5] bg-white text-[#242424] placeholder:text-[#ACACAC] focus-visible:ring-[#1572D3]"
            />
          </div>

          {/* Search Button */}
          <Button className="h-12 bg-[#1572D3] text-base font-semibold text-white hover:bg-[#1260B0]">
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
