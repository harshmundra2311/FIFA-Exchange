import fs from 'fs';
import { PLAYER_IDENTITIES } from '../src/lib/player_identities';

let md = '# Real Player Photo Avatars\\n\\nHere are the 50 real photographs automatically fetched from Wikipedia to be used as player avatars.\\n\\n| Player | Photo |\\n| :--- | :---: |\\n';

PLAYER_IDENTITIES.forEach(p => {
  md += `| **${p.name}** | ![](${p.avatarUrl}) |\\n`;
});

fs.writeFileSync('C:/Users/mundr/.gemini/antigravity-ide/brain/0586fe12-468a-4977-9191-4003ca55fa1c/real_photos_preview.md', md);
console.log('Preview generated!');
