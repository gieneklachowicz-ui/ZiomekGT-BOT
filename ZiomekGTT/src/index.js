import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config, validateConfig } from './config/config.js';
import { loadEvents } from './utils/eventLoader.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

validateConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
  ],
});

await loadEvents(client);

client.on('ready', async () => {
  console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
  console.log(`📊 Obsługuję ${client.guilds.cache.size} serwerów`);

  // Ustaw avatar bota, jeśli plik istnieje
  try {
    const avatarPath = join(__dirname, '..', 'avatar.png');
    const avatarBuffer = readFileSync(avatarPath);
    await client.user.setAvatar(avatarBuffer);
    console.log('✅ Avatar bota został ustawiony');
  } catch (error) {
    // Plik nie istnieje lub nie można go odczytać - kontynuuj bez avatara
    if (error.code !== 'ENOENT') {
      console.warn('⚠️ Nie udało się ustawić avatara:', error.message);
    }
  }
});

client.login(config.token);

// Obsługa błędów krytycznych
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});
