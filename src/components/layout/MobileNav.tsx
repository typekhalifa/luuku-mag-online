
import { X, Facebook, Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-xl font-bold tracking-tight font-heading">
            <span className="text-highlight">LUUKU</span> MAG
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            aria-label="Close menu"
            className="text-gray-500 hover:text-highlight"
          >
            <X size={24} />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-auto">
          <ul className="py-2">
            {['Home', 'World', 'Politics', 'Finance', 'Technology', 'Youth', 'Culture', 'Sport', 'Opportunities'].map((item) => (
              <li key={item} className="border-b border-gray-100 last:border-0">
                <a
                  href="#"
                  className="flex items-center px-6 py-3 text-base font-medium transition-colors hover:bg-gray-50 hover:text-highlight"
                  onClick={onClose}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center justify-center p-4 border-t gap-6">
          <a
            href="#"
            aria-label="Facebook"
            className="p-2 transition-colors hover:text-highlight"
          >
            <Facebook size={20} />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="p-2 transition-colors hover:text-highlight"
          >
            <Twitter size={20} />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="p-2 transition-colors hover:text-highlight"
          >
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
