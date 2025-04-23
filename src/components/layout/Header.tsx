import { useState, useEffect } from "react";
import { Facebook, Instagram, Menu, Search, Twitter, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Set initial theme based on user's preference
  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle html class & persist to localStorage
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1A1F2C] border-b shadow-sm transition-colors">
      <div className="container p-4 md:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Only visible on mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="block md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}

          {/* Logo */}
          <div className={cn(
            "flex items-center", 
            isMobile ? "mr-auto ml-2" : "mx-auto md:mx-0 md:mr-auto"
          )}>
            {!isMobile && (
              <img 
                src="/lovable-uploads/logo.png" 
                alt="LUUKU MAG Logo" 
                className="w-12 h-12 mr-4 rounded-full object-cover border-2 border-highlight shadow"
              />
            )}
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl font-heading">
              <span className="text-highlight">LUUKU</span> MAG
            </h1>
          </div>

          {/* Top Right: Social Media + Search + Theme Toggle */}
          <div className="items-center hidden space-x-2 md:flex">
            <a
              href="#"
              aria-label="Facebook"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Instagram size={18} />
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              aria-label="Search"
              className="hover:text-highlight"
            >
              <Search size={18} />
            </Button>
            {/* THEME TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 transition-colors hover:bg-highlight/10"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </Button>
          </div>

          {/* Mobile Search + Theme Toggle */}
          {isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <Search size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-gray-700" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isSearchOpen
              ? "max-h-20 opacity-100 py-3"
              : "max-h-0 opacity-0 py-0"
          )}
        >
          <div className="flex items-center w-full px-3 bg-gray-100 dark:bg-[#22293a] rounded-md focus-within:ring-1 focus-within:ring-highlight">
            <Search size={18} className="text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full px-2 py-2 bg-transparent border-none focus:outline-none text-black dark:text-white"
            />
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className={cn(
          "py-3 mt-4 -mx-4 md:-mx-8",
          isMobile ? "hidden" : "block"
        )}>
          <div className="container">
            <ul className="flex items-center justify-center space-x-6 bg-[#e8ebe9] dark:bg-[#1a2332] rounded-lg shadow px-6 py-2">
              {[
                "Home",
                "World",
                "Politics",
                "Finance",
                "Technology",
                "Youth",
                "Culture",
                "Sport",
                "Opportunities",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className={cn(
                      "text-sm font-heading font-semibold uppercase transition-all px-2 py-1 text-gray-900 dark:text-white tracking-wide relative",
                      "hover:text-highlight after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-highlight after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform"
                    )}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile Menu */}
        <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
