import fs from 'fs';
import path from 'path';
import https from 'https';
import { PLAYER_IDENTITIES } from '../src/lib/player_identities';

const avatarsDir = path.join(process.cwd(), 'public', 'avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'FIFA-Market-App/1.0 (Contact: admin@fifa-market.local)'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve());
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  const updatedIdentities = [];
  
  for (const player of PLAYER_IDENTITIES) {
    if (player.avatarUrl.includes('ui-avatars.com')) {
      console.log(`Skipping placeholder for ${player.name}`);
      updatedIdentities.push(player);
      continue;
    }

    const filename = player.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
    const localPath = path.join(avatarsDir, filename);
    const publicUrl = `/avatars/${filename}`;

    try {
      console.log(`Downloading ${player.name}...`);
      await downloadImage(player.avatarUrl, localPath);
      
      updatedIdentities.push({
        name: player.name,
        avatarUrl: publicUrl
      });
      
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Failed to download ${player.name}:`, err);
      updatedIdentities.push(player); // Fallback to original url
    }
  }

  const content = `// Auto-generated player identities pool (local avatars)\nexport const PLAYER_IDENTITIES = ${JSON.stringify(updatedIdentities, null, 2)};\n`;
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/player_identities.ts'), content);
  
  console.log("Finished downloading all avatars and updated identities!");
}

main();
