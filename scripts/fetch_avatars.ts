import fs from 'fs';
import path from 'path';

const players = [
  "Cristiano Ronaldo", "Lionel Messi", "Kylian Mbappé", "Erling Haaland", "Neymar",
  "Vinícius Júnior", "Jude Bellingham", "Lamine Yamal", "Mohamed Salah", "Harry Kane",
  "Kevin De Bruyne", "Rodri", "Pedri", "Martin Ødegaard", "Bruno Fernandes",
  "Federico Valverde", "Bernardo Silva", "Frenkie de Jong", "Bukayo Saka", "Phil Foden",
  "Cole Palmer", "Jamal Musiala", "Florian Wirtz", "Arda Güler", "Khvicha Kvaratskhelia",
  "Lautaro Martínez", "Julián Álvarez", "Antoine Griezmann", "Ousmane Dembélé", "Victor Osimhen",
  "Rafael Leão", "Son Heung-min", "Takefusa Kubo", "Darwin Núñez", "Luis Díaz",
  "Virgil van Dijk", "Achraf Hakimi", "Alphonso Davies", "Antonio Rüdiger", "Rúben Dias",
  "Thibaut Courtois", "Emiliano Martínez", "Robert Lewandowski", "Luka Modrić", "Romelu Lukaku",
  "Christian Pulisic", "Sadio Mané", "Hakan Çalhanoğlu", "João Félix", "Moisés Caicedo"
];

async function fetchWikipediaThumbnail(name: string) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=300&redirects=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FIFA-Market-App/1.0 (Contact: admin@fifa-market.local)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === "-1" || !pages[pageId].thumbnail) {
      // Fallback: Use standard generic user avatar if Wikipedia fails
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=161c24&color=fff&size=300`;
    }
    
    return pages[pageId].thumbnail.source;
  } catch (err) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=161c24&color=fff&size=300`;
  }
}

async function main() {
  console.log("Fetching player thumbnails...");
  const identities = [];
  
  for (const name of players) {
    console.log(`Fetching ${name}...`);
    const imgUrl = await fetchWikipediaThumbnail(name);
    identities.push({
      name,
      avatarUrl: imgUrl
    });
  }
  
  const content = `// Auto-generated player identities pool\nexport const PLAYER_IDENTITIES = ${JSON.stringify(identities, null, 2)};\n`;
  
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/player_identities.ts'), content);
  console.log("Done! Saved to src/lib/player_identities.ts");
}

main();
