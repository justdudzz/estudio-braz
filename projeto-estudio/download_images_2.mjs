import fs from 'fs';
import path from 'path';

const downloads = [
    { url: "https://images.unsplash.com/photo-1542106206-ce47d6e6ab08?w=800&q=80", file: "public/assets/resultados/laser_legs.jpg" },
    { url: "https://images.unsplash.com/photo-1617255140880-e8321683cd20?w=800&q=80", file: "public/assets/resultados/smooth_skin.jpg" },
    { url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71c9?w=800&q=80", file: "public/assets/resultados/facial_clean.jpg" }
];

async function run() {
    for (const item of downloads) {
        let retries = 3;
        while (retries > 0) {
            try {
                const res = await fetch(item.url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const buffer = await res.arrayBuffer();
                fs.writeFileSync(path.resolve(item.file), Buffer.from(buffer));
                console.log(`Saved: ${item.file}`);
                break;
            } catch (e) {
                retries--;
                console.error(`Failed: ${item.file}, retries left: ${retries}`, e.message);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
}

run();
