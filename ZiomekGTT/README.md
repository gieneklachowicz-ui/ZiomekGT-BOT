# ZiomekGT - Discord Recruitment Bot

Profesjonalny bot Discord z systemem rekrutacji dla serwerów administracyjnych.

## Funkcje

- ✅ Slash command `/reqru` do tworzenia panelu rekrutacyjnego
- ✅ Estetyczny, ciemny panel rekrutacyjny
- ✅ Formularze rekrutacyjne dla 4 rang: Ticket, Helper, Admin, Co-Owner
- ✅ Automatyczne tworzenie prywatnych kanałów rekrutacyjnych
- ✅ Walidacja formularzy (email, długość odpowiedzi)
- ✅ System akceptacji/odrzucania podan
- ✅ Ochrona przed spamem (jedna aktywna rekrutacja na użytkownika)
- ✅ Opcjonalne automatyczne nadawanie ról po akceptacji
- ✅ Wymagana rola do rozpoczęcia rekrutacji na wyższą rangę
- ✅ Gotowy do hostingu 24/7

## Wymagania

- Node.js 18+ lub nowszy
- Discord Bot Token
- Discord Application ID

## Instalacja

1. **Zainstaluj Node.js** (jeśli nie masz)
   - Pobierz z: https://nodejs.org/
   - Wersja 18 lub nowsza

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

3. **Skonfiguruj `.env`**
   - Skopiuj `.env.example` do `.env`:
     ```bash
     copy .env.example .env
     ```
   - Edytuj `.env` i wypełnij wszystkie wymagane wartości

## Avatar Bota

Bot automatycznie ustawia avatar z pliku `avatar.png` w głównym katalogu projektu.

### Jak uzyskać ikonę serwera Discord:

**Metoda 1 - Pobranie przez Discord API:**
```javascript
// Użyj tego skryptu Node.js, aby pobrać ikonę serwera:
const https = require('https');
const fs = require('fs');

const guildId = '1531588084003635251';
const url = `https://cdn.discordapp.com/icons/${guildId}/icon.png?size=512`;

https.get(url, (response) => {
  const file = fs.createWriteStream('avatar.png');
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Avatar pobrany jako avatar.png');
  });
});
```

**Metoda 2 - Manual:**
1. Wejdź na serwer Discord: https://discord.gg/8Pez6p3hgp
2. Kliknij prawym przyciskiem na ikonę serwera (gdy masz Developer Mode włączony)
3. Wybierz "Copy Link" lub pobierz ikonę ręcznie
4. Zapisz jako `avatar.png` w głównym katalogu projektu

**Ważne:**
- Plik `avatar.png` jest w `.gitignore` - nie zostanie wrzucony do repozytorium
- Musisz dodać `avatar.png` do hostingu ręcznie lub przez panel
- Jeśli plik nie istnieje, bot zadziała bez avatara (nie crashuje)

## Konfiguracja `.env`

Wypełnij plik `.env` następującymi wartościami:

### Wymagane:

```env
DISCORD_TOKEN=twój_token_bota
CLIENT_ID=id_aplikacji_discord
```

### Opcjonalne:

```env
# Rola Owner - musisz znać dokładną nazwę roli na serwerze
ROLE_OWNER=『 👑 』OWNER

# Rola Co-Owner
ROLE_CO_OWNER=『 🏆 』CO-OWNER

# Rola Admin
ROLE_ADMIN=『 🛡️ 』ADMIN

# Rola Helper
ROLE_HELPER=『 🔨 』HELPER

# ID ról do automatycznego nadawania po akceptacji
ROLE_TICKET_ID=1538586998606930072
ROLE_HELPER_ID=1538614716220448890
ROLE_ADMIN_ID=1532037241629704212
ROLE_CO_OWNER_ID=1538527038690951168

