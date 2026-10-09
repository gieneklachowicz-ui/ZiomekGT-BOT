import https from 'https';
import fs from 'fs';

const guildId = '1531588084003635251';
const url = `https://cdn.discordapp.com/icons/${guildId}/icon.png?size=512`;

console.log('🔄 Pobieranie ikony serwera...');

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error('❌ Nie udało się pobrać ikony. Status:', response.statusCode);
    return;
  }

  const file = fs.createWriteStream('avatar.png');
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('✅ Avatar pobrany jako avatar.png');
    console.log('📁 Umieść plik avatar.png w głównym katalogu projektu.');
  });
}).on('error', (error) => {
  console.error('❌ Błąd podczas pobierania:', error.message);
});
