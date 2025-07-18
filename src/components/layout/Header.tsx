import { useState, useEffect } from "react";
import { Facebook, Instagram, Menu, Search, Twitter, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import SearchResults from "../SearchResults";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  // All categories for navigation
  const navCategories = [
    { name: "Home", path: "/" },
    { name: "World", category: "world" },
    { name: "Politics", category: "politics" },
    { name: "Finance", category: "finance" },
    { name: "Technology", category: "technology" },
    { name: "Youth", category: "youth" },
    { name: "Culture", category: "culture" },
    { name: "Sport", category: "sport" },
    { name: "Opportunities", category: "opportunities" },
  ];

  const handleNavClick = (item: any) => {
    if (item.category) {
      navigate(`/articles?category=${encodeURIComponent(item.category)}`);
    } else if (item.path) {
      navigate(item.path);
    }
    setIsMenuOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search handler - now searches real articles from database
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, category, excerpt')
        .or(`title.ilike.%${query}%,category.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(articles || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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

          {/* Logo - Text only */}
          <div className={cn(
            "flex items-center", 
            isMobile ? "mr-auto ml-2" : "mx-auto md:mx-0 md:mr-auto"
          )}>
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl font-heading">
              <span className="text-highlight">LUUKU</span> MAG
            </h1>
          </div>

          {/* Top Right: Social Media + Search + Theme Toggle */}
          <div className="items-center hidden space-x-2 md:flex">
            <a
              href="https://facebook.com/luukumag1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://twitter.com/luukumag1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://instagram.com/luukumag1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-1 transition-colors hover:text-highlight"
            >
              <Instagram size={18} />
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              aria-label="Search"
              className="hover:text-highlight"
            >
              <Search size={18} />
            </Button>
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
                onClick={() => setIsSearchDialogOpen(true)}
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

        {/* Search Dialog */}
        <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <div className="flex items-center w-full px-3 bg-gray-100 dark:bg-[#22293a] rounded-md focus-within:ring-1 focus-within:ring-highlight mb-4">
              <Search size={18} className="text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full px-2 py-2 bg-transparent border-none focus:outline-none text-black dark:text-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                autoFocus
              />
            </div>
            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                Searching...
              </div>
            )}
            {!isSearching && (
              <SearchResults 
                results={searchResults} 
                onClose={() => {
                  setIsSearchDialogOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className={cn(
          "py-3 mt-4 -mx-4 md:-mx-8",
          isMobile ? "hidden" : "block"
        )}>
          <div className="container">
            <ul className="flex items-center justify-center space-x-6 bg-[#e8ebe9] dark:bg-[#1a2332] rounded-lg shadow px-6 py-2">
              {navCategories.map((item) => (
                <li key={item.name}>
                  <button
                    className={cn(
                      "text-sm font-heading font-semibold uppercase transition-all px-2 py-1 text-gray-900 dark:text-white tracking-wide relative bg-transparent border-none outline-none hover:text-highlight after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-highlight after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform cursor-pointer"
                    )}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.name}
                  </button>
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

// This file is getting pretty long and should be refactored into smaller components for maintainability.
