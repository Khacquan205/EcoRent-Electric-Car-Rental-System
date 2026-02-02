"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  DollarSign,
  Shield,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Smartphone,
  BadgeCheck,
  Wallet,
  HeadphonesIcon,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Extra Income",
    description:
      "Turn your idle car into a money-making asset. Earn up to $1,000+ per month by renting out your vehicle.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description:
      "Every trip is protected with comprehensive insurance coverage up to $1 million, giving you peace of mind.",
    color: "bg-blue-100 text-[#1572D3]",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description:
      "You're in control. Set your own availability and block dates when you need your car.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: BadgeCheck,
    title: "Verified Renters",
    description:
      "All renters are thoroughly verified with ID checks, driving history, and background screening.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Smartphone,
    title: "Easy Management",
    description:
      "Manage bookings, communicate with renters, and track earnings all from our intuitive app.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available around the clock to help you with any issues.",
    color: "bg-cyan-100 text-cyan-600",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Listing",
    description:
      "Sign up and list your car in minutes. Add photos, set your price, and describe your vehicle's features.",
    image: "/car item/Tesla Model 3.png",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Complete our quick verification process. We'll verify your identity and vehicle documents for safety.",
    image: "/car item/BMW iX3.png",
  },
  {
    number: "03",
    title: "Accept Bookings",
    description:
      "Review rental requests and accept the ones that work for you. You have full control over who rents your car.",
    image: "/car item/Porsche Taycan.png",
  },
  {
    number: "04",
    title: "Earn Money",
    description:
      "Hand over the keys and start earning. Payments are processed securely and deposited directly to your account.",
    image: "/car item/Mercedes EQS.png",
  },
];

const requirements = [
  "Vehicle must be less than 12 years old",
  "Clean title with no salvage history",
  "Valid vehicle registration and insurance",
  "Odometer reading under 130,000 miles",
  "Pass our vehicle inspection",
  "Maintain a minimum 4.0 star rating",
];

const testimonials = [
  {
    name: "Michael Chen",
    role: "Tesla Model 3 Owner",
    image: "/feedback/Avatar.png",
    rating: 5,
    earnings: "$1,250/month",
    quote:
      "I was skeptical at first, but EcoRent made it so easy. My Tesla practically pays for itself now. The insurance coverage gave me peace of mind.",
  },
  {
    name: "Sarah Williams",
    role: "BMW iX3 Owner",
    image: "/feedback/Avatar (1).png",
    rating: 5,
    earnings: "$980/month",
    quote:
      "As a remote worker, my car sat unused most days. Now it's earning money while I work from home. Best decision I've made!",
  },
  {
    name: "David Park",
    role: "Multiple Vehicle Owner",
    image: "/feedback/Avatar (2).png",
    rating: 5,
    earnings: "$3,400/month",
    quote:
      "I started with one car and now have three vehicles on EcoRent. It's become a significant income stream for my family.",
  },
];

const faqs = [
  {
    question: "How much can I earn renting my car?",
    answer:
      "Earnings vary based on your car's make, model, location, and availability. On average, our hosts earn between $500-$1,500 per month. Electric and luxury vehicles tend to earn more. You can use our earnings calculator to get an estimate for your specific vehicle.",
  },
  {
    question: "What insurance coverage is provided?",
    answer:
      "Every trip booked through EcoRent includes comprehensive insurance coverage up to $1 million. This covers collision damage, theft, and liability. Your personal auto insurance is not affected by rentals through our platform.",
  },
  {
    question: "Who is responsible for charging electric vehicles?",
    answer:
      "Renters are required to return electric vehicles with at least the same charge level as pickup. Clear charging instructions should be included in your listing. You can also specify charging requirements in your rental terms.",
  },
  {
    question: "Can I decline rental requests?",
    answer:
      "Absolutely! You have complete control over your vehicle. You can review each request and decline any that don't meet your criteria. However, maintaining a reasonable acceptance rate helps build your reputation on the platform.",
  },
  {
    question: "How and when do I get paid?",
    answer:
      "Payments are processed within 3 business days after each completed trip. You can choose to receive payments via direct deposit to your bank account or through PayPal. You can track all your earnings in real-time through the app.",
  },
  {
    question: "What happens if my car is damaged?",
    answer:
      "In the rare event of damage, our insurance coverage handles repairs. Document your car's condition before and after each rental using our app. We handle the claims process so you can focus on earning.",
  },
];