# Wymagana rola do rozpoczęcia rekrutacji na wyższą rangę
REQUIRED_HIGHER_ROLE_ID=1531596645299523635
```

### Jak uzyskać wymagane wartości:

1. **DISCORD_TOKEN**:
   - Wejdź na https://discord.com/developers/applications
   - Wybierz swoją aplikację
   - Przejdź do "Bot" → "Reset Token" lub "Reset Password"
   - Skopiuj token

2. **CLIENT_ID**:
   - W portalu Developer Portal
   - Wybierz aplikację
   - ID jest widoczny w sekcji "General Information"

3. **ROLE IDs**:
   - Włącz "Developer Mode" w Discord (Ustawienia → Zaawansowane)
   - Kliknij prawym przyciskiem na rolę → "Copy ID"

## Uruchomienie lokalne

### Rejestracja Slash Commands (pierwszy raz):

```bash
npm run register-commands
```

**Uwaga:** Komenda `/reqru` jest globalna - pojawi się na wszystkich serwerach, gdzie jest bot. Może to zająć do godziny.

### Uruchomienie bota:

```bash
npm start
```

**Dla developmentu z auto-reload:**
```bash
npm run dev
```

## Hosting 24/7

### Zalecane hostinge:

1. **Render** (darmowy tier)
   - https://render.com
   - Web Service
   - Automatyczne wdrożenie z GitHub
   - Proste w użyciu

2. **Railway** (darmowy tier)
   - https://railway.app
   - Obsługuje Node.js
   - Łatwe konfiguracje
   - Dobre dla Discord botów

3. **Replit** (darmowy)
   - https://replit.com
   - Uptime Robot do utrzymania aktywności
   - Proste środowisko

4. **VPS (Polecam dla profesjonalnego użycia)**
   - Hetzner (tańszy)
   - DigitalOcean
   - Pełna kontrola
   - PM2 do utrzymania procesu

### Instrukcja dla Render (najprostsza):

1. **Push kod do GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TWOJ_USERNAME/ziomekgt.git
   git push -u origin main
   ```

2. **Zarejestruj się na Render**
   - Wejdź na https://render.com
   - Zaloguj się przez GitHub

3. **Utwórz nowe Web Service**
   - Kliknij "New +" → "Web Service"
   - Połącz z repozytorium GitHub
   - Wybierz repozytorium ZiomekGT

4. **Konfiguracja**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

5. **Dodaj zmienne środowiskowe**
   - W sekcji "Environment Variables" dodaj:
     - `DISCORD_TOKEN` = twój token
     - `CLIENT_ID` = twoje ID aplikacji
     - (opcjonalnie) inne zmienne z `.env`

6. **Dodaj avatar.png**
   - W panelu Render, w sekcji "Files" lub przez GitHub
   - Dodaj plik `avatar.png` do głównego katalogu

7. **Deploy**
   - Kliknij "Deploy"
   - Bot będzie działał 24/7

### Instrukcja dla Railway:

1. **Zarejestruj się na Railway**
   - https://railway.app
   - Zaloguj się przez GitHub

2. **Utwórz nowy projekt**
   - Kliknij "New Project" → "Deploy from GitHub repo"
   - Wybierz repozytorium ZiomekGT

3. **Konfiguracja**
   - Railway automatycznie wykryje Node.js
   - W sekcji "Variables" dodaj zmienne środowiskowe

4. **Dodaj zmienne środowiskowe**
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - (opcjonalnie) inne zmienne

5. **Dodaj avatar.png**
   - W Railway Dashboard
   - Kliknij na projekt → "Files"
   - Dodaj `avatar.png`

6. **Deploy**
   - Kliknij "Deploy"
   - Bot będzie działał 24/7

### Zmienne środowiskowe na hostingu:

**Wymagane:**
- `DISCORD_TOKEN` - token bota
- `CLIENT_ID` - ID aplikacji

**Opcjonalne:**
- `ROLE_OWNER` - nazwa roli Owner
- `ROLE_CO_OWNER` - nazwa roli Co-Owner
- `ROLE_ADMIN` - nazwa roli Admin
- `ROLE_HELPER` - nazwa roli Helper
- `ROLE_TICKET_ID` - ID roli Ticket
- `ROLE_HELPER_ID` - ID roli Helper
- `ROLE_ADMIN_ID` - ID roli Admin
- `ROLE_CO_OWNER_ID` - ID roli Co-Owner
- `REQUIRED_HIGHER_ROLE_ID` - ID wymaganej roli do rekrutacji

