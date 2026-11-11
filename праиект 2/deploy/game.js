const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  menu: document.getElementById("menu"),
  playBtn: document.getElementById("playBtn"),
  botBtn: document.getElementById("botBtn"),
  hostBtn: document.getElementById("hostBtn"),
  joinBtn: document.getElementById("joinBtn"),
  roomInput: document.getElementById("roomInput"),
  arenaSelect: document.getElementById("arenaSelect"),
  p1Health: document.getElementById("p1Health"),
  p2Health: document.getElementById("p2Health"),
  p1Score: document.getElementById("p1Score"),
  p2Score: document.getElementById("p2Score"),
  roundText: document.getElementById("roundText"),
  message: document.getElementById("message"),
  saveStatus: document.getElementById("saveStatus"),
  statsText: document.getElementById("statsText"),
  pauseBtn: document.getElementById("pauseBtn"),
  restartBtn: document.getElementById("restartBtn"),
  weaponBtn: document.getElementById("weaponBtn")
};

const keys = Object.create(null);
const held = Object.create(null);

const weapons = [
  { name: "swords", reach: 88, damage: 15, color: "#ff7629", width: 8, head: "blade" },
  { name: "hammers", reach: 76, damage: 24, color: "#222831", width: 15, head: "hammer" },
  { name: "spears", reach: 118, damage: 12, color: "#d9e6f7", width: 6, head: "spear" },
  { name: "drills", reach: 98, damage: 18, color: "#2b2f39", width: 13, head: "drill" }
];

const arenas = {
  ice: {
    sky: ["#98d1ff", "#eef8ff"],
    far: "#cfe7ff",
    ground: "#45556e",
    top: "#d9f2ff",
    accent: "#ffffff",
    platforms: [
      { x: 58, y: 432, w: 844, h: 34 },
      { x: 145, y: 328, w: 190, h: 21 },
      { x: 625, y: 328, w: 190, h: 21 },
      { x: 386, y: 245, w: 188, h: 18 }
    ]
  },
  forest: {
    sky: ["#90dc95", "#f3ffe2"],
    far: "#70b96f",
    ground: "#314b3a",
    top: "#80c45f",
    accent: "#1f6f47",
    platforms: [
      { x: 64, y: 430, w: 830, h: 36 },
      { x: 118, y: 310, w: 230, h: 22 },
      { x: 618, y: 306, w: 230, h: 22 },
      { x: 380, y: 218, w: 205, h: 20 }
    ]
  },
  lava: {
    sky: ["#f2a24d", "#ffe6ab"],
    far: "#963f3f",
    ground: "#322831",
    top: "#ef6d32",
    accent: "#ffcf52",
    platforms: [
      { x: 74, y: 422, w: 812, h: 36 },
      { x: 190, y: 324, w: 170, h: 22 },
      { x: 600, y: 324, w: 170, h: 22 },
      { x: 415, y: 252, w: 130, h: 18 }
    ]
  }
};

let weaponIndex = 0;
let arenaKey = "ice";
let round = 1;
let freeze = 0;
let paused = false;
let running = false;
let botMode = true;
let shake = 0;
let p1;
let p2;
let net = {
  socket: null,
  role: "local",
  connected: false,
  lastSend: 0
};

const state = {
  p1Score: 0,
  p2Score: 0,
  particles: [],
  stats: {
    p1Wins: 0,
    p2Wins: 0,
    rounds: 0,
    matches: []
  }
};

const SAVE_KEY = "stick-duel-arena-save-v1";
const deviceId = getDeviceId();

function getDeviceId() {
  const key = "stick-duel-arena-device-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    localStorage.setItem(key, value);
  }
  return value;
}

function loadSave() {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    state.stats = { ...state.stats, ...(save.stats || {}) };
    state.p1Score = save.p1Score || 0;
    state.p2Score = save.p2Score || 0;
    weaponIndex = save.weaponIndex || 0;
    arenaKey = save.arenaKey || "ice";
    ui.arenaSelect.value = arenaKey;
    ui.roomInput.value = save.room || "room1";
  } catch {
    ui.message.textContent = "Save file reset";
  }
}

