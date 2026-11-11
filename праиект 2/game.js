const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  menu: document.getElementById("menu"),
  playBtn: document.getElementById("playBtn"),
  heroSkinBtn: document.getElementById("heroSkinBtn"),
  monsterSkinBtn: document.getElementById("monsterSkinBtn"),
  levelSelect: document.getElementById("levelSelect"),
  heroSkinText: document.getElementById("heroSkinText"),
  monsterSkinText: document.getElementById("monsterSkinText"),
  pauseBtn: document.getElementById("pauseBtn"),
  restartBtn: document.getElementById("restartBtn"),
  levelText: document.getElementById("levelText"),
  distanceText: document.getElementById("distanceText"),
  livesText: document.getElementById("livesText"),
  dangerText: document.getElementById("dangerText"),
  message: document.getElementById("message")
};

const keys = Object.create(null);
const held = Object.create(null);
const floorY = 442;
const roofY = 98;
const maxLevel = 100;

const heroSkins = [
  { name: "Neon", body: "#39d6ff", suit: "#13233b", hair: "#f5d24b" },
  { name: "Runner", body: "#65f28a", suit: "#17351f", hair: "#20242d" },
  { name: "Fire", body: "#ff6b38", suit: "#3b1b13", hair: "#ffe66d" },
  { name: "Ghost", body: "#e9f5ff", suit: "#657182", hair: "#b9d7ff" }
];

const monsterSkins = [
  { name: "Shadow", body: "#14171d", head: "#232831", mouth: "#e2442f", eye: "#f5d24b" },
  { name: "Toxic", body: "#17331f", head: "#28583a", mouth: "#50ef7b", eye: "#eaff5b" },
  { name: "Lava", body: "#321611", head: "#5a2118", mouth: "#ff6b38", eye: "#ffd25b" },
  { name: "Ice", body: "#203241", head: "#365b73", mouth: "#a8e8ff", eye: "#ffffff" }
];

let running = false;
let paused = false;
let won = false;
let lost = false;
let shake = 0;
let selectedLevel = 1;
let heroSkinIndex = 0;
let monsterSkinIndex = 0;

const state = {
  camera: 0,
  time: 0,
  length: 4400,
  difficulty: 1,
  gravity: 0.78,
  hero: null,
  monster: null,
  obstacles: [],
  particles: []
};

for (let i = 1; i <= maxLevel; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `Level ${i}`;
  ui.levelSelect.appendChild(option);
}

function makeHero() {
  return { x: 160, y: floorY - 86, w: 42, h: 86, vx: 0, vy: 0, grounded: true, slide: 0, invincible: 0, lives: 3, run: 0, flipped: false };
}

function makeMonster() {
  return { x: -210, y: floorY - 178, w: 188, h: 178, bite: 0, chew: 0, run: 0 };
}

function seeded(level, index) {
  const n = Math.sin(level * 999 + index * 77) * 10000;
  return n - Math.floor(n);
}

function makeLevel(level) {
  const obstacles = [];
  const diff = 1 + level * 0.045;
  state.length = 3600 + level * 62;
  state.difficulty = diff;
  state.gravity = 0.76 + Math.min(0.18, level * 0.002);

  let x = 430;
  let i = 0;
  while (x < state.length - 500) {
    const r = seeded(level, i++);
    const gap = Math.max(145, 285 - level * 1.3);
    x += gap + r * 120;
    if (level > 7 && i % 7 === 0) {
      obstacles.push({ type: "flip", x, y: roofY, w: 34, h: floorY - roofY });
      x += 120;
      continue;
    }
    if (level > 10 && i % 6 === 0) {
      obstacles.push({ type: "turn", x, y: floorY - 150, w: 92, h: 150 });
      continue;
    }
    if (level > 4 && r > 0.82) {
      obstacles.push({ type: "gap", x, y: floorY, w: 120 + level * .8, h: 130 });
    } else if (level > 12 && r > 0.66) {
      obstacles.push({ type: "mini", x, y: floorY - 54, w: 50, h: 54, phase: r * 100 });
    } else if (r > 0.43) {
      obstacles.push({ type: "spike", x, y: floorY - 38, w: 84 + Math.min(70, level), h: 38 });
    } else if (r > 0.22) {
      obstacles.push({ type: "wall", x, y: floorY - (96 + Math.min(64, level)), w: 44, h: 96 + Math.min(64, level) });
    } else {
      obstacles.push({ type: "crate", x, y: floorY - 58, w: 58, h: 58 });
    }
  }
  return obstacles;
}

