import {
  CircleCheckBig,
  CalendarDays,
  Car,
  CreditCard,
  KeyRound,
  MapPin,
  Shield,
  Clock,
  Headphones,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const mainSteps = [
  {
    step: 1,
    icon: MapPin,
    title: "Choose Your Location",
    description:
      "Enter your pickup location and browse through our wide selection of available vehicles in your area. Filter by type, brand, or price to find your perfect match.",
  },
  {
    step: 2,
    icon: CalendarDays,
    title: "Select Date & Time",
    description:
      "Pick your preferred pickup and return dates. Our flexible scheduling allows you to rent for as short as a few hours or as long as several months.",
  },
  {
    step: 3,
    icon: CircleCheckBig,
    title: "Choose Your Vehicle",
    description:
      "Browse detailed specifications, photos, and reviews. Compare different vehicles and select the one that best fits your needs and budget.",
  },
  {
    step: 4,
    icon: CreditCard,
    title: "Complete Booking",
    description:
      "Secure your reservation with our safe payment system. You'll receive instant confirmation and all the details you need for pickup.",
  },
  {
    step: 5,
    icon: KeyRound,
    title: "Pick Up & Drive",
    description:
      "Meet the owner at your chosen location, complete a quick inspection, and you're ready to hit the road. Enjoy your journey!",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Owners",
    description:
      "All car owners are verified for your safety and peace of mind.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Book anytime, anywhere. Our platform is always available.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Our dedicated support team is ready to help whenever you need.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "All transactions are protected with bank-level security.",
  },
];

const faqs = [
  {
    question: "What documents do I need to rent a car?",
    answer:
      "You'll need a valid driver's license, a government-issued ID, and a credit/debit card for the security deposit.",
  },
  {
    question: "Is insurance included in the rental?",
    answer:
      "Basic insurance is included with all rentals. Additional coverage options are available at checkout for extra peace of mind.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking up to 24 hours before the pickup time for a full refund. Late cancellations may incur a fee.",
  },
  {
    question: "What happens if the car breaks down?",
    answer:
      "We provide 24/7 roadside assistance. Simply contact our support team, and we'll arrange for help or a replacement vehicle.",
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1572D3] to-[#0D4F8C] py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            HOW IT WORKS
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white lg:text-5xl">
            Rent a Car in 5 Easy Steps
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            EcoRent makes car rental simple, safe, and affordable. Follow these
            easy steps to get on the road in no time.
          </p>
        </div>
      </section>

      {/* Main Steps Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="space-y-12 lg:space-y-16">
            {mainSteps.map((step, index) => (
              <div
                key={step.step}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Step Number & Icon */}
                <div className="flex flex-1 justify-center">
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-[#E8F4FD] lg:h-40 lg:w-40">
                      <step.icon className="h-16 w-16 text-[#1572D3] lg:h-20 lg:w-20" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1572D3] text-lg font-bold text-white shadow-lg">
                      {step.step}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-[#242424] lg:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-[#747474]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#F8FAFC] py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              WHY CHOOSE US
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#242424] lg:text-4xl">
              The EcoRent Advantage
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#747474]">
              We go above and beyond to ensure your rental experience is
              seamless and enjoyable.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8F4FD]">
                  <feature.icon className="h-7 w-7 text-[#1572D3]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#242424]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#747474]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              FAQ
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#242424] lg:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#747474]">
              Got questions? We&apos;ve got answers. Here are some common
              questions about renting with EcoRent.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#E5E5E5] bg-white p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1572D3]" />
                  <div>
                    <h3 className="font-semibold text-[#242424]">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-sm text-[#747474]">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1572D3] py-16 lg:py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join thousands of happy customers who trust EcoRent for their car
            rental needs. Start your journey today!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/vehicles">
              <Button
                size="lg"
                className="bg-white text-[#1572D3] hover:bg-white/90"
              >
                Browse Vehicles
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
