import { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E8F4FD]">
        <Icon className="h-6 w-6 text-[#1572D3]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#242424]">{title}</h3>
        <p className="mt-1 text-[#747474]">{description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;
