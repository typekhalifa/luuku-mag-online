
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className={cn("bg-black text-white py-2 overflow-hidden w-full", className)}>
      <div className="container relative flex items-center">
        <div className="mr-4 font-bold text-highlight whitespace-nowrap">
          BREAKING:
        </div>
        <ScrollArea className="w-full">
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
              style={{ animationDuration: `${Math.max(15, items.length * 3)}s` }} // Even faster animation
            >
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="inline-flex items-center mx-6 text-sm hover:text-highlight transition-colors"
                >
                  {/* Always show the date element, but it might be empty if no date provided */}
                  <span className="text-highlight text-xs mr-2 font-semibold whitespace-nowrap">
                    {item.date || ""}
                  </span>
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default NewsTicker;
