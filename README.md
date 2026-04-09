# Финансова Управленска Система

Next.js + Supabase приложение за управленски финансов дашборд (Owner) и оперативни екрани (Owner/Secretary).

## Local Development

1) `cp .env.local.example .env.local` и попълни ключовете
2) `npm install`
3) `npm run dev`

## Supabase

- Схемата е в `supabase/schema.sql`
- Миграциите са в `supabase/migrations/`
- Първият owner потребител се създава през Supabase Auth (Invite), после запис в `profiles`

## Deploy

Проектът е съвместим с Vercel. При свързване към GitHub всеки `git push` деплойва автоматично.
