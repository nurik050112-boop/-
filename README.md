# 🚀 nFactorial Teens — Стартовый шаблон

Твоя отправная точка. Здесь уже готовы: стартовая страница с маршрутами, примеры **входа по
email** и **базы данных**, а также AI-функция. Дальше ты переделаешь их под свою идею с помощью
**Codex**.

Стек: **Vite + React + TypeScript + Supabase + Vercel**.

---

## ✅ Запуск за 8 шагов (День 2)

> Всё по галочкам. Застрял на шаге — подними руку, не прыгай дальше.

1. **Возьми свою копию.** На GitHub нажми зелёную кнопку **«Use this template» → Create a new
   repository**. Назови репозиторий своим именем проекта. Это твоя копия, не оригинал.

2. **Открой в VSCode.** Скопируй ссылку своего репо → в терминале:
   ```bash
   git clone <ссылка-твоего-репо>
   cd <папка-проекта>
   code .
   ```

3. **Установи зависимости.** Нужен Node.js 22. В терминале VSCode:
   ```bash
   node --version
   npm install
   ```

4. **Создай проект в Supabase.** Зайди на [supabase.com](https://supabase.com) → **New project**.
   Запомни пароль базы. Подожди ~2 минуты, пока проект поднимется.

5. **Вставь ключи.** Скопируй файл `.env.example` → переименуй копию в `.env`.
   В Supabase: **Project Settings → API Keys**. Скопируй **Project URL** и **Publishable key**
   (`sb_publishable_...`; если показывается старый интерфейс — legacy **anon** key),
   вставь в `.env`:
   ```
   VITE_SUPABASE_URL=https://твой-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_твой-ключ
   ```
   ⚠️ `.env` НЕ коммить — он уже в `.gitignore`.

6. **Подключи базу командами — сам, руками.** Не через Codex: он путается в интерактивных
   командах. Вводи по одной, прямо в терминале VSCode (сначала проверь `pwd` — ты в папке проекта):

   Войти в Supabase (один раз на этом компьютере; откроется браузер):
   ```bash
   npm run db:login
   ```
   Привязать проект (REF — из адреса базы `https://REF.supabase.co`; тоже один раз):
   ```bash
   npm run db:link -- --project-ref REF
   ```
   Если спросит пароль базы — введи его **прямо в терминал**. Символы не видны при вводе — это
   нормально. Пароль или access token в чат не отправляй никому и никогда.

   Применить миграции (создаст таблицу `entries`):
   ```bash
   npm run db:push -- --dry-run
   npm run db:push -- --yes
   ```
   Увидел `Remote database is up to date` — всё уже готово.

   > ⚠️ В терминал вставляй **только строки из блоков кода**. Обычный текст задания терминал
   > понимает как команды и пишет `command not found`.

7. **Запусти локально.**
   ```bash
   npm run dev
   ```
   Открой ссылку из терминала (обычно `http://localhost:5173`). Увидишь простой приветственный
   экран «Привет! 🚀» — это и есть твой пустой проект. Дальше наполняешь его своей идеей через Codex.

   > Вход и база данных уже готовы как примеры в `src/components/Auth.tsx` и `Entries.tsx` —
   > попроси Codex подключить их, когда понадобятся (логины и сохранение данных).

8. **Выложи в интернет (Vercel).** Залей код на GitHub:
   ```bash
   git add .
   git commit -m "first version"
   git push
   ```
   На [vercel.com](https://vercel.com) → **Add New → Project** → выбери свой репозиторий.
   В **Environment Variables** добавь те же `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` →
   **Deploy**. Через минуту у тебя будет **живая ссылка**. Это и есть твой проект в интернете.

   После Deploy открой в Supabase **Authentication → URL Configuration**: поставь живую ссылку
   Vercel в **Site URL**, а `http://localhost:5173/**` добавь в **Redirect URLs**. Тогда ссылки
   подтверждения email будут возвращать пользователя в правильное приложение.

---

## 😴 Чтобы проект не «уснул»

Бесплатный Supabase ставит проект на **паузу после недели без запросов** — и живая ссылка
перестаёт работать. Чтобы проект жил сам, в репо уже есть робот
`.github/workflows/keep-awake.yml` — он раз в день делает один тихий запрос к твоей базе.

Настрой это сразу после `npm run db:push` — одной командой, сам:

```bash
npm run keep-awake:setup
```

Команда сама прочитает два значения из `.env`, сохранит их как **GitHub Actions Secrets**,
проверит настоящий запрос к таблице `entries`, запустит workflow и дождётся результата.
Успех — строка:

```
Keep-alive verified: https://github.com/.../actions/runs/...
```

Если увидишь ошибку про GitHub (`gh`) — нужно один раз войти:

```bash
gh auth login
```
Выбери: **GitHub.com** → **HTTPS** → **Login with a web browser**. После входа снова выполни
`npm run keep-awake:setup`.

> `service_role` ключ нельзя использовать никогда.
>
> GitHub может приостановить расписание после ~60 дней полного простоя репо — тогда хватит
> одного клика «Enable workflow», чтобы снова запустить.

---

## 🔁 Главный цикл (каждый день)

```
просишь Codex что-то сделать  →  смотришь что он изменил  →
проверяешь что всё работает (npm run dev)  →  git push  →  Vercel сам обновляет ссылку
```

**Проверка перед push:** приложение запускается? нет красных ошибок? Тогда коммить.

---

## 📂 Что где лежит

| Файл | Что это |
|------|---------|
| `src/App.tsx` | Только маршруты приложения |
| `src/pages/` | Отдельные экраны: главная, игра, профиль и другие |
| `src/components/Auth.tsx` | Вход и регистрация |
| `src/components/Entries.tsx` | Пример работы с базой (читать/добавить/удалить) |
| `src/lib/supabase.ts` | Подключение к Supabase |
| `supabase/migrations/` | Таблицы базы (применяются `npm run db:push`) |
| `supabase/functions/ai/` | AI на бесплатном ключе Gemini (день 5) |
| `AGENTS.md` | Контекст для Codex — он читает это сам |
| `CODEX_SETUP.md` | Готовые промпты для Codex по дням |

---

## 🤖 AI (день 5) — бесплатный Gemini

Внутри уже есть AI-функция (`supabase/functions/ai`). Чтобы включить:
1. Возьми бесплатный ключ: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Добавь в `.env` строку `GEMINI_API_KEY=твой_ключ`
3. Загрузи секрет: `npm run ai:secret`
4. Задеплой: `npm run ai:deploy`
5. Вызывай из кода: `supabase.functions.invoke('ai', { body: { prompt, system } })` → `data.text`

---

## 🆘 Если сломалось

- **Подсказка «Сначала подключи Supabase»** → не вставил ключи в `.env` (шаг 5).
- **«relation entries does not exist»** → не сделал `npm run db:push` (шаг 6).
- **`db:push` ругается на доступ** → сначала `npm run db:login`, потом `npm run db:link`.
- **На Vercel пусто, локально работает** → забыл добавить Environment Variables на Vercel (шаг 8).
- **Codex сломал код** → не коммить! Попроси Codex починить или откати изменения в VSCode.
