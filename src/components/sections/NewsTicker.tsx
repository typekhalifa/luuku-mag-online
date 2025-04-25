
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
  if (items.length === 0) return null;

  return (
    <div className={cn("bg-black text-white py-2 overflow-hidden w-full", className)}>
      <div className="container relative flex items-center">
        <div className="mr-4 font-bold text-highlight whitespace-nowrap">
          BREAKING:
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap inline-block hover:pause-animation">
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
            {/* Duplicate items for seamless loop */}
            {items.map((item, index) => (
              <a
                key={`dup-${index}`}
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
