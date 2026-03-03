import fs from 'fs';
import path from 'path';

const downloads = [
    { url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80", file: "public/assets/resultados/makeup_pro.jpg" },
    { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80", file: "public/assets/resultados/spa_relax.jpg" },
    { url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71c9?w=800&q=80", file: "public/assets/resultados/facial_clean.jpg" },
    { url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80", file: "public/assets/resultados/facial_glow.jpg" },
    { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80", file: "public/assets/resultados/spa_massage.jpg" },
    { url: "https://images.unsplash.com/photo-1542106206-ce47d6e6ab08?w=800&q=80", file: "public/assets/resultados/laser_legs.jpg" },
    { url: "https://images.unsplash.com/photo-1617255140880-e8321683cd20?w=800&q=80", file: "public/assets/resultados/smooth_skin.jpg" }
];

async function run() {
    for (const item of downloads) {
        try {
            const res = await fetch(item.url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(path.resolve(item.file), Buffer.from(buffer));
            console.log(`Saved: ${item.file}`);
        } catch (e) {
            console.error(`Failed: ${item.file}`, e);
        }
    }
}

run();