function saveLocal() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    p1Score: state.p1Score,
    p2Score: state.p2Score,
    weaponIndex,
    arenaKey,
    room: ui.roomInput.value,
    stats: state.stats
  }));
  updateSaveUi("local");
}

function updateSaveUi(mode) {
  ui.saveStatus.textContent = `Save: ${mode}`;
  ui.statsText.textContent = `Wins ${state.stats.p1Wins} / ${state.stats.p2Wins}`;
}

async function saveSupabase(match) {
  const config = window.SUPABASE_CONFIG || {};
  if (!config.url || !config.anonKey) return;

  const endpoint = `${config.url.replace(/\/$/, "")}/rest/v1/matches`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${config.anonKey}`,
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify({
      device_id: deviceId,
      winner: match.winner,
      p1_score: match.p1Score,
      p2_score: match.p2Score,
      arena: match.arena,
      weapon: match.weapon,
      mode: match.mode
    })
  });

  if (!response.ok) throw new Error(`Supabase save failed: ${response.status}`);
  updateSaveUi("local + Supabase");
}

function recordRound(winner) {
  const match = {
    winner,
    p1Score: state.p1Score,
    p2Score: state.p2Score,
    arena: arenaKey,
    weapon: weapons[weaponIndex].name,
    mode: net.role === "host" || net.role === "join" ? "lan" : botMode ? "bot" : "two_players",
    savedAt: new Date().toISOString()
  };
  state.stats.rounds++;
  if (winner === "p1") state.stats.p1Wins++;
  else state.stats.p2Wins++;
  state.stats.matches.unshift(match);
  state.stats.matches = state.stats.matches.slice(0, 20);
  saveLocal();
  saveSupabase(match).catch(() => updateSaveUi("local only"));
}

function fighter(x, color, facing, controls) {
  return {
    x,
    y: 155,
    vx: 0,
    vy: 0,
    r: 20,
    color,
    facing,
    controls,
    health: 100,
    grounded: false,
    attack: 0,
    cooldown: 0,
    wobble: Math.random() * 9,
    stunned: 0
  };
}

function startGame(useBot) {
  botMode = useBot;
  net.role = "local";
  running = true;
  paused = false;
  round = 1;
  state.p1Score = 0;
  state.p2Score = 0;
  arenaKey = ui.arenaSelect.value;
  saveLocal();
  ui.menu.classList.add("hidden");
  resetRound("Fight!");
}

function startLan(role) {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const room = encodeURIComponent(ui.roomInput.value.trim() || "room1");
  const socket = new WebSocket(`${protocol}//${location.host}/ws?room=${room}&role=${role}`);
  net = { socket, role, connected: false, lastSend: 0 };
  botMode = false;
  running = role === "host";
  paused = false;
  arenaKey = ui.arenaSelect.value;
  saveLocal();
  ui.menu.classList.add("hidden");
  resetRound(role === "host" ? "Waiting for player 2..." : "Joining LAN room...");

  socket.addEventListener("open", () => {
    net.connected = true;
    ui.message.textContent = role === "host" ? "LAN host ready" : "Connected as P2";
    if (role === "host") sendNet({ type: "arena", arenaKey, weaponIndex });
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "input" && role === "host") {
      held.p2Left = data.input.left;
      held.p2Right = data.input.right;
      held.p2Jump = data.input.jump;
      if (data.input.strike) strike(p2, p1);
    }
    if (data.type === "state" && role === "join") {
      applyRemoteState(data);
    }
    if (data.type === "arena" && role === "join") {
      arenaKey = data.arenaKey;
      weaponIndex = data.weaponIndex;
      updateUi();
    }
  });

  socket.addEventListener("close", () => {
    net.connected = false;
    ui.message.textContent = "LAN disconnected";
  });
}

