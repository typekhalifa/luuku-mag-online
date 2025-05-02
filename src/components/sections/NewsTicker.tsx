
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NewsTickerProps {
  items: {
    text: string;
    link: string;
    date?: string;
  }[];
  className?: string;
}

const NewsTicker = ({ items, className }: NewsTickerProps) => {
  const [isPaused, setIsPaused] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className={cn("bg-black text-white py-2 overflow-hidden w-full sticky top-0 z-50", className)}>
      <div className="container relative flex items-center">
        <div className="mr-4 font-bold text-highlight whitespace-nowrap">
          BREAKING:
        </div>
        <div 
          className="overflow-hidden flex-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={cn(
              "whitespace-nowrap inline-block animate-ticker",
              isPaused ? "paused" : ""
            )}
            style={{ animationDuration: `${Math.max(10, items.length * 5)}s` }}
          >
            {items.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="inline-block mx-4 text-sm hover:text-highlight transition-colors"
              >
                {item.date && (
                  <span className="text-highlight text-xs mr-2 font-semibold">
                    {item.date}
                  </span>
                )}
                {item.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
