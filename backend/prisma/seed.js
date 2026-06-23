"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding Madeline_chocolate database...");
    // Admin user
    const adminPassword = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD || "Admin@123456", 12);
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
            description: "Delicious handcrafted homemade chocolates. Available with nuts and without nuts. Perfect for return gifts and celebrations.",
            price: 8,
            category: "Chocolates",
            stock: 500,
            variants: {
                options: [
                    { label: "Without Nuts", price: 8, unit: "piece" },
                    { label: "With Nuts", price: 12, unit: "piece" },
                    { label: "1 kg Without Nuts (~105 pcs)", price: 799, unit: "kg" },
                    { label: "1 kg With Nuts (~105 pcs)", price: 1150, unit: "kg" },
                ],
            },
            customizable: false,
            image: "/images/homemade-chocolate.jpg",
        },
        {
            name: "Kit Kat Chocolate",
            description: "Customized Kit Kat Chocolate Cover. Upload your photo, name, and message for a personalized gift.",
            price: 20,
            category: "Customized Gifts",
            stock: 200,
            customizable: true,
            customFields: {
                fields: [
                    { name: "photo", type: "image", label: "Upload Photo", required: true },
                    { name: "name", type: "text", label: "Name on Cover", required: true },
                    { name: "message", type: "textarea", label: "Custom Message", required: false },
                ],
            },
            image: "/images/kit-kat.jpg",
        },
        {
            name: "Potli Pouch Return Gift",
            description: "Beautiful return gift set including: Potli Pouch, Heart Tin, 2 Chocolates, Bangles, Kumkumam, and Thank You Card.",
            price: 80,
            category: "Return Gifts",
            stock: 150,
            customizable: false,
            image: "/images/potli-pouch.jpg",
        },
        {
            name: "Piggy Bank Gift",
            description: "Adorable piggy bank gift with customized photo and chocolate. Perfect for birthdays and baby showers.",
            price: 65,
            category: "Return Gifts",
            stock: 100,
            customizable: true,
            customFields: {
                fields: [
                    { name: "photo", type: "image", label: "Upload Photo", required: true },
                ],
            },
            image: "/images/piggy-bank.jpg",
        },
        {
            name: "Thank You Card With Seed Pencil",
            description: "Eco-friendly thank you card with seed pencil. Customizable name and personalized message.",
            price: 20,
            category: "Return Gifts",
            stock: 300,
            customizable: true,
            customFields: {
                fields: [
                    { name: "name", type: "text", label: "Name on Card", required: true },
                    { name: "message", type: "textarea", label: "Personalized Message", required: true },
                ],
            },
            image: "/images/thank-you-card.jpg",
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
