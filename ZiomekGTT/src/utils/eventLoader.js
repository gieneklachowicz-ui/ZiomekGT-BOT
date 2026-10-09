import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '..', 'events');
  const eventFiles = (await readdir(eventsPath)).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const { default: event } = await import(`file://${filePath.replace(/\\/g, '/')}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`✅ Załadowano event: ${event.name}`);
  }
}
