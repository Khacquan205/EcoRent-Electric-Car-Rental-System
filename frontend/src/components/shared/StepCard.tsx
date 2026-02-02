import { LucideIcon } from "lucide-react";

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const StepCard = ({ icon: Icon, title, description }: StepCardProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#E8F4FD]">
        <Icon className="h-10 w-10 text-[#1572D3]" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#242424]">{title}</h3>
      <p className="mt-3 text-[#747474]">{description}</p>
    </div>
  );
};

export default StepCard;
