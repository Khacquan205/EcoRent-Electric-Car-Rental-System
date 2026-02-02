import Image from "next/image";
import { BadgeDollarSign, UserCheck, Truck, Headphones } from "lucide-react";
import FeatureItem from "@/components/shared/FeatureItem";

const features = [
  {
    icon: BadgeDollarSign,
    title: "Best price guaranteed",
    description: "Find a lower price? We'll refund you 100% of the difference.",
  },
  {
    icon: UserCheck,
    title: "Experience driver",
    description:
      "Don't have driver? Don't worry, we have many experienced driver for you.",
  },
  {
    icon: Truck,
    title: "24 hour car delivery",
    description:
      "Book your car anytime and we will deliver it directly to you.",
  },
  {
    icon: Headphones,
    title: "24/7 technical support",
    description:
      "Have a question? Contact EcoRent support any time when you have problem.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      {/* Background Triangle Shape */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
        <Image
          src="/Vector.png"
          alt=""
          width={600}
          height={600}
          className="h-[500px] w-auto opacity-100 lg:h-[700px]"
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content - Car Image */}
          <div className="relative flex items-center justify-start">
            <div className="relative z-10 -ml-12 h-[300px] w-full max-w-[600px] md:h-[400px]">
              <Image
                src="/Audi 1.png"
                alt="Silver Audi R8 sports car"
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </div>

          {/* Right Content */}
          <div>
            {/* Section Header */}
            <span className="inline-flex items-center rounded-full border border-[#1572D3] px-4 py-2 text-sm font-medium text-[#1572D3]">
              WHY CHOOSE US
            </span>
            <h2 className="mt-6 text-3xl font-bold text-[#242424] md:text-4xl">
              We offer the best experience
              <br />
              with our rental deals
            </h2>

            {/* Features List */}
            <div className="mt-8 space-y-6">
              {features.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
