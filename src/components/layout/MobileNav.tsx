
import { X, Facebook, Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const navigate = useNavigate();

  const handleNavClick = (category: string) => {
    if (category === 'Home') {
      navigate('/');
    } else {
      navigate(`/articles?category=${category.toLowerCase()}`);
    }
    onClose();
  };

  const navItems = ['Home', 'World', 'Politics', 'Finance', 'Technology', 'Youth', 'Health', 'Sport', 'Opportunities'];

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
          "fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-800">
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
            {navItems.map((item) => (
              <li key={item} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <button
                  className="w-full text-left px-6 py-3 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-highlight"
                  onClick={() => handleNavClick(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center justify-center p-4 border-t dark:border-gray-800 gap-6">
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