function resetRound(text) {
  p1 = fighter(250, "#12f1e3", 1, { left: "KeyA", right: "KeyD", jump: "KeyW", strike: "KeyF" });
  p2 = fighter(710, "#fff000", -1, { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", strike: "Slash" });
  state.particles.length = 0;
  freeze = 45;
  ui.message.textContent = text;
  updateUi();
}

function sendNet(payload) {
  if (!net.socket || net.socket.readyState !== WebSocket.OPEN) return;
  net.socket.send(JSON.stringify(payload));
}

function packFighter(f) {
  return {
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    facing: f.facing,
    health: f.health,
    grounded: f.grounded,
    attack: f.attack,
    cooldown: f.cooldown,
    wobble: f.wobble,
    stunned: f.stunned
  };
}

function unpackFighter(target, source) {
  Object.assign(target, source);
}

function applyRemoteState(data) {
  if (!p1 || !p2) return;
  running = true;
  paused = data.paused;
  round = data.round;
  weaponIndex = data.weaponIndex;
  arenaKey = data.arenaKey;
  state.p1Score = data.p1Score;
  state.p2Score = data.p2Score;
  unpackFighter(p1, data.p1);
  unpackFighter(p2, data.p2);
  ui.message.textContent = data.message;
}

function localInput(prefix) {
  return {
    left: Boolean(keys[prefix === "p1" ? "KeyA" : "ArrowLeft"] || held[prefix + "Left"]),
    right: Boolean(keys[prefix === "p1" ? "KeyD" : "ArrowRight"] || held[prefix + "Right"]),
    jump: Boolean(keys[prefix === "p1" ? "KeyW" : "ArrowUp"] || held[prefix + "Jump"]),
    strike: Boolean(keys[prefix === "p1" ? "KeyF" : "Slash"])
  };
}

function rectHit(f, plat) {
  return f.x + f.r > plat.x && f.x - f.r < plat.x + plat.w && f.y + 66 > plat.y && f.y + 38 < plat.y + plat.h;
}

function botThink() {
  held.p2Left = false;
  held.p2Right = false;
  held.p2Jump = false;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  if (Math.abs(dx) > 64) held[dx < 0 ? "p2Left" : "p2Right"] = true;
  if ((dy < -46 || Math.random() < .01) && p2.grounded) held.p2Jump = true;
  if (Math.abs(dx) < weapons[weaponIndex].reach + 18 && Math.abs(dy) < 86 && Math.random() < .16) {
    strike(p2, p1);
  }
}

function moveFighter(f, enemy, input) {
  const left = keys[f.controls.left] || held[input + "Left"];
  const right = keys[f.controls.right] || held[input + "Right"];
  const jump = keys[f.controls.jump] || held[input + "Jump"];

  if (left) {
    f.vx -= f.stunned ? .12 : .5;
    f.facing = -1;
  }
  if (right) {
    f.vx += f.stunned ? .12 : .5;
    f.facing = 1;
  }
  if (jump && f.grounded && f.stunned < 6) {
    f.vy = -12.2;
    f.grounded = false;
  }

  f.vx += enemy.x > f.x ? .018 : -.018;
  f.vx *= f.grounded ? .88 : .96;
  f.vy += .62;
  f.x += f.vx;
  f.y += f.vy;
  f.grounded = false;

  for (const plat of arenas[arenaKey].platforms) {
    if (rectHit(f, plat) && f.vy >= 0) {
      f.y = plat.y - 66;
      f.vy = 0;
      f.grounded = true;
    }
  }

  if (f.x < 26) {
    f.x = 26;
    f.vx *= -.6;
  }
  if (f.x > canvas.width - 26) {
    f.x = canvas.width - 26;
    f.vx *= -.6;
  }

  f.cooldown = Math.max(0, f.cooldown - 1);
  f.attack = Math.max(0, f.attack - 1);
  f.stunned = Math.max(0, f.stunned - 1);
  f.wobble += .12 + Math.abs(f.vx) * .025;
}

function strike(f, enemy) {
  if (f.cooldown || freeze > 0 || paused || !running) return;
  f.attack = 17;
  f.cooldown = 30;
  const weapon = weapons[weaponIndex];
  const dx = enemy.x - f.x;
  const dy = enemy.y - f.y;
  const facingEnemy = Math.sign(dx) === f.facing || Math.abs(dx) < 10;
  if (facingEnemy && Math.abs(dx) < weapon.reach + 30 && Math.abs(dy) < 88) {
    enemy.health = Math.max(0, enemy.health - weapon.damage);
    enemy.vx += f.facing * (7.5 + weapon.damage * .12);
    enemy.vy -= 4.8 + weapon.damage * .04;
    enemy.stunned = 18;
    burst(enemy.x, enemy.y + 28, enemy.color, 22);
    shake = 10;
    ui.message.textContent = `${weapon.name} hit!`;
  }
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - .5) * 10,
      vy: (Math.random() - .85) * 9,
      life: 28 + Math.random() * 10,
      color
    });
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawArena() {
  const arena = arenas[arenaKey];
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, arena.sky[0]);
  sky.addColorStop(1, arena.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = arena.far;
  for (let i = 0; i < 7; i++) {
    const x = -80 + i * 175;
    ctx.beginPath();
    ctx.moveTo(x, 405);
    ctx.lineTo(x + 90, 130 + (i % 3) * 28);
    ctx.lineTo(x + 205, 405);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = arena.accent;
  for (let i = 0; i < 16; i++) {
    ctx.globalAlpha = .25;
    ctx.beginPath();
    ctx.arc(40 + i * 65, 80 + Math.sin(i) * 28, 18 + (i % 3) * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const p of arena.platforms) {
    ctx.fillStyle = arena.ground;
    roundRect(p.x, p.y, p.w, p.h, 8);
    ctx.fillStyle = arena.top;
    roundRect(p.x, p.y, p.w, 7, 6);
  }
}

function line(x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawFighter(f) {
  const bob = Math.sin(f.wobble) * 3;
  const hipY = f.y + 65;
  const chestY = f.y + 35 + bob;
  const headY = f.y + 14 + bob;
  const armSwing = f.attack ? Math.sin((17 - f.attack) / 17 * Math.PI) * 56 : Math.sin(f.wobble) * 10;
  const legSwing = Math.sin(f.wobble) * (f.grounded ? 18 : 6);

  line(f.x, chestY, f.x, hipY, 10, f.color);
  line(f.x, chestY + 5, f.x - 28 * f.facing, chestY + 35 + armSwing * .08, 9, f.color);
  line(f.x, chestY + 5, f.x + 28 * f.facing, chestY + 23 - Math.abs(armSwing) * .08, 9, f.color);
  line(f.x, hipY, f.x - 24 + legSwing, hipY + 45, 9, f.color);
  line(f.x, hipY, f.x + 24 - legSwing, hipY + 45, 9, f.color);

  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.arc(f.x, headY, f.r, 0, Math.PI * 2);
  ctx.fill();

  drawWeapon(f, chestY);
}

function drawWeapon(f, chestY) {
  const weapon = weapons[weaponIndex];
  const progress = f.attack ? Math.sin((17 - f.attack) / 17 * Math.PI) : 0;
  const baseX = f.x + 23 * f.facing;
  const baseY = chestY + 20;
  const tipX = baseX + f.facing * weapon.reach;
  const tipY = baseY - 20 + progress * 62;
  line(baseX, baseY, tipX, tipY, weapon.width, weapon.color);

  ctx.fillStyle = weapon.color;
  if (weapon.head === "hammer") {
    roundRect(tipX - 18, tipY - 15, 36, 30, 6);
  } else if (weapon.head === "spear") {
    ctx.beginPath();
    ctx.moveTo(tipX + f.facing * 22, tipY);
    ctx.lineTo(tipX - f.facing * 4, tipY - 12);
    ctx.lineTo(tipX - f.facing * 4, tipY + 12);
    ctx.closePath();
    ctx.fill();
  } else if (weapon.head === "drill") {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(tipX - f.facing * i * 9, tipY, 15 - i * 2, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 ? "#111" : "#ff8b2d";
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }
}

function drawParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += .35;
    p.life--;
    ctx.globalAlpha = Math.max(0, p.life / 32);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 6, 6);
    ctx.globalAlpha = 1;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function checkWin() {
  let winner = null;
  if (p1.health <= 0 || p1.y > canvas.height + 110) winner = "p2";
  if (p2.health <= 0 || p2.y > canvas.height + 110) winner = "p1";
  if (!winner) return;

  if (winner === "p1") state.p1Score++;
  else state.p2Score++;
  recordRound(winner);
  round++;
  resetRound(winner === "p1" ? "P1 wins the round!" : "P2 wins the round!");
}

function updateUi() {
  ui.p1Health.style.width = `${p1 ? p1.health : 100}%`;
  ui.p2Health.style.width = `${p2 ? p2.health : 100}%`;
  ui.p1Score.textContent = state.p1Score;
  ui.p2Score.textContent = state.p2Score;
  ui.roundText.textContent = `Round ${round}`;
  ui.weaponBtn.textContent = `Weapon: ${weapons[weaponIndex].name}`;
  ui.pauseBtn.textContent = paused ? "GO" : "II";
}

function drawOverlay(text) {
  ctx.fillStyle = "rgba(0, 0, 0, .25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "900 54px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function loop() {
  if (net.role === "join") {
    const now = performance.now();
    if (now - net.lastSend > 33) {
      sendNet({ type: "input", input: localInput("p2") });
      net.lastSend = now;
    }
  }

  const ox = shake ? (Math.random() - .5) * shake : 0;
  const oy = shake ? (Math.random() - .5) * shake : 0;
  shake = Math.max(0, shake - .8);
  ctx.save();
  ctx.translate(ox, oy);
  drawArena();
  if (running && !paused && net.role !== "join") {
    if (freeze > 0) {
      freeze--;
    } else {
      if (botMode) botThink();
      moveFighter(p1, p2, "p1");
      moveFighter(p2, p1, "p2");
      if (keys[p1.controls.strike]) strike(p1, p2);
      if (!botMode && keys[p2.controls.strike]) strike(p2, p1);
      checkWin();
      if (net.role === "host") {
        sendNet({
          type: "state",
          p1: packFighter(p1),
          p2: packFighter(p2),
          p1Score: state.p1Score,
          p2Score: state.p2Score,
          round,
          paused,
          weaponIndex,
          arenaKey,
          message: ui.message.textContent
        });
      }
    }
  }
  drawParticles();
  if (p1 && p2) {
    drawFighter(p1);
    drawFighter(p2);
  }
  ctx.restore();
  if (!running) drawOverlay("Stick Duel Arena");
  if (paused) drawOverlay("Paused");
  updateUi();
  requestAnimationFrame(loop);
}

function changeWeapon() {
  weaponIndex = (weaponIndex + 1) % weapons.length;
  ui.message.textContent = `Weapon changed: ${weapons[weaponIndex].name}`;
  if (net.role === "host") sendNet({ type: "arena", arenaKey, weaponIndex });
  saveLocal();
  updateUi();
}

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
  if (event.code === "Space") changeWeapon();
  if (event.code === "Escape") paused = !paused;
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

document.querySelectorAll("[data-hold]").forEach((button) => {
  const key = button.dataset.hold;
  const on = (event) => {
    event.preventDefault();
    held[key] = true;
  };
  const off = (event) => {
    event.preventDefault();
    held[key] = false;
  };
  button.addEventListener("pointerdown", on);
  button.addEventListener("pointerup", off);
  button.addEventListener("pointercancel", off);
  button.addEventListener("pointerleave", off);
});

document.querySelectorAll("[data-tap]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const actor = button.dataset.tap.startsWith("p1") ? p1 : p2;
    const enemy = actor === p1 ? p2 : p1;
    strike(actor, enemy);
  });
});

ui.playBtn.addEventListener("click", () => startGame(true));
ui.botBtn.addEventListener("click", () => startGame(false));
ui.hostBtn.addEventListener("click", () => startLan("host"));
ui.joinBtn.addEventListener("click", () => startLan("join"));
ui.weaponBtn.addEventListener("click", changeWeapon);
ui.pauseBtn.addEventListener("click", () => {
  if (running) paused = !paused;
});
ui.restartBtn.addEventListener("click", () => {
  if (running) resetRound("Restart!");
  else ui.menu.classList.remove("hidden");
});
ui.arenaSelect.addEventListener("change", () => {
  arenaKey = ui.arenaSelect.value;
  saveLocal();
});

ui.roomInput.addEventListener("change", saveLocal);
loadSave();
resetRound("Press Play");
running = false;
loop();
