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

  // Search handler
  const handleSearch = (query: string) => {
    const technologyArticles = [
      {
        id: 1,
        title: "AI Revolution in Healthcare: New Diagnostic Tools",
        excerpt: "Artificial intelligence is transforming how doctors diagnose and treat diseases with unprecedented accuracy.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470",
        category: "Technology",
        date: "2 hours ago",
        link: "#"
      },
      {
        id: 2,
        title: "Quantum Computing Milestone Achieved by Research Team",
        excerpt: "Scientists have reached a significant breakthrough in quantum computing that could revolutionize data processing.",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1470",
        category: "Technology",
        date: "Yesterday",
        link: "#"
      },
      {
        id: 3,
        title: "New Smartphone Features Focus on Digital Wellbeing",
        excerpt: "The latest generation of smartphones includes tools designed to help users manage screen time and online habits.",
        image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=1026",
        category: "Technology",
        date: "2 days ago",
        link: "#"
      }
    ];
    
    const worldArticles = [
      {
        id: 4,
        title: "International Climate Agreement Receives Wide Support",
        excerpt: "Countries around the world are signing onto a new framework for addressing climate change and reducing emissions.",
        image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=1470",
        category: "World",
        date: "4 hours ago",
        link: "#"
      },
      {
        id: 5,
        title: "Diplomatic Relations Improve Between Rival Nations",
        excerpt: "A historic meeting between leaders signals a potential thaw in long-standing international tensions.",
        image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1469",
        category: "World",
        date: "Today",
        link: "#"
      },
      {
        id: 6,
        title: "Cultural Exchange Program Launches Across Continents",
        excerpt: "A new initiative aims to build bridges between diverse communities through art, music, and education.",
        image: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1470",
        category: "World",
        date: "3 days ago",
        link: "#"
      }
    ];
    
    const opportunitiesArticles = [
      {
        id: 7,
        title: "Scholarship Program Opens Applications for International Students",
        excerpt: "A major foundation announces funding opportunities for students from developing countries to study abroad.",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470",
        category: "Opportunities",
        date: "1 day ago",
        link: "#"
      },
      {
        id: 8,
        title: "Green Technology Startups Receive Major Investment",
        excerpt: "Venture capital firms are pouring resources into innovative companies addressing environmental challenges.",
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1470",
        category: "Opportunities",
        date: "1 week ago",
        link: "#"
      },
      {
        id: 9,
        title: "Remote Work Revolution Creates New Career Paths",
        excerpt: "Companies embracing flexible work arrangements are opening doors for talent regardless of location.",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1469",
        category: "Opportunities",
        date: "5 days ago",
        link: "#"
      }
    ];
    const allArticles = [
      ...technologyArticles,
      ...worldArticles,
      ...opportunitiesArticles
    ];
    
    const filteredResults = allArticles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.category.toLowerCase().includes(query.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(filteredResults);
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

          {/* Logo - Remove the image and keep only text */}
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
            {/* Update search icon click handler */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
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
            <SearchResults 
              results={searchResults} 
              onClose={() => {
                setIsSearchDialogOpen(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
            />
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
