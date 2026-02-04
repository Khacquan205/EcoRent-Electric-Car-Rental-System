import Image from "next/image";
import { Star } from "lucide-react";
import { FeedbackData } from "@/lib/data/feedbacks";

interface FeedbackCardProps {
  feedback: FeedbackData;
}

const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg md:flex-row">
      {/* Image */}
      <div className="relative h-48 w-full shrink-0 md:h-auto md:w-48">
        <Image
          src={feedback.image}
          alt={feedback.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center p-6">
        {/* Rating */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#242424]">
            {feedback.rating.toFixed(1)}
          </span>
          <span className="text-lg text-[#747474]">stars</span>
        </div>
        <div className="mt-1 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
          ))}
        </div>

        {/* Review Text */}
        <p className="mt-4 text-sm leading-relaxed text-[#747474]">
          &ldquo;{feedback.review}&rdquo;
        </p>

        {/* Author */}
        <div className="mt-4">
          <p className="font-semibold text-[#242424]">{feedback.name}</p>
          <p className="text-sm text-[#747474]">{feedback.location}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