export default function BecomeARenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [earnings, setEarnings] = useState({
    carValue: 40000,
    daysPerMonth: 15,
  });

  const estimatedEarnings = Math.round(
    (earnings.carValue * 0.015 * earnings.daysPerMonth) / 30,
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1572D3] to-[#0D4F8C] py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                <TrendingUp className="h-4 w-4" />
                Join 10,000+ car owners earning with EcoRent
              </div>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Turn Your Car Into a{" "}
                <span className="text-yellow-300">Money Machine</span>
              </h1>
              <p className="mt-6 text-lg text-white/80 md:text-xl">
                List your electric vehicle on EcoRent and earn up to $1,500 per
                month. It&apos;s free to list, and you&apos;re always in
                control.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-14 bg-white px-8 text-base font-semibold text-[#1572D3] hover:bg-white/90"
                >
                  List Your Car Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
                >
                  Calculate Earnings
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 lg:justify-start">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">$12M+</p>
                  <p className="text-sm text-white/70">Paid to hosts</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white/70">Active hosts</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">4.9</p>
                  <p className="text-sm text-white/70">Host rating</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/10 p-8">
                <Image
                  src="/car item/Tesla Model 3.png"
                  alt="Rent your car"
                  fill
                  className="object-contain"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#747474]">Average Monthly</p>
                    <p className="text-xl font-bold text-[#242424]">$1,247</p>
                  </div>
                </div>
              </div>
              {/* Floating Card 2 */}
              <div className="absolute -right-6 top-10 rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-[#1572D3]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#747474]">Happy Hosts</p>
                    <p className="text-xl font-bold text-[#242424]">10,000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
              Why Host on EcoRent?
            </h2>
            <p className="mt-4 text-lg text-[#747474]">
              Join thousands of car owners who are already earning passive
              income with their vehicles
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all hover:border-[#1572D3]/30 hover:shadow-lg"
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${benefit.color}`}
                >
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#242424]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[#747474]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
                See How Much You Could Earn
              </h2>
              <p className="mt-4 text-lg text-[#747474]">
                Use our calculator to estimate your potential monthly earnings
                based on your car&apos;s value and availability.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-[#242424]">
                      Car Value
                    </label>
                    <span className="text-lg font-semibold text-[#1572D3]">
                      ${earnings.carValue.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="150000"
                    step="5000"
                    value={earnings.carValue}
                    onChange={(e) =>
                      setEarnings((prev) => ({
                        ...prev,
                        carValue: Number(e.target.value),
                      }))
                    }
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#E5E5E5] accent-[#1572D3]"
                  />
                  <div className="mt-1 flex justify-between text-sm text-[#747474]">
                    <span>$10,000</span>
                    <span>$150,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-[#242424]">
                      Days Available Per Month
                    </label>
                    <span className="text-lg font-semibold text-[#1572D3]">
                      {earnings.daysPerMonth} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={earnings.daysPerMonth}
                    onChange={(e) =>
                      setEarnings((prev) => ({
                        ...prev,
                        daysPerMonth: Number(e.target.value),
                      }))
                    }
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#E5E5E5] accent-[#1572D3]"
                  />
                  <div className="mt-1 flex justify-between text-sm text-[#747474]">
                    <span>5 days</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1572D3] to-[#0D4F8C] p-8 text-center text-white">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Wallet className="h-8 w-8" />
                </div>
                <p className="mt-6 text-lg text-white/80">
                  Your Estimated Monthly Earnings
                </p>
                <p className="mt-2 text-5xl font-bold">
                  ${estimatedEarnings.toLocaleString()}
                </p>
                <p className="mt-2 text-white/60">per month</p>
                <div className="mt-6 rounded-lg bg-white/10 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Annual Potential</span>
                    <span className="font-semibold">
                      ${(estimatedEarnings * 12).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button className="mt-6 h-12 w-full bg-white text-[#1572D3] hover:bg-white/90">
                  Start Earning Today
                </Button>
                <p className="mt-4 text-xs text-white/60">
                  *Estimates based on average rental rates in your area
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-[#747474]">
              Getting started is easy. List your car in minutes and start
              earning
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F8FAFC]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain p-8"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1572D3]/10 text-2xl font-bold text-[#1572D3]">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#242424]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-lg text-[#747474]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
                Vehicle Requirements
              </h2>
              <p className="mt-4 text-lg text-[#747474]">
                To ensure quality and safety for all renters, your vehicle must
                meet these basic requirements.
              </p>

              <div className="mt-8 space-y-4">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-[#242424]">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#1572D3]/10 to-[#1572D3]/5 p-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Car className="h-24 w-24 text-[#1572D3]" />
                  <h3 className="mt-6 text-2xl font-bold text-[#242424]">
                    Not Sure If Your Car Qualifies?
                  </h3>
                  <p className="mt-3 text-[#747474]">
                    Our team is happy to help you determine if your vehicle
                    meets our requirements.
                  </p>
                  <Button className="mt-6 bg-[#1572D3] hover:bg-[#1260B0]">
                    Check Eligibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
              Hear From Our Hosts
            </h2>
            <p className="mt-4 text-lg text-[#747474]">
              Real stories from car owners who are earning with EcoRent
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E5E5] bg-white p-6"
              >
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-[#747474]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-[#E5E5E5] pt-6">
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-[#242424]">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-[#747474]">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {testimonial.earnings}
                    </p>
                    <p className="text-xs text-[#747474]">avg. earnings</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-[#747474]">
              Everything you need to know about hosting on EcoRent
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="pr-4 font-semibold text-[#242424]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-[#747474] transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="border-t border-[#E5E5E5] px-6 pb-6 pt-4">
                    <p className="text-[#747474]">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#1572D3] to-[#0D4F8C]">
            <div className="grid items-center lg:grid-cols-2">
              <div className="p-10 text-center lg:p-16 lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                  <Zap className="h-4 w-4" />
                  Limited Time: $0 listing fee
                </div>
                <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
                  Ready to Start Earning?
                </h2>
                <p className="mt-4 text-lg text-white/80">
                  Join thousands of car owners who are turning their vehicles
                  into income. It takes less than 10 minutes to create your
                  listing.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="h-14 w-full bg-white px-8 text-base font-semibold text-[#1572D3] hover:bg-white/90 sm:w-auto"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
              <div className="relative hidden h-full min-h-[400px] lg:block">
                <Image
                  src="/car item/Porsche Taycan.png"
                  alt="Start earning with EcoRent"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
