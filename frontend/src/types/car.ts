/**
 * Car data for listing/cards
 */
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

/**
 * Car review
 */
export interface CarReview {
  id: number;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
}

/**
 * Car owner info
 */
export interface CarOwner {
  name: string;
  location: string;
  phone: string;
  responseRate: string;
}

/**
 * Car detail page data
 */
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
