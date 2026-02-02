export interface CarData {
  id: string;
  name: string;
  brand: string;
  image: string;
  rating: number;
  reviews: string;
  passengers: number;
  transmission: string;
  airConditioning: boolean;
  doors: number;
  price: number;
}

export interface CarReview {
  id: number;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface CarOwner {
  name: string;
  location: string;
  phone: string;
  responseRate: string;
}

export interface CarDetail {
  id: string;
  name: string;
  images: string[];
  location: string;
  seats: number;
  transmission: string;
  rangeKm: number;
  features: string[];
  pricePerDay: number;
  ratingAvg: number;
  reviewCount: number;
  reviews: CarReview[];
  owner: CarOwner;
}

export const popularCars: CarData[] = [
  {
    id: "jaguar-xe-l-p250",
    name: "Jaguar XE L P250",
    brand: "Jaguar",
    image: "/car item/image 11.png",
    rating: 4.8,
    reviews: "2,436",
    passengers: 4,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 1800,
  },
  {
    id: "audi-r8",
    name: "Audi R8",
    brand: "Audi",
    image: "/car item/Audi 1 (1).png",
    rating: 4.6,
    reviews: "1,936",
    passengers: 2,
    transmission: "Auto",
    airConditioning: true,
    doors: 2,
    price: 2100,
  },
  {
    id: "bmw-m3",
    name: "BMW M3",
    brand: "BMW",
    image: "/car item/image 12.png",
    rating: 4.5,
    reviews: "2,036",
    passengers: 4,
    transmission: "Auto",
    airConditioning: true,
    doors: 4,
    price: 1600,
  },
  {
    id: "lamborghini-huracan",
    name: "Lamborghini Huracan",
    brand: "Lamborghini",
    image: "/car item/image 13.png",
    rating: 4.3,
    reviews: "2,236",
    passengers: 2,
    transmission: "Auto",
    airConditioning: true,
    doors: 2,
    price: 2300,
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
