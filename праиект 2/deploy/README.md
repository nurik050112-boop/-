# Stick Duel Arena

Browser stickman duel game with bot, 2-player mode, weapons, arenas, and LAN multiplayer.
Scores and match results are saved locally. Supabase sync is supported when configured.

## Run Locally

Open `index.html` for offline single-device play.

For LAN multiplayer, start the local server:

```powershell
node server.js
```

Open this on the host computer:

```text
http://localhost:3000
```

To play from another phone or computer on the same Wi-Fi, find the host IP:

```powershell
ipconfig
```

Then open:

```text
http://HOST_IP:3000
```

Example:

```text
http://192.168.1.25:3000
```

## LAN Mode

1. On the first device, choose a room name and press `Host LAN`.
2. On the second device, enter the same room name and press `Join LAN`.
3. The host controls P1. The joined player controls P2.

## Controls

- P1: `A`, `D`, `W`, `F`
- P2: arrows and `/`
- Change weapon: `Space` or the weapon button
- Pause: `Esc` or `II`

Touch buttons work on phones and tablets.

## Supabase Save

1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. Open `config.js`.
4. Put your project URL and anon public key:

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY"
};
```

The game always saves locally first. When Supabase is configured, every finished round is also inserted into the `matches` table.
