# ZiomekGT — pełny OAuth2 + API

## Co zostało dodane

- Logowanie przez Discord OAuth2.
- Sesja HTTP-only podpisana HMAC.
- Lista serwerów użytkownika.
- Pokazywane są tylko serwery, gdzie użytkownik ma `Manage Server`/Administratora i gdzie bot jest obecny.
- Kanały i role są pobierane z Discord API przez token bota.
- API konfiguracji jest chronione OAuth2 + sprawdzeniem uprawnień.
- Konfiguracja panelu:
  - kanał,
  - tytuł,
  - opis,
  - stopka,
  - włączanie rang,
  - nazwy rang,
  - email,
  - 13+,
  - mutacja głosu,
  - role mające dostęp do prywatnych zgłoszeń.
- Bot sprawdza bazę co 8 sekund i automatycznie aktualizuje panel po zmianie konfiguracji.

## 1. Discord Developer Portal

W aplikacji Discord:

### OAuth2 → General

Redirect URL:

```text
http://localhost:3000/api/auth/callback
```

Po wrzuceniu strony na domenę zmień na:

```text
https://TWOJA-DOMENA/api/auth/callback
```

Potrzebujesz:
- Client ID
- Client Secret

### Bot

Skopiuj token bota.

Bot powinien mieć:
- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels

Bot musi być dodany do serwera.

## 2. Uruchomienie

### Bot

```powershell
cd bot
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Skopiuj `.env.example` do `.env`:

```env
DISCORD_TOKEN=...
DATABASE_FILE=../ziomekgt.db
```

Uruchom:

```powershell
python bot.py
```

### Web

W drugim terminalu:

```powershell
cd web
npm install
```

Skopiuj `.env.local.example` do `.env.local`:

```env
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_BOT_TOKEN=...
SESSION_SECRET=minimum-32-znaki-losowe
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_FILE=../ziomekgt.db
```

Uruchom:

```powershell
npm run dev
```

Otwórz:

```text
http://localhost:3000
```

## Ważne

Bot i panel muszą mieć dostęp do TEJ SAMEJ bazy SQLite, jeśli używasz SQLite.

Jeśli bot i panel będą na dwóch osobnych hostingach, nie używaj lokalnego SQLite jako wspólnej bazy. Wtedy trzeba przełączyć projekt na PostgreSQL/Redis.

Nigdy nie publikuj:
- DISCORD_TOKEN
- DISCORD_BOT_TOKEN
- DISCORD_CLIENT_SECRET
- SESSION_SECRET
- pliku `.env`

OAuth2 nie daje stronie uprawnień do serwera. Strona sprawdza, czy użytkownik ma `Manage Server` lub Administratora, a operacje Discord API wykonuje bot swoim tokenem.
