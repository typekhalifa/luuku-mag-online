
import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InstagramGrid from "../sections/InstagramGrid";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      {/* Instagram Feed */}
      <InstagramGrid />
      
      {/* Main Footer Content */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold font-heading mb-4">
              <span className="text-highlight">LUUKU</span> MAG
            </h3>
            <p className="text-gray-400 mb-4">
              A modern online magazine covering news, politics, finance, 
              technology, culture, and more. Designed for the modern reader.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-highlight"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-highlight"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-highlight"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Categories</h3>
            <ul className="space-y-2">
              {['World', 'Politics', 'Finance', 'Technology', 'Youth', 'Culture', 'Sport'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-highlight transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Subscribe */}
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Stay updated with our latest news and updates. Subscribe to our newsletter.
            </p>
            <form className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-0 text-white placeholder:text-gray-500 focus-visible:ring-highlight"
              />
              <Button className="bg-highlight hover:bg-highlight/90 text-white">
                Subscribe
              </Button>
            </form>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-2 text-highlight mt-0.5" />
                <a href="mailto:info@luukumag.com" className="text-gray-400 hover:text-highlight transition-colors">
                  info@luukumag.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-2 text-highlight mt-0.5" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-highlight transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <p className="text-gray-400">
                  123 Media Avenue<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LUUKU MAG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
