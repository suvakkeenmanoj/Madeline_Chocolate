import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Link from "next/link";
import { Gift, Truck, Shield, Heart } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Gift,
      title: "Budget Friendly",
      desc: "Return gifts starting from just ₹20",
    },
    {
      icon: Heart,
      title: "Handcrafted",
      desc: "Made with love and premium ingredients",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Quick delivery across Chennai",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      desc: "Fresh chocolates every time",
    },
  ];

  return (
    <>
      <Hero />

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl border border-border hover:border-accent transition-colors"
              >
                <div className="inline-flex p-3 bg-accent-light/30 rounded-full mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary-dark">{title}</h3>
                <p className="text-sm text-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts />

      <section className="special-event-section py-16 bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Planning a Special Event?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Bulk orders available for weddings, baby showers, and corporate
            events. Get customized return gifts at wholesale prices.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-accent text-primary-dark font-semibold rounded-full hover:bg-accent-light transition-colors"
          >
            Get a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
