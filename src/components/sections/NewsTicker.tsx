
import { cn } from "@/lib/utils";

interface NewsTickerProps {
  items: {
    text: string;
    link: string;
  }[];
  className?: string;
}

const NewsTicker = ({ items, className }: NewsTickerProps) => {
  return (
    <div className={cn("bg-black text-white overflow-hidden", className)}>
      <div className="container py-2 px-4">
        <div className="flex items-center">
          <div className="mr-4 font-bold text-highlight whitespace-nowrap">
            BREAKING:
          </div>
          <div className="overflow-hidden">
            <div className="whitespace-nowrap inline-block animate-marquee">
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="inline-block mx-4 text-sm hover:text-highlight transition-colors"
                >
                  {item.text}
                </a>
              ))}
              {/* Duplicate for seamless looping */}
              {items.map((item, index) => (
                <a
                  key={`repeat-${index}`}
                  href={item.link}
                  className="inline-block mx-4 text-sm hover:text-highlight transition-colors"
                >
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
