import { cn } from "../lib/utils";

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}) => {
  return (
    <div
      className={cn(
        "group/bento relative row-span-1 flex flex-col justify-between space-y-4 p-8",
        "bg-gradient-to-br from-[rgba(25,25,40,0.8)] to-[rgba(15,15,25,0.9)]",
        "border border-[rgba(102,126,234,0.1)] rounded-2xl",
        "backdrop-blur-xl overflow-hidden",
        "transition-all duration-500 ease-out",
        "hover:border-[rgba(102,126,234,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(102,126,234,0.1)]",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(102,126,234,0.05)] to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      
      {/* Top shine line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.4)] to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      
      {header}
      <div className="relative z-10 transition-transform duration-300 group-hover/bento:translate-x-2">
        <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-xl shadow-lg shadow-[rgba(102,126,234,0.3)]">
          {icon}
        </div>

        <div className="mb-2 font-semibold text-lg text-white tracking-tight">
          {title}
        </div>
        <div className="text-sm text-[#94a3b8] leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
