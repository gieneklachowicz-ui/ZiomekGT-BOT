import { REST, Routes } from 'discord.js';
import { config, validateConfig } from '../config/config.js';
import { data } from '../commands/reqru.js';

validateConfig();

const commands = [data.toJSON()];

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  try {
    console.log('🌍 Rozpoczynam globalną rejestrację slash commands...');

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    console.log('✅ Pomyślnie zarejestrowano komendy globalnie!');
    console.log('🌍 /reqru będzie dostępne na wszystkich serwerach, na których jest bot.');
    console.log('⏳ Globalne komendy mogą potrzebować kilku minut na pojawienie się.');
  } catch (error) {
    console.error('❌ Błąd podczas rejestracji komend:', error);
    process.exit(1);
  }
}

registerCommands();