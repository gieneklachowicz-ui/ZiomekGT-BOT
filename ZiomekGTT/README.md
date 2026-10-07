# ZiomekGT — Discord Recruitment Dashboard

Projekt przygotowany pod Vercel + Upstash Redis.

## Web
- Next.js 15.5.27 (patched 15.x release)
- Discord OAuth2
- Upstash Redis
- brak SQLite / better-sqlite3
- sharp ma jawnie dozwolony install script przez `allowScripts`

### Vercel
Ustaw Root Directory na `web`.

Environment Variables:
- DISCORD_CLIENT_ID
- DISCORD_CLIENT_SECRET
- DISCORD_BOT_TOKEN
- SESSION_SECRET
- NEXT_PUBLIC_APP_URL
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

Po pierwszym deployu ustaw Discord OAuth2 Redirect URL:
`https://TWOJA-DOMENA/api/auth/callback`

## Bot
Bot jest w folderze `bot/` i używa tych samych danych Upstash Redis.
