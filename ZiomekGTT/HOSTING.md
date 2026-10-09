# Hosting ZiomekGT - Instrukcja

## Szybki start na hostingu

### 1. Pobierz avatar bota

**Opcja A - Automatyczne pobranie:**
```bash
npm run download-avatar
```

**Opcja B - Manual:**
1. Wejdź na serwer: https://discord.gg/8Pez6p3hgp
2. Kliknij prawym przyciskiem na ikonę serwera (włącz Developer Mode)
3. Zapisz ikonę jako `avatar.png` w głównym katalogu projektu

### 2. Utwórz `.env`

Skopiuj `.env.example` do `.env` i wypełnij:
```bash
copy .env.example .env
```

Wypełnij wymagane wartości:
- `DISCORD_TOKEN` = twój token
- `CLIENT_ID` = twoje ID aplikacji

### 3. Push do GitHub

```bash
git init
git add .
git commit -m "Deploy ZiomekGT"
git branch -M main
git remote add origin https://github.com/TWOJ_USERNAME/ziomekgt.git
git push -u origin main
```

**WAŻNE:** Dodaj `avatar.png` do GitHub lub hostingu ręcznie (plik jest w .gitignore)

---

## Zalecane hostinge

### 🥇 Render (najprostszy)

**Plusy:**
- Darmowy tier
- Automatyczne wdrożenie z GitHub
- Proste w użyciu
- Dobre dla Discord botów

**Instrukcja:**

1. Wejdź na https://render.com
2. Zaloguj się przez GitHub
3. Kliknij "New +" → "Web Service"
4. Połącz z repozytorium GitHub
5. Konfiguracja:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Dodaj zmienne środowiskowe:
   - `DISCORD_TOKEN` = twój token
   - `CLIENT_ID` = twoje ID aplikacji
7. Dodaj `avatar.png`:
   - W panelu Render
   - Sekcja "Files" lub "Assets"
   - Dodaj plik
8. Kliknij "Deploy"

---

### 🥈 Railway

**Plusy:**
- Darmowy tier
- Łatwa konfiguracja
- Dobre dla Discord botów

**Instrukcja:**

1. Wejdź na https://railway.app
2. Zaloguj się przez GitHub
3. Kliknij "New Project" → "Deploy from GitHub repo"
4. Wybierz repozytorium
5. W sekcji "Variables" dodaj:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
6. Dodaj `avatar.png`:
   - W Railway Dashboard
   - Kliknij projekt → "Files"
   - Dodaj plik
7. Kliknij "Deploy"

---

### 🥉 Replit

**Plusy:**
- Darmowy
- Proste środowisko
- Natychmiastowy start

**Instrukcja:**

1. Wejdź na https://replit.com
2. Utwórz nowy "Repl" → Node.js
3. Przenieś wszystkie pliki projektu
4. Dodaj `.env` z wartościami
5. Dodaj `avatar.png`
6. Uruchom: `npm install && npm start`
7. Użyj Uptime Robot do utrzymania aktywności

---

### 🏆 VPS (profesjonalne)

**Polecam:**
- Hetzner (tańszy, ~4€/miesiąc)
- DigitalOcean (~6$/miesiąc)

**Instrukcja:**

1. Kup VPS
2. SSH: `ssh root@twoje-ip`
3. Zainstaluj Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   ```
4. Zainstaluj PM2:
   ```bash
   npm install -g pm2
   ```
5. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/TWOJ_USERNAME/ziomekgt.git
   cd ziomekgt
   ```
6. Utwórz `.env`
7. Uruchom:
   ```bash
   npm install
   npm run register-commands
   pm2 start src/index.js --name ziomekgt
   pm2 save
   pm2 startup
   ```

---

## Zmienne środowiskowe na hostingu

### Wymagane:
- `DISCORD_TOKEN` - token bota
- `CLIENT_ID` - ID aplikacji

### Opcjonalne:
- `ROLE_OWNER` - nazwa roli Owner
- `ROLE_CO_OWNER` - nazwa roli Co-Owner
- `ROLE_ADMIN` - nazwa roli Admin
- `ROLE_HELPER` - nazwa roli Helper
- `ROLE_TICKET_ID` - ID roli Ticket
- `ROLE_HELPER_ID` - ID roli Helper
- `ROLE_ADMIN_ID` - ID roli Admin
- `ROLE_CO_OWNER_ID` - ID roli Co-Owner
- `REQUIRED_HIGHER_ROLE_ID` - ID wymaganej roli do rekrutacji

---

## Komendy do wykonania

### Lokalne:
```bash
# Instalacja
npm install

# Pobierz avatar
npm run download-avatar

# Zarejestruj komendy (tylko pierwsze uruchomienie)
npm run register-commands

# Uruchom bota
npm start
```

### Hosting:
- Wszystkie komendy są automatyczne
- `npm install` - podczas build
- `npm start` - automatycznie przy starcie

---

## Czy `/reqru` będzie działać globalnie?

**TAK!** Po wdrożeniu:
- `/reqru` pozostaje globalną komendą
- Działa na wszystkich serwerach, gdzie jest bot
- Pierwsze rozpropagowanie może zająć do godziny
- Po pierwszym deploy, działa natychmiast na nowych serwerach

**Ważne:**
- Globalne komendy są rejestrowane przez `npm run register-commands`
- Bot nie wymaga `GUILD_ID` w `.env`
- Bot może działać na wielu serwerach jednocześnie

---

## Checklist przed wdrożeniem

- [ ] Utwórz `.env` z wymaganych wartościami
- [ ] Pobierz `avatar.png` do głównego katalogu
- [ ] Zarejestruj komendy: `npm run register-commands`
- [ ] Przetestuj lokalnie: `npm start`
- [ ] Push do GitHub
- [ ] Dodaj `avatar.png` na hostingu (lub GitHub)
- [ ] Dodaj zmienne środowiskowe na hostingu
- [ ] Deploy
- [ ] Sprawdź logi hostingu
- [ ] Przetestuj `/reqru` na Discord

---

## Rozwiązywanie problemów

### Bot nie startuje na hostingu:
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź logi w panelu hostingu
- Upewnij się, że `npm start` jest poprawną komendą

### Avatar nie jest ustawiony:
- Sprawdź czy `avatar.png` istnieje na hostingu
- Plik musi być w głównym katalogu
- Sprawdź logi bota

### Komenda `/reqru` nie działa:
- Upewnij się, że wykonałeś `npm run register-commands`
- Globalne komendy mogą zająć do godziny
- Sprawdź czy `CLIENT_ID` jest poprawne

### Bot wyłącza się po czasie:
- Na darmowych tierach może to się zdarzyć
- Użyj Uptime Robot (dla Replit)
- Rozważ VPS dla 24/7 gwarancji

---

## Monitorowanie

### Render:
- Dashboard → Logs
- Automatyczne powiadomienia o błędach

### Railway:
- Dashboard → Logs
- Real-time monitoring

### VPS z PM2:
```bash
pm2 logs ziomekgt
pm2 status
pm2 restart ziomekgt
```

---

## Aktualizacje bota

Po zmianach w kodzie:

1. Commit zmian:
   ```bash
   git add .
   git commit -m "Update bot"
   git push
   ```

2. Hosting automatycznie wykryje zmiany i redeployuje

3. Dla VPS:
   ```bash
   cd ziomekgt
   git pull
   pm2 restart ziomekgt
   ```
