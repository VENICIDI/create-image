function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hslToCss(h, s, l) {
  return `hsl(${h} ${s}% ${l}%)`;
}

function pickLightColor() {
  const h = randInt(0, 359);
  const s = randInt(12, 28);
  const l = randInt(78, 92);
  return { h, s, l, css: hslToCss(h, s, l) };
}

function setStatus(text) {
  const el = document.getElementById('status');
  el.textContent = text;
}

function drawGradient({ width, height, direction }) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  canvas.width = width;
  canvas.height = height;

  const c1 = pickLightColor();
  const c2 = pickLightColor();

  let grad;
  if (direction === 'horizontal') {
    grad = ctx.createLinearGradient(0, 0, width, 0);
  } else if (direction === 'vertical') {
    grad = ctx.createLinearGradient(0, 0, 0, height);
  } else if (direction === 'radial') {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) * 0.55;
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else {
    grad = ctx.createLinearGradient(0, 0, width, height);
  }

  // 再加一个中间色，过渡更柔和
  const mid = {
    h: Math.round((c1.h + c2.h) / 2),
    s: clamp(Math.round((c1.s + c2.s) / 2), 10, 30),
    l: clamp(Math.round((c1.l + c2.l) / 2) + randInt(0, 4), 78, 94),
  };

  grad.addColorStop(0, c1.css);
  grad.addColorStop(0.5, hslToCss(mid.h, mid.s, mid.l));
  grad.addColorStop(1, c2.css);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  return { c1, c2, mid };
}

function downloadPng() {
  const canvas = document.getElementById('canvas');
  const a = document.createElement('a');
  a.download = `gradient_${canvas.width}x${canvas.height}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function getSize() {
  const wEl = document.getElementById('width');
  const hEl = document.getElementById('height');

  const width = clamp(parseInt(wEl.value, 10) || 0, 16, 8192);
  const height = clamp(parseInt(hEl.value, 10) || 0, 16, 8192);

  wEl.value = String(width);
  hEl.value = String(height);

  return { width, height };
}

function init() {
  const electronVersionEl = document.getElementById('electronVersion');
  electronVersionEl.textContent = window.app?.version ?? 'unknown';

  const generateBtn = document.getElementById('generate');
  const downloadBtn = document.getElementById('download');
  const directionEl = document.getElementById('direction');

  const doGenerate = () => {
    const { width, height } = getSize();
    const direction = directionEl.value;

    generateBtn.disabled = true;
    setStatus('生成中...');

    // 让 UI 先刷新
    setTimeout(() => {
      const { c1, c2 } = drawGradient({ width, height, direction });
      setStatus(`完成：${width}x${height}，颜色：${c1.css} → ${c2.css}`);
      generateBtn.disabled = false;
    }, 0);
  };

  generateBtn.addEventListener('click', doGenerate);
  downloadBtn.addEventListener('click', downloadPng);

  // 初始生成一张
  doGenerate();
}

init();
