import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Madeline_chocolate database...");

  // Admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "Admin@123456",
    12
  );
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@madelinechocolate.com" },
    update: {},
    create: {
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@madelinechocolate.com",
      phone: "9876543210",
      password: adminPassword,
      isAdmin: true,
    },
  });

  const products = [
    {
      name: "Homemade Chocolate",
      description:
        "Delicious handcrafted chocolates available without nuts, with nuts, and in 1kg bulk packs.",
      price: 8,
      category: "Chocolates",
      stock: 500,
      variants: {
        options: [
          { label: "Without Nuts", price: 8, unit: "piece" },
          { label: "With Nuts", price: 12, unit: "piece" },
          { label: "1kg Approx 105 chocolates", price: 799, unit: "kg" },
          { label: "1kg With Nuts", price: 1150, unit: "kg" },
        ],
      },
      customizable: false,
      image: "/images/placeholder.svg",
    },
    {
      name: "Kit Kat Chocolate with Customized Cover",
      description:
        "Customized Kit Kat cover with photo upload and a personal message for a premium gift touch.",
      price: 20,
      category: "Customized Gifts",
      stock: 200,
      customizable: true,
      customFields: {
        fields: [
          { name: "photo", type: "image", label: "Upload Photo", required: true },
          { name: "message", type: "textarea", label: "Custom Message", required: false },
        ],
      },
      image: "/images/placeholder.svg",
    },
    {
      name: "Potli Pouch",
      description:
        "Elegant return gift set includes pouch, heart tin, 2 chocolates, bangles, kumkumam, and thank-you card.",
      price: 80,
      category: "Return Gifts",
      stock: 150,
      customizable: false,
      image: "/images/placeholder.svg",
    },
    {
      name: "Piggy Bank",
      description:
        "Adorable piggy bank with a customized photo chocolate included for celebrations and gifting.",
      price: 65,
      category: "Return Gifts",
      stock: 100,
      customizable: true,
      customFields: {
        fields: [
          { name: "photo", type: "image", label: "Upload Photo", required: true },
        ],
      },
      image: "/images/placeholder.svg",
    },
    {
      name: "Thank You Card with Seed Pencil",
      description:
        "Eco-friendly thank-you card with a seed pencil that can be personalized with your name and message.",
      price: 20,
      category: "Return Gifts",
      stock: 300,
      customizable: true,
      customFields: {
        fields: [
          { name: "name", type: "text", label: "Name", required: true },
          { name: "message", type: "textarea", label: "Message", required: true },
        ],
      },
      image: "/images/placeholder.svg",
    },
    {
      name: "Return Gifts Catalog",
      description:
        "Browse the full collection of return gifts and festive celebration bundles.",
      price: 0,
      category: "Return Gifts",
      stock: 0,
      customizable: false,
      image: "/images/placeholder.svg",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
