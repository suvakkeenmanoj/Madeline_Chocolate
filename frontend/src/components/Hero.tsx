import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-float">🍫</div>
        <div className="absolute top-32 right-20 text-4xl animate-float" style={{ animationDelay: "1s" }}>🎁</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-float" style={{ animationDelay: "0.5s" }}>✨</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-medium tracking-wide uppercase">
              Handcrafted with Love
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Welcome to{" "}
            <span className="text-accent">Madeline_chocolate</span> Return Gifts
          </h1>

          <blockquote className="text-lg md:text-xl text-white/80 border-l-4 border-accent pl-4 mb-8 leading-relaxed">
            We create budget-friendly return gifts starting from just ₹20.
            Explore our handcrafted chocolates and customized gifts perfect for
            birthdays, weddings, baby showers, housewarming functions, and
            special occasions.
          </blockquote>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary-dark font-semibold rounded-full hover:bg-accent-light transition-all hover:scale-105 shadow-lg"
            >
              View Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-semibold rounded-full hover:bg-white/20 transition-all border border-white/20"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full hover:text-accent transition-colors"
            >
              <Gift className="w-4 h-4" />
              Contact Us
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { value: "₹20+", label: "Starting Price" },
              { value: "500+", label: "Happy Customers" },
              { value: "100%", label: "Handmade" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-accent">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
