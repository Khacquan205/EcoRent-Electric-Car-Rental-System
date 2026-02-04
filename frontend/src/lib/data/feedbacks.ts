export interface FeedbackData {
  name: string;
  location: string;
  rating: number;
  image: string;
  review: string;
}

export const feedbacks: FeedbackData[] = [
  {
    name: "Wilson",
    location: "From New York, US",
    rating: 5.0,
    image: "/feedback/Rectangle 8.png",
    review:
      "I've been using your services for years. Your service is great, I will continue to use your service.",
  },
  {
    name: "Charlie Johnson",
    location: "From New York, US",
    rating: 5.0,
    image: "/feedback/Rectangle 8_1.png",
    review:
      "I feel very secure when using caretall's services. Your customer care team is very enthusiastic and the driver is always on time.",
  },
  {
    name: "Emily Davis",
    location: "From New York, US",
    rating: 5.0,
    image: "/feedback/Rectangle 8_2.png",
    review:
      "The service exceeded my expectations. Easy booking process and the car was in perfect condition. Highly recommended!",
  },
];