function startGame() {
  selectedLevel = Number(ui.levelSelect.value || 1);
  state.hero = makeHero();
  state.monster = makeMonster();
  state.obstacles = makeLevel(selectedLevel);
  state.camera = 0;
  state.time = 0;
  state.particles.length = 0;
  running = true;
  paused = false;
  won = false;
  lost = false;
  ui.menu.classList.add("hidden");
  ui.message.textContent = `Level ${selectedLevel}: run`;
}

function inputActive(name) {
  if (name === "left") return keys.ArrowLeft || keys.KeyA || held.left;
  if (name === "right") return keys.ArrowRight || keys.KeyD || held.right;
  if (name === "jump") return keys.ArrowUp || keys.KeyW || keys.Space || held.jump;
  if (name === "slide") return keys.ArrowDown || keys.KeyS || held.slide;
  return false;
}

function groundLine(hero) {
  return hero.flipped ? roofY : floorY;
}

function heroBox(hero) {
  if (hero.slide > 0) return { x: hero.x + 2, y: hero.y + 38, w: hero.w + 18, h: 45 };
  return { x: hero.x + 4, y: hero.y + 6, w: hero.w - 8, h: hero.h - 8 };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inGap(hero) {
  if (hero.flipped) return false;
  const center = hero.x + hero.w * .5;
  return state.obstacles.some((o) => o.type === "gap" && center > o.x && center < o.x + o.w);
}

function hitHero(reason) {
  const hero = state.hero;
  if (hero.invincible > 0 || won || lost) return;
  hero.lives--;
  hero.invincible = 88;
  hero.vx = 5.8;
  hero.vy = hero.flipped ? 8 : -8;
  shake = 18;
  burst(hero.x + 22, hero.y + 38, heroSkins[heroSkinIndex].body, 28);
  ui.message.textContent = reason;
  if (hero.lives <= 0) {
    lost = true;
    running = false;
    ui.message.textContent = "Caught by the monster";
  }
}

function update() {
  if (!running || paused) return;
  const hero = state.hero;
  const monster = state.monster;
  const g = hero.flipped ? -state.gravity : state.gravity;
  state.time++;

  if (inputActive("left")) hero.vx -= .34;
  if (inputActive("right")) hero.vx += .66;
  hero.vx += .12 + selectedLevel * .002;
  hero.vx = Math.max(-4.2, Math.min(9.6 + selectedLevel * .025, hero.vx));

  if (inputActive("jump") && hero.grounded) {
    hero.vy = hero.flipped ? 15.1 : -15.1;
    hero.grounded = false;
    burst(hero.x + 22, hero.flipped ? hero.y : hero.y + hero.h, "#d7dee7", 10);
  }

  hero.slide = inputActive("slide") && hero.grounded ? 28 : Math.max(0, hero.slide - 1);
  hero.vy += g;
  hero.x += hero.vx;
  hero.y += hero.vy;
  hero.vx *= hero.grounded ? .88 : .96;
  hero.grounded = false;

  const line = groundLine(hero);
  if (!hero.flipped && hero.y + hero.h >= line && !inGap(hero)) {
    hero.y = line - hero.h;
    hero.vy = 0;
    hero.grounded = true;
  }
  if (hero.flipped && hero.y <= line) {
    hero.y = line;
    hero.vy = 0;
    hero.grounded = true;
  }

  if (hero.y > canvas.height + 50 || hero.y < -120) hitHero("Fall");
  hero.x = Math.max(60, hero.x);
  hero.invincible = Math.max(0, hero.invincible - 1);
  hero.run += Math.abs(hero.vx) * .16 + .22;

  const chaseBase = 3.3 + selectedLevel * .022;
  const catchUp = hero.x - monster.x > 560 ? 5.8 + selectedLevel * .018 : chaseBase;
  monster.x += catchUp + Math.max(0, (hero.x - monster.x - 420) * .006);
  monster.run += .18 + selectedLevel * .001;
  monster.chew += .22;
  monster.bite = Math.max(0, monster.bite - 1);

  const box = heroBox(hero);
  for (const obstacle of state.obstacles) {
    if (obstacle.type === "gap") continue;
    const moving = obstacle.type === "mini" ? { ...obstacle, x: obstacle.x - Math.sin(state.time * .07 + obstacle.phase) * 54 } : obstacle;
    if (moving.type === "flip" && intersects(box, moving)) {
      hero.flipped = !hero.flipped;
      hero.vy = hero.flipped ? -3 : 3;
      burst(hero.x + 22, hero.y + 42, "#e2442f", 18);
      obstacle.x -= 99999;
      ui.message.textContent = hero.flipped ? "Gravity up" : "Gravity down";
      continue;
    }
    if (intersects(box, moving)) {
      if (moving.type === "spike") hitHero("Spikes");
      else if (moving.type === "mini") hitHero("Little monster hit");
      else if (moving.type === "turn") hitHero("Sharp turn");
      else if (moving.type === "wall") hitHero("Wall");
      else hitHero("Crate");
      break;
    }
  }

  if (hero.x < monster.x + monster.w - 26) {
    monster.bite = 24;
    hitHero("Big bite");
  }

  if (hero.x >= state.length) {
    won = true;
    running = false;
    ui.message.textContent = selectedLevel < maxLevel ? "Finish! Next level unlocked" : "All 100 levels cleared";
    if (selectedLevel < maxLevel) {
      ui.levelSelect.value = String(selectedLevel + 1);
    }
  }

  state.camera = Math.max(0, Math.min(state.length - 620, hero.x - 260));
  updateParticles();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    state.particles.push({ x, y, vx: (Math.random() - .5) * 9, vy: (Math.random() - .9) * 8, life: 22 + Math.random() * 18, color });
  }
}

function updateParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += .28;
    p.life--;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawBackground() {
  const cam = state.camera;
  const pulse = Math.sin(state.time * .05) * 8;
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#aab4c0");
  sky.addColorStop(.5, "#747f8c");
  sky.addColorStop(.51, "#2d333c");
  sky.addColorStop(1, "#171a20");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#5f6976";
  for (let i = 0; i < 11; i++) ctx.fillRect(i * 150 - (cam * .22 % 150), 130 + (i % 3) * 22, 88, 225);

  ctx.fillStyle = "#11151b";
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
  ctx.fillRect(0, 0, canvas.width, roofY);
  ctx.fillStyle = "#3b444f";
  for (let i = 0; i < 44; i++) {
    ctx.fillRect(i * 44 - (cam % 44), floorY, 24, 8);
    ctx.fillRect(i * 44 - (cam % 44), roofY - 8, 24, 8);
  }

  const eatX = state.monster ? state.monster.x - state.camera + 150 : -999;
  ctx.fillStyle = "rgba(226,68,47,.24)";
  ctx.fillRect(0, 0, Math.max(0, eatX + pulse), canvas.height);
}

function drawLevel() {
  const cam = state.camera;
  for (const obstacle of state.obstacles) {
    const movingX = obstacle.type === "mini" ? obstacle.x - Math.sin(state.time * .07 + obstacle.phase) * 54 : obstacle.x;
    const x = movingX - cam;
    if (x < -220 || x > canvas.width + 220) continue;
    if (obstacle.type === "gap") {
      ctx.fillStyle = "#07090d";
      ctx.fillRect(x, floorY, obstacle.w, canvas.height - floorY);
      ctx.fillStyle = "#e2442f";
      ctx.fillRect(x + 12, floorY + 70, obstacle.w - 24, 8);
    } else if (obstacle.type === "spike") {
      ctx.fillStyle = "#dce7f2";
      for (let sx = 0; sx < obstacle.w; sx += 28) {
        ctx.beginPath();
        ctx.moveTo(x + sx, floorY);
        ctx.lineTo(x + sx + 14, floorY - 38);
        ctx.lineTo(x + sx + 28, floorY);
        ctx.closePath();
        ctx.fill();
      }
    } else if (obstacle.type === "flip") {
      ctx.fillStyle = "#e2442f";
      roundRect(x, obstacle.y, obstacle.w, obstacle.h, 12);
      ctx.fillStyle = "#fff";
      ctx.font = "900 24px Arial";
      ctx.fillText("G", x + 7, floorY - 162);
    } else if (obstacle.type === "mini") {
      drawMiniMonster(x, obstacle.y, obstacle.w, obstacle.h);
    } else {
      ctx.fillStyle = obstacle.type === "turn" ? "#6650e8" : obstacle.type === "wall" ? "#4a5562" : "#8b5a37";
      roundRect(x, obstacle.y, obstacle.w, obstacle.h, 6);
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(x + 7, obstacle.y + 7, Math.max(8, obstacle.w - 14), 6);
    }
  }

  const finishX = state.length - cam;
  ctx.fillStyle = "#f5d24b";
  ctx.fillRect(finishX, floorY - 170, 10, 170);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? "#11151b" : "#f6f8fb";
    ctx.fillRect(finishX + 10, floorY - 170 + i * 24, 74, 24);
  }
}