### Komendy na hostingu:

**Lokalne:**
```bash
npm install
npm run register-commands
npm start
```

**Hosting:**
- Wszystkie komendy są automatycznie wykonywane przez hosting
- `npm install` - wykonywane podczas build
- `npm start` - wykonywane automatycznie przy starcie

### Czy `/reqru` nadal będzie działać globalnie?

**TAK!** Po wdrożeniu na hosting:
- `/reqru` pozostaje globalną komendą
- Komenda pojawi się na wszystkich serwerach, gdzie jest bot
- Może zająć do godziny na pierwsze rozpropagowanie
- Po pierwszym deploy, komenda będzie dostępna natychmiast na nowych serwerach

**Ważne:**
- Globalne komendy są rejestrowane przez `npm run register-commands`
- Bot nie wymaga `GUILD_ID` w `.env` (opcjonalne)
- Bot może działać na wielu serwerach jednocześnie

## Wymagane Permissions

### Discord Bot Permissions:

Podczas zapraszania bota na serwer, upewnij się że masz następujące uprawnienia:

- **Manage Channels** - do tworzenia kanałów rekrutacyjnych
- **Send Messages** - do wysyłania wiadomości
- **Embed Links** - do wyświetlania embedów
- **Read Message History** - do przeglądania historii kanałów
- **Manage Roles** - opcjonalnie, do automatycznego nadawania ról

### Required Gateway Intents:

Bot używa następujących intents:
- `Guilds` - podstawowe funkcje serwera
- `GuildMessages` - wiadomości na serwerze
- `MessageContent` - treść wiadomości
- `GuildMembers` - informacje o członkach serwera

### Oauth2 Scopes:

Podczas generowania URL zaproszenia użyj:
- `bot`
- `applications.commands`

**Generator URL:** https://discord.com/developers/applications/{YOUR_APP_ID}/oauth2

## Użycie

### Utworzenie panelu rekrutacyjnego:

1. Administrator wpisuje `/reqru` na Discord
2. Wybiera kanał (opcjonalne - domyślnie bieżący kanał)
3. Bot tworzy estetyczny panel rekrutacyjny

### Składanie podania:

1. Użytkownik klika "📝 ZŁÓŻ REKRUTACJĘ"
2. Sprawdzana jest wymagana rola (jeśli skonfigurowano)
3. Użytkownik wybiera rangę (Ticket, Helper, Admin, Co-Owner)
4. Wypełnia formularz:
   - **Ticket/Helper**: wiek, mutacja głosu, powód, dlaczego Ty
   - **Admin/Co-Owner**: email, wiek, mutacja głosu, powód, dlaczego Ty
5. Bot tworzy prywatny kanał `rekrutacja-NICK`
6. Kanał jest widoczny tylko dla użytkownika i ról administracyjnych

### Rozpatrywanie podania:

1. Administratorzy widzą podanie na kanale rekrutacyjnym
2. Klikają **✅ PRZYJMIJ** lub **❌ ODRZUĆ**
3. Bot aktualizuje status i informuje użytkownika
4. Jeśli skonfigurowano ID ról, bot automatycznie nadaje rolę po akceptacji
5. Kanał jest usuwany po 3 sekundach

## Ochrona przed spamem

Bot uniemożliwia użytkownikowi składanie wielu aktywnych rekrutacji jednocześnie:
- Jeśli użytkownik ma już aktywny kanał rekrutacyjny, bot odpowiada: "⚠️ Masz już aktywne zgłoszenie rekrutacyjne."

## Wymagana rola do rekrutacji

Jeśli skonfigurowano `REQUIRED_HIGHER_ROLE_ID`:
- Użytkownicy bez tej roli nie mogą rozpocząć rekrutacji
- Użytkownicy z tą rolą mogą złożyć podanie na wyższą rangę
- Bot sprawdza rolę przed pokazaniem menu wyboru rangi

