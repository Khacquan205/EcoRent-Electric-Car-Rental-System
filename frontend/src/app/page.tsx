import {
  HeroSection,
  SearchBar,
  HowItWorks,
  BrandLogos,
  WhyChooseUs,
  RentalDeals,
  Feedback,
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SearchBar />
      <HowItWorks />
      <BrandLogos />
      <WhyChooseUs />
      <RentalDeals />
      <Feedback />
    </div>
  );
}
