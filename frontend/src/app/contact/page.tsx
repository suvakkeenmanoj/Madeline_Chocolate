import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-primary-dark mb-2">Contact Us</h1>
      <p className="text-muted mb-10">
        Have questions about our chocolates or return gifts? We&apos;d love to hear from you!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            {
              icon: Phone,
              title: "Phone / WhatsApp",
              content: "+91 98765 43210",
              href: "https://wa.me/919876543210",
            },
            {
              icon: Mail,
              title: "Email",
              content: "hello@madelinechocolate.com",
              href: "mailto:hello@madelinechocolate.com",
            },
            {
              icon: MapPin,
              title: "Location",
              content: "Chennai, Tamil Nadu, India",
            },
            {
              icon: Clock,
              title: "Business Hours",
              content: "Mon - Sat: 9 AM - 7 PM",
            },
          ].map(({ icon: Icon, title, content, href }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border"
            >
              <div className="p-2 bg-accent-light/30 rounded-full">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                {href ? (
                  <a href={href} className="text-sm text-muted hover:text-accent transition-colors">
                    {content}
                  </a>
                ) : (
                  <p className="text-sm text-muted">{content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Send a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#25D366] text-white text-center rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Send via WhatsApp
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
