/* 飞机大战 — 纯 Canvas 实现 */
(() => {
  'use strict';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 400, H = 600;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);

  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovSub = document.getElementById('ov-sub');

  let player, bullets, enemies, booms, stars;
  let score, lives, alive, last, fireT, enemyT, enemyLevel;

  stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.5 }));

  function reset() {
    player = { x: W / 2, y: H - 60, w: 34, h: 30, speed: 5 };
    bullets = []; enemies = []; booms = [];
    score = 0; lives = 3; alive = true; fireT = 0; enemyT = 0; enemyLevel = 0;
    scoreEl.textContent = '0'; livesEl.textContent = lives;
    overlay.classList.add('hidden');
  }

  function spawnEnemy() {
    const r = 12 + Math.random() * 10;
    enemies.push({ x: r + Math.random() * (W - 2 * r), y: -r, r, vy: 1.2 + Math.random() * 1.4 + enemyLevel * 0.15, hp: 1 + (Math.random() < 0.25 ? 1 : 0) });
  }

  function update(dt) {
    // 星空
    stars.forEach(s => { s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

    // 开火
    fireT += dt;
    if (fireT > 280) { fireT = 0; bullets.push({ x: player.x, y: player.y - player.h / 2, vy: -8 }); }

    // 子弹
    bullets.forEach(b => b.y += b.vy);
    bullets = bullets.filter(b => b.y > -10);

    // 敌机
    enemyT += dt;
    if (enemyT > Math.max(420, 900 - enemyLevel * 40)) { enemyT = 0; enemyLevel++; spawnEnemy(); }
    enemies.forEach(e => e.y += e.vy);
    enemies = enemies.filter(e => {
      if (e.y - e.r > H) { loseLife(); return false; }
      return true;
    });

    // 子弹 vs 敌机
    for (const b of bullets) {
      for (const e of enemies) {
        if (Math.abs(b.x - e.x) < e.r && Math.abs(b.y - e.y) < e.r) {
          b.dead = true; e.hp--;
          if (e.hp <= 0) { e.dead = true; score += 10; scoreEl.textContent = score; booms.push({ x: e.x, y: e.y, t: 0, r: e.r }); }
          break;
        }
      }
    }
    bullets = bullets.filter(b => !b.dead);
    enemies = enemies.filter(e => !e.dead);

    // 敌机 vs 玩家
    for (const e of enemies) {
      if (Math.abs(e.x - player.x) < e.r + player.w / 2 - 6 && Math.abs(e.y - player.y) < e.r + player.h / 2 - 6) {
        e.dead = true; booms.push({ x: e.x, y: e.y, t: 0, r: e.r }); loseLife();
      }
    }
    enemies = enemies.filter(e => !e.dead);

    // 爆炸动画
    booms.forEach(bo => bo.t += dt);
    booms = booms.filter(bo => bo.t < 350);
  }

  function loseLife() {
    lives--; livesEl.textContent = lives;
    if (lives <= 0) {
      alive = false;
      ovTitle.textContent = '游戏结束';
      ovSub.textContent = '得分 ' + score;
      overlay.classList.remove('hidden');
    }
  }

  function draw() {
    ctx.fillStyle = '#11133f'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

    // 玩家
    if (alive) {
      ctx.fillStyle = '#4fd1ff';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - player.h / 2);
      ctx.lineTo(player.x - player.w / 2, player.y + player.h / 2);
      ctx.lineTo(player.x, player.y + player.h / 4);
      ctx.lineTo(player.x + player.w / 2, player.y + player.h / 2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#bff4ff';
      ctx.fillRect(player.x - 3, player.y - player.h / 2 - 8, 6, 10);
    }

    // 子弹
    ctx.fillStyle = '#ffe66d';
    bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 8, 4, 12));

    // 敌机
    enemies.forEach(e => {
      ctx.fillStyle = '#ff5c7a';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x - 3, e.y - 3, 6, 6);
    });

    // 爆炸
    booms.forEach(bo => {
      const a = 1 - bo.t / 350;
      ctx.strokeStyle = 'rgba(255,180,80,' + a + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(bo.x, bo.y, bo.r + bo.t / 12, 0, Math.PI * 2); ctx.stroke();
    });
  }

  function loop(t) {
    const dt = Math.min(40, t - last); last = t;
    if (alive) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // 输入
  const KEY = { ArrowLeft: -1, ArrowRight: 1, a: -1, d: 1, A: -1, D: 1 };
  window.addEventListener('keydown', (e) => {
    if (KEY[e.key] !== undefined) { e.preventDefault(); if (alive) player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x + KEY[e.key] * player.speed * 3)); }
  });
  function moveTo(clientX) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width * W;
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, x));
  }
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveTo(e.changedTouches[0].clientX); }, { passive: false });
  canvas.addEventListener('touchstart', (e) => { moveTo(e.changedTouches[0].clientX); }, { passive: true });
  canvas.addEventListener('mousemove', (e) => { if (alive) moveTo(e.clientX); });

  function start() { reset(); last = performance.now(); }
  document.getElementById('new').addEventListener('click', start);
  document.getElementById('ov-btn').addEventListener('click', start);

  reset();
  overlay.classList.remove('hidden');
  requestAnimationFrame(loop);
})();