function drawMiniMonster(x, y, w, h) {
  ctx.fillStyle = "#2b1014";
  roundRect(x, y + 12, w, h - 12, 14);
  ctx.fillStyle = "#ff4c5b";
  ctx.beginPath();
  ctx.arc(x + 15, y + 20, 6, 0, Math.PI * 2);
  ctx.arc(x + 34, y + 20, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 10, y + 38, 28, 5);
}

function drawHero() {
  const hero = state.hero;
  const skin = heroSkins[heroSkinIndex];
  const x = hero.x - state.camera;
  const y = hero.y;
  if (hero.invincible > 0 && Math.floor(hero.invincible / 6) % 2 === 0) return;

  ctx.save();
  ctx.translate(x + hero.w / 2, y + hero.h / 2);
  if (hero.flipped) ctx.scale(1, -1);
  if (hero.slide > 0) ctx.rotate(-.35);
  const leg = Math.sin(hero.run) * 19;
  const arm = Math.cos(hero.run) * 16;
  ctx.fillStyle = skin.suit;
  roundRect(-22, -8 + arm * .08, 11, 42, 6);
  roundRect(13, -8 - arm * .08, 11, 42, 6);
  roundRect(-19, 20, 13, 34 + leg * .2, 6);
  roundRect(8, 20, 13, 34 - leg * .2, 6);
  ctx.fillStyle = skin.body;
  roundRect(-20, -28, 40, 56, 12);
  ctx.fillStyle = "#f2c19a";
  ctx.beginPath();
  ctx.arc(0, -45, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#11151b";
  ctx.fillRect(5, -48, 5, 4);
  ctx.fillStyle = skin.hair;
  roundRect(-24, -60, 40, 14, 8);
  ctx.restore();
}

function drawMonster() {
  const monster = state.monster;
  const skin = monsterSkins[monsterSkinIndex];
  const x = monster.x - state.camera;
  const y = monster.y + Math.sin(monster.run) * 7;
  const mouth = monster.bite > 0 ? 30 : 11 + Math.sin(monster.chew) * 7;

  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(x + 96, floorY + 8, 106, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.body;
  roundRect(x + 16, y + 42, monster.w - 28, 112, 36);
  ctx.fillStyle = skin.head;
  ctx.beginPath();
  ctx.arc(x + 96, y + 50, 76, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.eye;
  ctx.beginPath();
  ctx.arc(x + 62, y + 36, 13, 0, Math.PI * 2);
  ctx.arc(x + 124, y + 36, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.mouth;
  roundRect(x + 47, y + 72, 98, 28 + mouth, 12);
  ctx.fillStyle = "#f6f8fb";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 52 + i * 15, y + 72);
    ctx.lineTo(x + 60 + i * 15, y + 93);
    ctx.lineTo(x + 68 + i * 15, y + 72);
    ctx.fill();
  }
  ctx.fillStyle = skin.body;
  const step = Math.sin(monster.run) * 10;
  roundRect(x + 20, y + 130 + step, 38, 64, 14);
  roundRect(x + 132, y + 130 - step, 38, 64, 14);
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / 34);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - state.camera, p.y, 6, 6);
    ctx.globalAlpha = 1;
  }
}

