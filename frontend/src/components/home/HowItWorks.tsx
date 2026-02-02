import { CircleCheckBig, CalendarDays, Car } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import StepCard from "@/components/shared/StepCard";

const steps = [
  {
    icon: CircleCheckBig,
    title: "Choose location",
    description: "Choose your and find\nyour best car",
  },
  {
    icon: CalendarDays,
    title: "Pick-up date",
    description: "Select your pick up date and\ntime to book your car",
  },
  {
    icon: Car,
    title: "Book your car",
    description: "Book your car and we will deliver\nit directly to you",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge="HOW IT WORK"
          title="Rent with following 3 working steps"
        />

        {/* Steps */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 lg:mt-16">
          {steps.map((step) => (
            <StepCard
              key={step.title}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