## Konfiguracja nazw ról

Bot automatycznie szuka ról po **dokładnych nazwach**. Upewnij się, że nazwy w `.env` dokładnie pasują do nazw ról na serwerze.

Domyślne nazwy:
- `『 👑 』OWNER`
- `『 🏆 』CO-OWNER`
- `『 🛡️ 』ADMIN`
- `『 🔨 』HELPER`

Jeśli rola nie zostanie znaleziona:
- Bot nie crashuje
- Loguje ostrzeżenie w konsoli
- Pozostałe znalezione role działają normalnie

## Struktura projektu

```
ZiomekGTT/
├── src/
│   ├── index.js              # Główny plik bota
│   ├── config/
│   │   └── config.js         # Konfiguracja i zmienne środowiskowe
│   ├── commands/
│   │   ├── handleCommand.js  # Router komend
│   │   └── reqru.js          # Komenda /reqru
│   ├── events/
│   │   ├── ready.js          # Event: bot gotowy
│   │   └── interactionCreate.js  # Obsługa interakcji
│   ├── interactions/
│   │   ├── handleButton.js   # Router przycisków
│   │   ├── handleModal.js    # Router formularzy
│   │   ├── buttons/
│   │   │   ├── recruitmentStart.js  # Start rekrutacji
│   │   │   ├── roleSelection.js     # Wybór rangi
│   │   │   ├── accept.js            # Akceptacja
│   │   │   └── reject.js            # Odrzucenie
│   │   └── modals/
│   │       ├── ticketHelperModal.js  # Formularz Ticket/Helper
│   │       └── adminCoOwnerModal.js  # Formularz Admin/Co-Owner
│   └── utils/
│       ├── eventLoader.js     # Ładowanie eventów
│       ├── roleHelper.js      # Funkcje pomocnicze dla ról
│       ├── validation.js      # Walidacja formularzy
│       ├── channelCreator.js  # Tworzenie kanałów
│       ├── recruitmentMessage.js  # Wysyłanie wiadomości z podaniem
│       ├── recruitmentHelper.js    # Sprawdzanie aktywnych rekrutacji
│       └── register-commands.js    # Skrypt rejestracji komend
├── .env.example               # Przykładowa konfiguracja
├── .gitignore                 # Pliki ignorowane przez Git
├── package.json               # Zależności projektu
├── README.md                  # Ten plik
└── avatar.png                 # Avatar bota (niewidoczny w Git)
```

## Rozwiązywanie problemów

### Bot nie odpowiada na komendy:
- Sprawdź czy zarejestrowałeś slash commands: `npm run register-commands`
- Sprawdź czy `CLIENT_ID` w `.env` jest poprawne
- Globalne komendy mogą zająć do godziny na pierwsze rozpropagowanie

### Bot nie może tworzyć kanałów:
- Sprawdź czy bot ma uprawnienie "Manage Channels"
- Sprawdź czy rola bota jest wyżej niż kategorie kanałów

### Formularz nie waliduje poprawnie:
- Sprawdź czy pola są wypełnione
- Email musi być w formacie: user@domain.com
- Odpowiedzi Tak/Nie muszą być dokładnie "Tak" lub "Nie"

### Role nie są nadawane:
- Sprawdź czy skonfigurowałeś `ROLE_*_ID` w `.env`
- Sprawdź czy rola bota jest wyżej niż nadawane role

### Avatar nie jest ustawiony:
- Sprawdź czy plik `avatar.png` istnieje w głównym katalogu
- Plik musi być w formacie PNG
- Sprawdź logi w konsoli bota

### Bot wyłącza się na hostingu:
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź logi w panelu hostingu
- Upewnij się, że `npm start` jest poprawną komendą startową

## Bezpieczeństwo

⚠️ **WAŻNE:**
- Nigdy nie commituj pliku `.env` do repozytorium
- `.env` jest w `.gitignore`
- Używaj `.env.example` jako szablonu
- Nie udostępniaj tokenów bota publicznie
- Avatar jest w `.gitignore` - dodaj go ręcznie na hostingu

## Licencja

ISC