function drawOverlay(text) {
  ctx.fillStyle = "rgba(0,0,0,.46)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "900 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function updateUi() {
  const hero = state.hero;
  const monster = state.monster;
  const distance = hero ? Math.max(0, Math.floor(hero.x / 10)) : 0;
  const danger = hero && monster ? Math.floor((hero.x - monster.x) / 10) : 0;
  ui.levelText.textContent = `${selectedLevel} / ${maxLevel}`;
  ui.distanceText.textContent = `${distance} m`;
  ui.livesText.textContent = hero ? hero.lives : 3;
  ui.dangerText.textContent = danger < 22 ? "close" : danger < 45 ? "near" : "far";
  ui.pauseBtn.textContent = paused ? "GO" : "II";
  ui.heroSkinText.textContent = `Hero: ${heroSkins[heroSkinIndex].name}`;
  ui.monsterSkinText.textContent = `Monster: ${monsterSkins[monsterSkinIndex].name}`;
}

function loop() {
  update();
  const ox = shake ? (Math.random() - .5) * shake : 0;
  const oy = shake ? (Math.random() - .5) * shake : 0;
  shake = Math.max(0, shake - .7);
  ctx.save();
  ctx.translate(ox, oy);
  drawBackground();
  drawLevel();
  if (state.monster) drawMonster();
  if (state.hero) drawHero();
  drawParticles();
  ctx.restore();
  if (!running && !won && !lost) drawOverlay("Monster Chase");
  if (paused) drawOverlay("Paused");
  if (won) drawOverlay("Level Clear");
  if (lost) drawOverlay("Game Over");
  updateUi();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
  if (event.code === "Escape" && state.hero) paused = !paused;
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

document.querySelector("[data-tap='jump']").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  held.jump = true;
  setTimeout(() => {
    held.jump = false;
  }, 120);
});

ui.playBtn.addEventListener("click", startGame);
ui.restartBtn.addEventListener("click", startGame);
ui.pauseBtn.addEventListener("click", () => {
  if (state.hero) paused = !paused;
});
ui.heroSkinBtn.addEventListener("click", () => {
  heroSkinIndex = (heroSkinIndex + 1) % heroSkins.length;
  updateUi();
});
ui.monsterSkinBtn.addEventListener("click", () => {
  monsterSkinIndex = (monsterSkinIndex + 1) % monsterSkins.length;
  updateUi();
});
ui.levelSelect.addEventListener("change", () => {
  selectedLevel = Number(ui.levelSelect.value);
  updateUi();
});

startGame();
running = false;
ui.menu.classList.remove("hidden");
loop();
