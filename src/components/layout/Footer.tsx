import React, { useState } from "react";
import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InstagramGrid from "../sections/InstagramGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Footer = () => {
  // Subscription form state
  const [subEmail, setSubEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  // Contact form state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  // Newsletter Subscribe handler
  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubLoading(true);
    const { error } = await supabase.from("subscriptions").insert({ email: subEmail.trim() });
    if (!error) {
      toast.success("Subscribed!", { description: "Thanks for subscribing to LUUKU MAG!" });
      setSubEmail("");
    } else if (error.code === "23505") {
      toast.error("Already subscribed", { description: "This email is already signed up." });
    } else {
      toast.error("Something went wrong", { description: error.message });
    }
    setSubLoading(false);
  }

  // Contact Us form handler
  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMsg.trim()) return;
    setContactLoading(true);
    const { error } = await supabase.from("contacts").insert({
      name: contactName || null,
      email: contactEmail.trim(),
      message: contactMsg.trim(),
    });
    if (!error) {
      toast.success("Message sent!", { description: "We'll be in touch soon." });
      setContactName("");
      setContactEmail("");
      setContactMsg("");
      setContactOpen(false);
    } else {
      toast.error("Something went wrong", { description: error.message });
    }
    setContactLoading(false);
  }

  return (
    <footer className="bg-black text-white">
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
            <form className="flex flex-col space-y-2" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-0 text-white placeholder:text-gray-500 focus-visible:ring-highlight"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                required
                disabled={subLoading}
              />
              <Button className="bg-highlight hover:bg-highlight/90 text-white" type="submit" disabled={subLoading || !subEmail.trim()}>
                {subLoading ? "Subscribing..." : "Subscribe"}
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
                <a href="tel:+250788214751" className="text-gray-400 hover:text-highlight transition-colors">
                  +250 788 214 751
                </a>
              </li>
              <li>
                <p className="text-gray-400">
                  24XC+QFJ, KG 11 Ave<br />
                  Kigali, Rwanda
                </p>
              </li>
              <li>
                {/* Contact Us form popover - opens modal with contact form */}
                <Popover open={contactOpen} onOpenChange={setContactOpen}>
                  <PopoverTrigger asChild>
                    <Button className="bg-highlight text-white w-full">Send us a message</Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-4 bg-white text-black w-96 max-w-full shadow-xl rounded-md">
                    <form className="flex flex-col space-y-3" onSubmit={handleContact}>
                      <h4 className="font-bold text-lg mb-1">Contact LUUKU MAG</h4>
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="bg-gray-50"
                        disabled={contactLoading}
                      />
                      <Input
                        type="email"
                        placeholder="Your email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-gray-50"
                        required
                        disabled={contactLoading}
                      />
                      <textarea
                        placeholder="Your message"
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        rows={4}
                        className="rounded-md border border-input px-3 py-2 text-sm bg-gray-50"
                        required
                        disabled={contactLoading}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setContactOpen(false)}
                          disabled={contactLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-highlight text-white"
                          type="submit"
                          disabled={contactLoading || !contactEmail.trim() || !contactMsg.trim()}
                        >
                          {contactLoading ? "Sending..." : "Send"}
                        </Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
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
