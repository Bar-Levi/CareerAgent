import { cn } from "../../utils/combineClassnames";

export function AnimatedButton({
  children,
  className,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={cn(
        "group relative overflow-hidden rounded-xl px-8 py-4",
        "bg-gradient-to-b from-blue-600 to-blue-700 border border-blue-400/50",
        "hover:from-blue-500 hover:to-blue-600 hover:border-blue-300/50",
        "shadow-lg shadow-blue-500/20",
        "transition-all duration-300 ease-out",
        "min-w-[160px] text-white font-medium text-base",
        className
      )}
      {...props}
    >
      <span className="relative z-10 block transition-all duration-300 group-hover:opacity-0 ml-[-20px]">
        {children}
      </span>
      <i className="absolute right-4 top-1/2 -translate-y-1/2 z-10 grid w-8 place-items-center transition-all duration-300 group-hover:w-[calc(100%-2rem)] group-hover:right-[50%] group-hover:translate-x-[50%]">
        {Icon && <Icon className="w-5 h-5" strokeWidth={2} />}
      </i>
    </button>
  );
} 