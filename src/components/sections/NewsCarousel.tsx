
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewsCarouselProps {
  items: {
    id: string; // Changed from number to string to support UUIDs
    title: string;
    image: string;
    category: string;
    link: string;
  }[];
  className?: string;
}

const NewsCarousel = ({ items, className }: NewsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  useEffect(() => {
    // Auto-advance carousel every 5 seconds
    const intervalId = setInterval(nextSlide, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <div 
        className="flex transition-transform duration-500 ease-in-out h-[50vh] md:h-[60vh]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {items.map((item) => (
          <div key={item.id} className="relative w-full flex-shrink-0">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <div className="mb-2 inline-block px-2 py-1 text-xs font-medium bg-highlight rounded">
                {item.category}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading leading-tight">
                <a href={item.link} className="hover:underline">
                  {item.title}
                </a>
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/50"
        onClick={prevSlide}
        disabled={isTransitioning}
      >
        <ArrowLeft size={20} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/50"
        onClick={nextSlide}
        disabled={isTransitioning}
      >
        <ArrowRight size={20} />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentIndex === index ? "bg-white w-4" : "bg-white/50"
            )}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCarousel;
