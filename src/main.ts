import "./style.css";

const STORAGE_KEY = "dvd-screensaver:corner-hits";

/** Logo width clamp, in CSS pixels. */
const LOGO_MIN = 60;
const LOGO_MAX = 220;
/** Logo width as a fraction of the viewport's smaller edge. */
const LOGO_SCALE = 0.22;
/** Logo height = width / aspect. */
const LOGO_ASPECT = 2;
/** Travel speed in CSS pixels per second. */
const SPEED = 260;

const COLORS = [
  "#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#5ac8fa",
  "#007aff", "#5856d6", "#ff2d55", "#00c7be", "#af52de",
];

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const countEl = document.getElementById("corner-count")!;

let viewW = 0;
let viewH = 0;
let logoW = 0;
let logoH = 0;

let x = 0;
let y = 0;
let vx = 0;
let vy = 0;
let colorIndex = 0;

let cornerHits = loadCornerHits();
countEl.textContent = String(cornerHits);

function loadCornerHits(): number {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
}

function saveCornerHits(): void {
  localStorage.setItem(STORAGE_KEY, String(cornerHits));
}

/** Pick a new color that always differs from the current one. */
function nextColor(): void {
  colorIndex = (colorIndex + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length;
}

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  viewW = window.innerWidth;
  viewH = window.innerHeight;

  // High-DPI: backing store scaled by devicePixelRatio, CSS size = viewport.
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  logoW = Math.min(Math.max(Math.min(viewW, viewH) * LOGO_SCALE, LOGO_MIN), LOGO_MAX);
  logoH = logoW / LOGO_ASPECT;

  x = Math.min(Math.max(x, 0), Math.max(viewW - logoW, 0));
  y = Math.min(Math.max(y, 0), Math.max(viewH - logoH, 0));
}

function drawLogo(color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;

  // "DVD" lettering, italic-slanted like the original mark.
  ctx.save();
  ctx.translate(logoW / 2, logoH * 0.36);
  ctx.transform(1, 0, -0.22, 1, 0, 0);
  ctx.font = `900 ${logoH * 0.58}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DVD", 0, 0);
  ctx.restore();

  // Disc ring below the letters (filled annulus, even-odd).
  const cy = logoH * 0.74;
  ctx.beginPath();
  ctx.ellipse(logoW / 2, cy, logoW * 0.40, logoH * 0.20, 0, 0, Math.PI * 2);
  ctx.ellipse(logoW / 2, cy, logoW * 0.20, logoH * 0.095, 0, 0, Math.PI * 2);
  ctx.fill("evenodd");

  ctx.restore();
}

let last = performance.now();

function frame(now: number): void {
  // Delta-time step, clamped so a backgrounded tab doesn't teleport the logo.
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  x += vx * dt;
  y += vy * dt;

  let hitX = false;
  let hitY = false;
  if (x <= 0) {
    x = 0;
    vx = Math.abs(vx);
    hitX = true;
  } else if (x + logoW >= viewW) {
    x = viewW - logoW;
    vx = -Math.abs(vx);
    hitX = true;
  }
  if (y <= 0) {
    y = 0;
    vy = Math.abs(vy);
    hitY = true;
  } else if (y + logoH >= viewH) {
    y = viewH - logoH;
    vy = -Math.abs(vy);
    hitY = true;
  }

  if (hitX || hitY) {
    nextColor();
    if (hitX && hitY) {
      cornerHits += 1;
      countEl.textContent = String(cornerHits);
      saveCornerHits();
    }
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, viewW, viewH);
  drawLogo(COLORS[colorIndex]);

  requestAnimationFrame(frame);
}

resize();

// Start somewhere sensible, moving diagonally.
x = viewW * 0.25;
y = viewH * 0.3;
const angle = Math.PI / 4 + Math.random() * 0.4;
vx = SPEED * Math.cos(angle) * (Math.random() < 0.5 ? 1 : -1);
vy = SPEED * Math.sin(angle) * (Math.random() < 0.5 ? 1 : -1);

window.addEventListener("resize", resize);
requestAnimationFrame(frame);
