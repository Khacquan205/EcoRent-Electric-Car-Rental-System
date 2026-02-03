import {
  Shield,
  Users,
  Award,
  Zap,
  Heart,
  Globe,
  CheckCircle,
  Star,
  Car,
  Leaf,
  Clock,
  Headphones,
  CreditCard,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "10K+", label: "Happy Customers", icon: Users },
  { value: "500+", label: "Electric Vehicles", icon: Car },
  { value: "50+", label: "Cities Covered", icon: MapPin },
  { value: "4.9", label: "Average Rating", icon: Star },
];

const reasons = [
  {
    icon: Leaf,
    title: "Eco-Friendly Fleet",
    description:
      "100% electric vehicles mean zero emissions. Drive with confidence knowing you're making a positive impact on the environment.",
    color: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description:
      "Every rental comes with comprehensive insurance coverage. Drive worry-free with our protection plans.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description:
      "No hidden fees, no surprises. What you see is what you pay. Clear pricing from the start.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Clock,
    title: "Flexible Rentals",
    description:
      "Rent by the hour, day, week, or month. Our flexible options adapt to your schedule and needs.",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated support team is always available to help you, anytime, anywhere.",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: Zap,
    title: "Fast & Easy Booking",
    description:
      "Book your perfect vehicle in minutes. Our streamlined process gets you on the road faster.",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
];

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Your satisfaction is our top priority. We go above and beyond to exceed expectations.",
  },
  {
    icon: Globe,
    title: "Sustainability",
    description:
      "Committed to a greener future through electric mobility and eco-conscious practices.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We maintain the highest standards in vehicle quality, service, and safety.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description:
      "Continuously improving our platform and services to serve you better.",
  },
];

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    role: "Business Owner",
    avatar: "/feedback/Rectangle 8.png",
    content:
      "EcoRent đã thay đổi cách tôi di chuyển trong thành phố. Xe điện sạch sẽ, dịch vụ chuyên nghiệp và giá cả hợp lý. Highly recommended!",
    rating: 5,
  },
  {
    name: "Trần Văn Hùng",
    role: "Software Engineer",
    avatar: "/feedback/Rectangle 8_1.png",
    content:
      "Quy trình thuê xe cực kỳ đơn giản và nhanh chóng. Tôi đặc biệt thích việc có thể theo dõi lịch sử thuê xe và quản lý thanh toán dễ dàng.",
    rating: 5,
  },
  {
    name: "Lê Thị Hương",
    role: "Marketing Manager",
    avatar: "/feedback/Rectangle 8_2.png",
    content:
      "Là người quan tâm đến môi trường, EcoRent là lựa chọn hoàn hảo. Xe điện chất lượng cao và đội ngũ hỗ trợ rất nhiệt tình.",
    rating: 5,
  },
];

const partners = ["VinFast", "Tesla", "Hyundai", "BMW", "Mercedes", "Audi"];

const WhyChooseUsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F8FAFC] py-16 lg:py-24">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#1572D3]" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#1572D3]" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              ABOUT ECORENT
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[#242424] lg:text-5xl">
              Driving the Future of{" "}
              <span className="text-[#1572D3]">Sustainable Mobility</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#747474]">
              EcoRent is Vietnam&apos;s leading electric car rental platform,
              connecting eco-conscious travelers with quality electric vehicles.
              We believe in making sustainable transportation accessible,
              affordable, and enjoyable for everyone.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F4FD]">
                  <stat.icon className="h-6 w-6 text-[#1572D3]" />
                </div>
                <p className="mt-4 text-3xl font-bold text-[#1572D3]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[#747474]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              WHY CHOOSE US
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#242424] lg:text-4xl">
              The EcoRent Difference
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#747474]">
              We&apos;re not just a car rental service. We&apos;re your partner
              in sustainable transportation, committed to providing the best
              experience possible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="group rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all hover:border-[#1572D3] hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${reason.color}`}
                >
                  <reason.icon className={`h-7 w-7 ${reason.iconColor}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#242424] group-hover:text-[#1572D3]">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#747474]">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-[#1572D3] py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Mission */}
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">
                Our Mission
              </h3>
              <p className="mt-4 leading-relaxed text-white/80">
                To accelerate the transition to sustainable transportation by
                making electric vehicle rentals accessible, convenient, and
                affordable for everyone. We aim to reduce carbon emissions one
                ride at a time while providing an exceptional customer
                experience.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">Our Vision</h3>
              <p className="mt-4 leading-relaxed text-white/80">
                To become Southeast Asia&apos;s most trusted electric vehicle
                rental platform, leading the charge towards a cleaner, greener
                future. We envision a world where sustainable mobility is the
                norm, not the exception.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              OUR VALUES
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#242424] lg:text-4xl">
              What We Stand For
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F4FD]">
                  <value.icon className="h-8 w-8 text-[#1572D3]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#242424]">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-[#747474]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#F8FAFC] py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#E8F4FD] px-4 py-1.5 text-sm font-medium text-[#1572D3]">
              TESTIMONIALS
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#242424] lg:text-4xl">
              What Our Customers Say
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-[#FFC107] text-[#FFC107]"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mt-4 text-sm leading-relaxed text-[#747474]">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#242424]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#747474]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-[#747474]">
              Trusted by Leading Brands
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {partners.map((partner) => (
              <div
                key={partner}
                className="text-xl font-bold text-[#B6B6B6] transition-colors hover:text-[#747474]"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#1572D3] to-[#0D4F8C] py-16 lg:py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-4xl">
            Ready to Experience the Difference?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join thousands of satisfied customers who have made the switch to
            sustainable transportation with EcoRent.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/vehicles">
              <Button
                size="lg"
                className="bg-white text-[#1572D3] hover:bg-white/90"
              >
                <Car className="mr-2 h-5 w-5" />
                Browse Vehicles
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUsPage;
