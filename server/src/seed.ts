// Seeds the 5 SAMPLE projects (placeholder content) when the projects collection is empty.
// Run with: npm run seed. Replace or delete them from the admin panel before going live.
import mongoose from "mongoose";
import env from "./shared/config/env.config.js";
import Project from "./shared/models/project.model.js";

const samples = [
    { slug: "halcyon", name: "Halcyon", kind: "E-commerce", year: "2026", client: "Halcyon Skincare", services: ["Brand direction", "Shopify build", "Product 3D", "Motion"], intro: "A calm, tactile storefront for a skincare label that refuses to shout.", challenge: "Halcyon sold beautiful products through a template store that looked like everyone else. Bounce was high and nobody remembered the name.", solution: "We rebuilt the store around slowness: generous whitespace, product shots that breathe, and a scroll that feels like turning pages in a magazine.", results: [{ v: "+184%", l: "Conversion rate" }, { v: "2.1s", l: "Faster load" }, { v: "3x", l: "Time on site" }], tint: "#cfd8c8", featured: true },
    { slug: "northwind", name: "Northwind", kind: "Architecture", year: "2026", client: "Northwind Architects", services: ["Web design", "Development", "CMS", "Photography direction"], intro: "A portfolio as precise as the buildings it holds.", challenge: "An award winning studio hiding its best work behind a slow, cluttered site built a decade ago.", solution: "A grid system borrowed from their own drawings, full bleed imagery and a project index you can scan in seconds.", results: [{ v: "+260%", l: "Project enquiries" }, { v: "98", l: "Lighthouse score" }, { v: "0", l: "Plugins" }], tint: "#d6d3cd", featured: true },
    { slug: "pulse", name: "Pulse", kind: "Fintech app", year: "2025", client: "Pulse Money", services: ["Product design", "Design system", "React app", "Data viz"], intro: "Money, finally readable.", challenge: "Users loved the idea of Pulse but churned in week one. The dashboard felt like a spreadsheet with a logo.", solution: "We redesigned every screen around one question per view, built a design system of 60 components, and made the charts actually tell a story.", results: [{ v: "-41%", l: "Week one churn" }, { v: "60", l: "Components" }, { v: "4.8", l: "App rating" }], tint: "#1a1c2e", featured: true },
    { slug: "koen", name: "Koen Coffee", kind: "Brand + Web", year: "2025", client: "Koen Roasters", services: ["Identity", "Packaging", "Website", "Subscriptions"], intro: "A roastery that tastes like it looks.", challenge: "Great beans, zero identity. Koen was invisible on shelves and online.", solution: "A warm identity system, packaging that stacks into a pattern, and a subscription flow that takes three taps.", results: [{ v: "1.2k", l: "Subscribers in 90 days" }, { v: "+72%", l: "Repeat orders" }, { v: "3", l: "Taps to subscribe" }], tint: "#d9c7b0", featured: false },
    { slug: "orbit", name: "Orbit", kind: "SaaS launch", year: "2026", client: "Orbit Labs", services: ["Launch site", "WebGL", "Copywriting", "SEO"], intro: "A launch site with gravity.", challenge: "Orbit had one shot at a Product Hunt launch and a product that was hard to explain in words.", solution: "We let the product explain itself: a real time 3D scene that assembles as you scroll, with copy trimmed to the bone.", results: [{ v: "#1", l: "Product of the day" }, { v: "38k", l: "Launch day visits" }, { v: "9%", l: "Signup rate" }], tint: "#c9cfff", featured: true },
];

await mongoose.connect(env.MONGO_URI);

if (await Project.countDocuments()) {
    console.log("Projects already exist, nothing seeded.");
} else {
    await Project.insertMany(samples.map((p, order) => ({ ...p, order, cover: `/work/${p.slug}-1.webp`, detail: `/work/${p.slug}-2.webp` })));
    console.log(`Seeded ${samples.length} sample projects.`);
}

await mongoose.disconnect();
