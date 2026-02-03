import {
  MapPin,
  Calendar,
  Search,
  CircleCheckBig,
  CalendarDays,
  Car,
  BadgeDollarSign,
  UserCheck,
  Truck,
  Headphones,
  Star,
  Users,
  Gauge,
  Wind,
  DoorOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-6 py-12 lg:px-12 lg:py-20 xl:px-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Find, book and <br />
                rent an electric car{" "}
                <span className="relative text-primary">easily</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Thuê xe điện linh hoạt theo giờ/ngày, minh bạch giá và điều
                khoản, đặt nhanh trên web/mobile.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="secondary" className="h-12 px-4">
                  <Link href="#" className="inline-flex items-center gap-2">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.523 2H6.477C3.467 2 1 4.467 1 7.477v9.046C1 19.533 3.467 22 6.477 22h11.046C20.533 22 23 19.533 23 16.523V7.477C23 4.467 20.533 2 17.523 2zM8.5 17.5l-1-1L11 13l-3.5-3.5 1-1L13 13l-4.5 4.5zm8 0l-4.5-4.5L16.5 8.5l1 1L14 13l3.5 3.5-1 1z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[10px] uppercase leading-tight opacity-80">
                        Get it on
                      </div>
                      <div className="text-sm font-semibold leading-tight">
                        Google Play
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="secondary" className="h-12 px-4">
                  <Link href="#" className="inline-flex items-center gap-2">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[10px] uppercase leading-tight opacity-80">
                        Download on the
                      </div>
                      <div className="text-sm font-semibold leading-tight">
                        App Store
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 lg:-right-12 xl:-right-20">
                <Image
                  src="/Frame.png"
                  alt=""
                  width={700}
                  height={700}
                  className="h-[400px] w-auto opacity-60 md:h-[500px] lg:h-[600px] xl:h-[700px]"
                  priority
                />
              </div>
              <div className="relative z-10 h-[300px] w-full max-w-[800px] md:h-[400px] lg:h-[500px] lg:-mr-12 xl:-mr-20">
                <Image
                  src="/car 2 1.png"
                  alt="Blue Porsche sports car"
                  fill
                  className="object-contain object-right"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 pb-12">
          <Card className="relative -mt-4">
            <CardContent className="p-6 lg:p-8">
              <div className="grid gap-4 md:grid-cols-4 md:items-end">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Search your location"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Pickup date
                  </label>
                  <Input
                    type="text"
                    placeholder="Tue 15 Feb, 09:00"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Return date
                  </label>
                  <Input
                    type="text"
                    placeholder="Thu 16 Feb, 11:00"
                    className="h-12"
                  />
                </div>

                <Button className="h-12 text-base font-semibold">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground">
              HOW IT WORKS
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">
              Thuê xe điện với 3 bước đơn giản
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 lg:mt-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <CircleCheckBig className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Chọn xe & vị trí
              </h3>
              <p className="mt-3 text-muted-foreground">
                Chọn xe điện theo nhu cầu
                <br />
                và khu vực của bạn
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <CalendarDays className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Chọn thời gian
              </h3>
              <p className="mt-3 text-muted-foreground">
                Chọn ngày/giờ nhận xe
                <br />
                để đặt xe điện nhanh chóng
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Đặt xe & nhận xe
              </h3>
              <p className="mt-3 text-muted-foreground">
                Đặt xe điện và nhận xe
                <br />
                nhanh chóng, minh bạch
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-background py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:justify-between">
            <div className="flex items-center gap-2 text-foreground opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 100 20"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="16"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="Arial"
                >
                  HONDA
                </text>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-foreground opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 120 20"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="16"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="serif"
                  letterSpacing="2"
                >
                  JAGUAR
                </text>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-foreground opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 100 20"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="16"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="Arial"
                >
                  NISSAN
                </text>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-foreground opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 100 20"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="16"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="Arial"
                  letterSpacing="4"
                >
                  VOLVO
                </text>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-foreground opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 80 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="28" cy="12" r="10" />
                <circle cx="44" cy="12" r="10" />
                <circle cx="60" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background py-16 lg:py-24">
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 opacity-20">
          <Image
            src="/Vector.png"
            alt=""
            width={600}
            height={600}
            className="h-[500px] w-auto lg:h-[700px]"
          />
        </div>

        <div className="container mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
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

            <div>
              <span className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground">
                VÌ SAO CHỌN ECOWHEELS
              </span>
              <h2 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">
                Trải nghiệm thuê xe điện
                <br />
                an toàn và minh bạch
              </h2>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <BadgeDollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Best price guaranteed
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Find a lower price? We&apos;ll refund you 100% of the
                      difference.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Experience driver
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Don&apos;t have driver? Don&apos;t worry, we have many
                      experienced driver for you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      24 hour car delivery
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Book your car anytime and we will deliver it directly to
                      you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      24/7 technical support
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Have a question? Contact Rentcars support any time when
                      you have problem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground">
              XE ĐIỆN NỔI BẬT
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">
              Các mẫu xe điện được quan tâm nhiều
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Jaguar XE L P250",
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
                name: "Audi R8",
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
                name: "BMW M3",
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
                name: "Lamborghini Huracan",
                image: "/car item/image 13.png",
                rating: 4.3,
                reviews: "2,236",
                passengers: 2,
                transmission: "Auto",
                airConditioning: true,
                doors: 2,
                price: 2300,
              },
            ].map((car) => (
              <Card key={car.name} className="group">
                <CardContent className="p-4">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {car.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {car.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({car.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{car.passengers} Passagers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      <span>Air Conditioning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      <span>{car.doors} Doors</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Price
                      </span>
                      <p className="text-lg font-bold text-foreground">
                        ${car.price.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">
                          /day
                        </span>
                      </p>
                    </div>
                    <Button>
                      Rent Now
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button variant="outline">
              Show all vehicles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground">
              TESTIMONIALS
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">
              Khách hàng nói gì về EcoWheels?
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
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
            ].map((testimonial) => (
              <Card
                key={testimonial.name}
                className="group flex flex-col overflow-hidden md:flex-row"
              >
                <div className="relative h-48 w-full shrink-0 md:h-auto md:w-48">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                </div>

                <CardContent className="flex flex-1 flex-col justify-center p-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {testimonial.rating.toFixed(1)}
                    </span>
                    <span className="text-lg text-muted-foreground">stars</span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.review}&rdquo;
                  </p>

                  <div className="mt-4">
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
