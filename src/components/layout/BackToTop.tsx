
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 border-highlight text-highlight hover:text-white hover:bg-highlight transition-all rounded-full shadow-md opacity-0 scale-90",
        isVisible && "opacity-100 scale-100"
      )}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </Button>
  );
};

export default BackToTop;
