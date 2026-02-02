interface SectionHeaderProps {
  badge: string;
  title: string;
  className?: string;
}

const SectionHeader = ({
  badge,
  title,
  className = "",
}: SectionHeaderProps) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="inline-flex items-center rounded-full border border-[#1572D3] px-4 py-2 text-sm font-medium text-[#1572D3]">
        {badge}
      </span>
      <h2 className="mt-6 text-3xl font-bold text-[#242424] md:text-4xl">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
