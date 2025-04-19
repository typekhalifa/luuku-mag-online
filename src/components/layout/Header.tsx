
import { useState } from "react";
import { Facebook, Instagram, Menu, Search, Twitter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close search if open when menu is toggled
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Close menu if open when search is toggled
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container p-4 md:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="block lg:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Logo */}
          <div className="flex items-center mr-auto ml-2 lg:ml-0">
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl font-heading">
              <span className="text-highlight">LUUKU</span> MAG
            </h1>
          </div>

          {/* Social & Search - Hidden on Mobile */}
          <div className="items-center hidden space-x-4 md:flex">
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
          </div>

          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            aria-label="Search"
            className="md:hidden"
          >
            <Search size={20} />
          </Button>
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
          <div className="flex items-center w-full px-3 bg-gray-100 rounded-md focus-within:ring-1 focus-within:ring-highlight">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full px-2 py-2 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:justify-center py-3">
          <ul className="flex items-center space-x-8">
            {['Home', 'World', 'Politics', 'Finance', 'Technology', 'Youth', 'Culture', 'Sport', 'Opportunities'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm font-medium transition-colors hover:text-highlight"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu */}
        <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
