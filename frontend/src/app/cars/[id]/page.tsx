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
  MessageCircle,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneRevealButton } from "@/components/cars/PhoneRevealButton";
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

  // Mock data for enhanced UI
  const carDetails = {
    year: 2024,
    mileage: 35000,
    engineType: "Hybrid",
    fuelType: "Xăng Điện",
    color: "Trắng Ngọc Trai",
    platePrefix: "51L",
    pricePerMonth: car.price * 30 * 0.9, // 10% discount for monthly
    marketPriceMin: car.price * 0.95,
    marketPriceMax: car.price * 1.15,
  };

  const ownerInfo = {
    name: "Trung tâm cho thuê xe EcoRent",
    avatar: "/Logo.png",
    rating: 5,
    reviewCount: 3,
    totalRentals: 230,
    activeListings: 17,
    isOnline: true,
    responseRate: 78,
    location: "Quận 7, TP Hồ Chí Minh",
    memberSince: "2023",
  };

  // Mock multiple images
  const carImages = [
    car.image,
    car.image,
    car.image,
    car.image,
    car.image,
    car.image,
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#747474] transition-colors hover:text-[#1572D3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách xe
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Car Image Gallery */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* Main Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                {/* Navigation Arrows */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50">
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white">
                  1 / {carImages.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto p-4">
                {carImages.map((img, index) => (
                  <button
                    key={index}
                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === 0
                        ? "border-[#1572D3]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${car.name} - Ảnh ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="rounded-full bg-white/90 p-1">
                          <svg
                            className="h-4 w-4 text-[#1572D3]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#242424]">
                Mô tả chi tiết
              </h2>
              <div className="mt-4 space-y-2 text-sm text-[#747474]">
                <p className="font-medium text-[#242424]">
                  {car.name} ({carDetails.fuelType})
                </p>
                <ul className="space-y-1">
                  <li>-Sản xuất: {carDetails.year}</li>
                  <li>-Màu: {carDetails.color}</li>
                  <li>-BS: {carDetails.platePrefix}-XXX.xx</li>
                  <li>-Odo: {carDetails.mileage.toLocaleString()} Km</li>
                  <li>-Pháp Lý: Cá Nhân</li>
                </ul>
              </div>

              <div className="mt-6 border-t border-[#E5E5E5] pt-6">
                <h3 className="font-semibold text-[#242424]">
                  CAM KẾT CHẤT LƯỢNG
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-[#747474]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    Xe được kiểm tra kỹ thuật định kỳ
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    Bảo hiểm đầy đủ theo quy định
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    Hỗ trợ 24/7 trong suốt thời gian thuê
                  </li>
                </ul>
              </div>
            </div>

            {/* Specifications */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#242424]">
                Thông số kỹ thuật
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                  <Users className="h-6 w-6 text-[#1572D3]" />
                  <span className="mt-2 text-sm font-medium text-[#242424]">
                    {car.passengers} chỗ ngồi
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
                    {car.airConditioning ? "Điều hòa" : "Không điều hòa"}
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-[#F8FAFC] p-4">
                  <DoorOpen className="h-6 w-6 text-[#1572D3]" />
                  <span className="mt-2 text-sm font-medium text-[#242424]">
                    {car.doors} cửa
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#242424]">
                Tiện ích xe
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  "Định vị GPS",
                  "Bluetooth",
                  "Sạc USB",
                  "Camera lùi",
                  "Kiểm soát hành trình",
                  "Ghế da cao cấp",
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
          </div>

          {/* Sidebar - Pricing & Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                {/* Title + Save Button */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold text-[#242424]">
                    {car.name} - {carDetails.color}
                  </h1>
                  <button className="flex-shrink-0 rounded-lg border border-[#E5E5E5] p-2 transition-colors hover:border-[#1572D3] hover:text-[#1572D3]">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick Info Tags */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#747474]">
                  <span>{carDetails.year}</span>
                  <span>•</span>
                  <span>{carDetails.mileage.toLocaleString()} km</span>
                  <span>•</span>
                  <span>Động cơ {carDetails.engineType}</span>
                  <span>•</span>
                  <span>{car.transmission}</span>
                </div>

                {/* Price Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded bg-[#E8F4FD] px-2 py-1 text-xs font-medium text-[#1572D3]">
                    Giá tốt
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-[#747474]">
                    1 chủ
                  </span>
                </div>

                {/* Main Price */}
                <div className="mt-4">
                  <p className="text-3xl font-bold text-[#1572D3]">
                    {formatUsd(car.price)}
                    <span className="text-base font-normal text-[#747474]">
                      /ngày
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#747474]">
                    (Trả góp từ {formatUsd(carDetails.pricePerMonth / 30)}
                    /ngày)
                  </p>
                </div>

                {/* Market Price Range */}
                <div className="mt-4 rounded-lg border border-[#E5E5E5] p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#747474]">
                      Khoảng giá thị trường
                    </span>
                    <Info className="h-4 w-4 text-[#B6B6B6]" />
                  </div>
                  <div className="relative mt-8">
                    {/* Price tag positioned above the dot */}
                    <div
                      className="absolute -top-7 -translate-x-1/2"
                      style={{ left: "30%" }}
                    >
                      <span className="whitespace-nowrap rounded bg-[#1572D3] px-2 py-1 text-xs font-medium text-white">
                        {formatUsd(car.price)}
                      </span>
                    </div>
                    {/* Progress bar with gradient */}
                    <div className="relative h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400">
                      <div
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1572D3] shadow"
                        style={{ left: "30%" }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-[#747474]">
                      <span>{formatUsd(carDetails.marketPriceMin)}</span>
                      <span>{formatUsd(carDetails.marketPriceMax)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 border-[#E5E5E5] text-[#242424] hover:border-[#1572D3] hover:text-[#1572D3]"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat
                  </Button>
                  <PhoneRevealButton
                    phoneNumber="0764912345"
                    maskedPhone="076491****"
                  />
                </div>

                {/* Location */}
                <div className="mt-4 flex items-start gap-2 text-sm text-[#747474]">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1572D3]" />
                  <div>
                    <p className="font-medium text-[#242424]">
                      {ownerInfo.location}
                    </p>
                    <p className="text-xs">TP Hồ Chí Minh mới</p>
                  </div>
                </div>

                {/* Post Time */}
                <div className="mt-3 flex items-center gap-2 text-sm text-[#747474]">
                  <Clock className="h-4 w-4" />
                  <span>Đăng 1 tháng trước</span>
                </div>
              </div>

              {/* Owner Card */}
              <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#F5F5F5]">
                    <Image
                      src={ownerInfo.avatar}
                      alt={ownerInfo.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[#242424]">
                      {ownerInfo.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
                        <span className="font-medium">{ownerInfo.rating}</span>
                      </div>
                      <span className="text-[#747474]">
                        ({ownerInfo.reviewCount} Đánh giá)
                      </span>
                      <span className="text-[#747474]">•</span>
                      <span className="text-[#747474]">
                        {ownerInfo.totalRentals} đã bán
                      </span>
                      <span className="text-[#747474]">•</span>
                      <span className="text-[#747474]">
                        {ownerInfo.activeListings} đang bán
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-[#747474]">Đang hoạt động</span>
                  </div>
                  <div className="text-[#747474]">
                    Phản hồi {ownerInfo.responseRate}%
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-[#747474]">Nhắn hỏi mua hàng...</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full border border-[#E5E5E5] px-3 py-1.5 text-xs text-[#747474] transition-colors hover:border-[#1572D3] hover:text-[#1572D3]">
                      Xe này còn không ạ?
                    </button>
                    <button className="rounded-full border border-[#E5E5E5] px-3 py-1.5 text-xs text-[#747474] transition-colors hover:border-[#1572D3] hover:text-[#1572D3]">
                      Xe chính chủ hay được uỷ quyền?
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#1572D3]"
                  />
                  <Button className="bg-[#FF6B00] px-4 text-white hover:bg-[#E56000]">
                    Gửi
                  </Button>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="rounded-xl bg-[#FFF8E6] p-4">
                <p className="text-xs text-[#996600]">
                  <strong>Lưu ý an toàn:</strong> Luôn xác minh xe và chủ xe
                  trước khi thanh toán. Gặp mặt tại địa điểm công cộng an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#242424]">Xe tương tự</h2>
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
                      /ngày
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
