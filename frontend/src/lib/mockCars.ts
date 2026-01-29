export type CarOwner = {
  id: string;
  name: string;
  phone: string;
  location: string;
  responseRate: string;
};

export type CarReview = {
  id: string;
  authorName: string;
  rating: number;
  createdAt: string;
  content: string;
};

export type Car = {
  id: string;
  name: string;
  brand: string;
  seats: number;
  rangeKm: number;
  transmission: "Auto" | "Manual";
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  owner: CarOwner;
  ratingAvg: number;
  reviewCount: number;
  reviews: CarReview[];
};

export const cars: Car[] = [
  {
    id: "vf5",
    name: "VinFast VF 5",
    brand: "VinFast",
    seats: 5,
    rangeKm: 326,
    transmission: "Auto",
    pricePerDay: 650000,
    location: "TP. Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1601999109332-542f5d5f6f74?auto=format&fit=crop&w=1600&q=80",
    ],
    features: ["Điều hòa", "Camera lùi", "CarPlay", "Sạc nhanh"],
    owner: {
      id: "o1",
      name: "Anh Minh",
      phone: "0901 234 567",
      location: "Quận 7, TP.HCM",
      responseRate: "~5 phút",
    },
    ratingAvg: 4.7,
    reviewCount: 18,
    reviews: [
      {
        id: "r1",
        authorName: "Hà",
        rating: 5,
        createdAt: "2026-01-10",
        content: "Xe sạch, pin tốt, chủ xe hỗ trợ nhiệt tình. Đi trong phố rất hợp!",
      },
      {
        id: "r2",
        authorName: "Tuấn",
        rating: 4,
        createdAt: "2026-01-02",
        content: "Thủ tục nhận xe nhanh, xe chạy êm. Giá ổn so với mặt bằng.",
      },
    ],
  },
  {
    id: "e34",
    name: "VinFast VF e34",
    brand: "VinFast",
    seats: 5,
    rangeKm: 318,
    transmission: "Auto",
    pricePerDay: 700000,
    location: "Hà Nội",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80",
    ],
    features: ["Cruise control", "Camera 360", "Sạc nhanh", "Màn hình lớn"],
    owner: {
      id: "o2",
      name: "Chị Lan",
      phone: "0987 654 321",
      location: "Cầu Giấy, Hà Nội",
      responseRate: "~10 phút",
    },
    ratingAvg: 4.6,
    reviewCount: 25,
    reviews: [
      {
        id: "r1",
        authorName: "Long",
        rating: 5,
        createdAt: "2026-01-15",
        content: "Xe rộng, phù hợp gia đình. Chủ xe hướng dẫn sạc rất kỹ.",
      },
    ],
  },
  {
    id: "mini-ev",
    name: "Wuling Mini EV",
    brand: "Wuling",
    seats: 4,
    rangeKm: 170,
    transmission: "Auto",
    pricePerDay: 450000,
    location: "Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1593941707882-a5bba53b3f2f?auto=format&fit=crop&w=1600&q=80",
    ],
    features: ["Nhỏ gọn", "Dễ đỗ", "Tiết kiệm", "Phù hợp nội đô"],
    owner: {
      id: "o3",
      name: "Anh Huy",
      phone: "0912 222 333",
      location: "Hải Châu, Đà Nẵng",
      responseRate: "~3 phút",
    },
    ratingAvg: 4.4,
    reviewCount: 12,
    reviews: [
      {
        id: "r1",
        authorName: "My",
        rating: 4,
        createdAt: "2026-01-20",
        content: "Xe xinh, chạy trong phố ok. Pin vừa đủ đi chơi 1 ngày.",
      },
    ],
  },
];

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCarById(id: string) {
  return cars.find((c) => c.id === id);
}
