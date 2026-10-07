# ZiomekGT — OAuth2 + Vercel + Upstash Redis

Projekt jest przygotowany do rozdzielenia na:
- **web/** → Vercel (Next.js)
- **bot/** → dowolny host uruchamiający Pythona 24/7
- **Upstash Redis** → wspólna baza konfiguracji i zgłoszeń

## 1. Upstash
Utwórz darmową bazę Redis w Upstash i skopiuj:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 2. Vercel
Importuj repozytorium jako projekt Vercel.
W ustawieniach projektu ustaw **Root Directory = `web`**.
Dodaj zmienne:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL` = adres Vercel, np. `https://ziomekgt-panel.vercel.app`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 3. Discord Developer Portal
W OAuth2 → Redirects dodaj:
`https://TWOJA-DOMENA.vercel.app/api/auth/callback`

Scopes OAuth2 używane przez panel: `identify guilds`.

## 4. Bot
W `bot/.env` ustaw:
- `DISCORD_TOKEN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Zainstaluj:
`pip install -r requirements.txt`

Uruchom:
`python bot.py`

Bot i Vercel muszą używać **tej samej bazy Upstash**.

## Ważne
Nie wrzucaj `.env` ani żadnych tokenów do GitHuba.
