// Re-export types from centralized location
export type { CarData, CarReview, CarOwner, CarDetail } from "@/types/car";
import type { CarData, CarDetail } from "@/types/car";

export const popularCars: CarData[] = [
  {
    id: "vinfast-vf8",
    name: "VinFast VF 8",
    brand: "VinFast",
    image: "/car item/image 11.png",
    rating: 4.8,
    reviews: "128",
    passengers: 5,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 1500000,
  },
  {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    brand: "Tesla",
    image: "/car item/Audi 1 (1).png",
    rating: 4.9,
    reviews: "214",
    passengers: 5,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 2000000,
  },
  {
    id: "hyundai-ioniq5",
    name: "Hyundai Ioniq 5",
    brand: "Hyundai",
    image: "/car item/image 12.png",
    rating: 4.7,
    reviews: "96",
    passengers: 5,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 1800000,
  },
  {
    id: "kia-ev6",
    name: "Kia EV6",
    brand: "Kia",
    image: "/car item/image 13.png",
    rating: 4.6,
    reviews: "74",
    passengers: 5,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 1700000,
  },
];

// Mock data for car listing page
export const cars: CarDetail[] = [
  {
    id: "vinfast-vf8",
    name: "VinFast VF 8",
    images: ["/car item/image 11.png"],
    location: "Hồ Chí Minh",
    seats: 5,
    transmission: "Tự động",
    rangeKm: 400,
    features: ["GPS", "Camera 360", "Cảm biến va chạm", "Điều hòa tự động"],
    pricePerDay: 1500000,
    ratingAvg: 4.8,
    reviewCount: 24,
    reviews: [
      {
        id: 1,
        authorName: "Nguyễn Văn A",
        rating: 5,
        content: "Xe rất mới, chủ xe thân thiện.",
        createdAt: "2025-12-01",
      },
    ],
    owner: {
      name: "Trần Minh",
      location: "Quận 1, HCM",
      phone: "0909 123 456",
      responseRate: "95%",
    },
  },
  {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    images: ["/car item/Audi 1 (1).png"],
    location: "Hà Nội",
    seats: 5,
    transmission: "Tự động",
    rangeKm: 500,
    features: ["Autopilot", "Sạc nhanh", "Màn hình cảm ứng 15 inch"],
    pricePerDay: 2000000,
    ratingAvg: 4.9,
    reviewCount: 42,
    reviews: [
      {
        id: 1,
        authorName: "Lê Thị B",
        rating: 5,
        content: "Trải nghiệm tuyệt vời!",
        createdAt: "2025-11-20",
      },
    ],
    owner: {
      name: "Phạm Hùng",
      location: "Cầu Giấy, Hà Nội",
      phone: "0912 345 678",
      responseRate: "98%",
    },
  },
  {
    id: "hyundai-ioniq-5",
    name: "Hyundai Ioniq 5",
    images: ["/car item/image 12.png"],
    location: "Đà Nẵng",
    seats: 5,
    transmission: "Tự động",
    rangeKm: 450,
    features: ["V2L", "Sạc nhanh 800V", "Ghế thông gió"],
    pricePerDay: 1800000,
    ratingAvg: 4.7,
    reviewCount: 18,
    reviews: [
      {
        id: 1,
        authorName: "Hoàng Văn C",
        rating: 4,
        content: "Xe đẹp, tiết kiệm điện.",
        createdAt: "2025-10-15",
      },
    ],
    owner: {
      name: "Nguyễn Lan",
      location: "Hải Châu, Đà Nẵng",
      phone: "0905 678 901",
      responseRate: "90%",
    },
  },
];

// Helper functions
export const getCarById = (id: string): CarDetail | undefined => {
  return cars.find((car) => car.id === id);
};

export const getPopularCarById = (id: string): CarData | undefined => {
  return popularCars.find((car) => car.id === id);
};

export const formatVnd = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "₫";
};

export const formatUsd = (amount: number): string => {
  return "$" + amount.toLocaleString("en-US");
};
