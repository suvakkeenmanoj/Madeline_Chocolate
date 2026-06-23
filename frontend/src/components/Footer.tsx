import Link from "next/link";
import { Phone, Mail, MapPin, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🍫 Madeline_chocolate
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Handcrafted chocolates and budget-friendly return gifts starting
              from just ₹20. Perfect for birthdays, weddings, baby showers, and
              special occasions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/catalog" className="hover:text-accent transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Return Gifts" className="hover:text-accent transition-colors">
                  Return Gifts
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-accent transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <a href="tel:+919876543210" className="hover:text-accent">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a href="mailto:hello@madelinechocolate.com" className="hover:text-accent">
                  hello@madelinechocolate.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Chennai, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent" />
                <a href="#" className="hover:text-accent">
                  @madeline_chocolate
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Madeline_chocolate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
