import { LucideIcon } from "lucide-react";

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  step?: string;
}

const StepCard = ({ icon: Icon, title, description, step }: StepCardProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon circle with optional step badge */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EFF6FF] shadow-sm ring-1 ring-[#DBEAFE]">
          <Icon className="h-9 w-9 text-[#1572D3]" />
        </div>
        {step && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1572D3] text-xs font-bold text-white shadow">
            {step}
          </span>
        )}
      </div>

      <h3 className="mt-6 text-xl font-semibold text-[#242424]">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-[#747474]">{description}</p>
    </div>
  );
};

export default StepCard;
